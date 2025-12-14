export enum QuestionType {
  Single = '单选题',
  Multiple = '多选题',
  Open = '开放式问题'
}

export enum Difficulty {
  Easy = '易',
  Medium = '中',
  Hard = '难'
}

export interface QuestionData {
  id: string;
  description: string;
  type: QuestionType;
  correctAnswer: string;
  score: number;
  difficulty: Difficulty;
  explanation: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string; // Optional expansion
  optionF?: string; // Optional expansion
}

export interface ParseResult {
  questions: QuestionData[];
}