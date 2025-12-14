import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionData, QuestionType, Difficulty } from "../types";

// Define the expected schema for Gemini output
const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "The content of the question" },
          type: { type: Type.STRING, enum: [QuestionType.Single, QuestionType.Multiple, QuestionType.Open] },
          correctAnswer: { type: Type.STRING, description: "For single choice: A, B, C, D. For multi: ABC. For open: the answer text." },
          score: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, enum: [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard] },
          explanation: { type: Type.STRING },
          optionA: { type: Type.STRING },
          optionB: { type: Type.STRING },
          optionC: { type: Type.STRING },
          optionD: { type: Type.STRING },
        },
        required: ["description", "type", "correctAnswer"],
      },
    },
  },
};

export const parseQuestionsWithGemini = async (text: string, apiKey: string): Promise<QuestionData[]> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an assistant that extracts exam questions from text.
    Analyze the following text and extract examination questions.
    
    Rules:
    1. Identify the Question Type: '单选题' (Single Choice), '多选题' (Multiple Choice), or '开放式问题' (Open-ended).
    2. Extract Options: Put options into optionA, optionB, optionC, optionD. If it's an open-ended question, leave options empty.
    3. Correct Answer: 
       - Single choice: single letter (e.g., 'A').
       - Multiple choice: letters concatenated (e.g., 'ABC').
       - Open: the text answer.
    4. Difficulty: Default to '中' (Medium) if not specified.
    5. Score: Default to 10 for Single, 20 for Multiple, 10 for Open if not specified.
    6. Explanation: Extract if available, otherwise empty string.

    Here is the text to parse:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.2, // Low temperature for deterministic extraction
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    
    // Add IDs and ensure defaults
    return parsed.questions.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      description: q.description || "",
      type: q.type || QuestionType.Single,
      correctAnswer: q.correctAnswer || "",
      score: q.score || 10,
      difficulty: q.difficulty || Difficulty.Medium,
      explanation: q.explanation || "",
      optionA: q.optionA || "",
      optionB: q.optionB || "",
      optionC: q.optionC || "",
      optionD: q.optionD || "",
    }));

  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse text with AI. Please check the content and try again.");
  }
};