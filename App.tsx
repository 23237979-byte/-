import React, { useState } from 'react';
import { FileText, Upload, Download, Loader2, Key } from 'lucide-react';
import { extractTextFromDocx, readFileAsText } from './utils/docParser';
import { parseQuestionsWithGemini } from './services/geminiService';
import { generateExcel } from './services/excelService';
import PreviewTable from './components/PreviewTable';
import { QuestionData } from './types';

function App() {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Note: For a real deployed app, handling API keys client-side needs care.
  // We use the environment variable if available, or allow manual input for the demo.
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      let text = '';
      if (file.name.endsWith('.docx')) {
        text = await extractTextFromDocx(file);
      } else {
        text = await readFileAsText(file);
      }
      setInputText(text);
    } catch (err) {
      setError('读取文件失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParse = async () => {
    if (!inputText.trim()) {
      setError("请输入题目文本或上传文件");
      return;
    }
    if (!apiKey) {
      setError("请先设置 Google Gemini API Key");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const parsedQuestions = await parseQuestionsWithGemini(inputText, apiKey);
      setQuestions(parsedQuestions);
    } catch (err: any) {
      setError(err.message || "解析失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (questions.length === 0) return;
    generateExcel(questions);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <FileText className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Excel 题库生成器</h1>
              <p className="text-xs text-gray-500">Word/文本转 Excel 模版</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!process.env.API_KEY && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1.5 border border-gray-300">
                <Key className="w-4 h-4 text-gray-500"/>
                <input 
                  type="password" 
                  placeholder="Enter Gemini API Key" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm w-40"
                />
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={questions.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                questions.length > 0 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download size={18} />
              导出 Excel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left Panel: Input */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-500"/> 
                1. 输入题目
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">上传文件 (.docx, .txt)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-gray-50 text-center cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".docx,.txt" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500 group-hover:text-gray-700">点击上传或拖拽文件到此处</p>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">或直接粘贴文本</label>
                <textarea
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-none"
                  placeholder={`例：
1. 请问UMU互动是一款什么样的产品？
A. 体育产品
B. 教育培训产品
C. 音乐产品
答案：B

2. 使用UMU互动的感受？(开放式)
                  `}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <button
                onClick={handleParse}
                disabled={isLoading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    正在 AI 解析中...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    开始生成 (AI)
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
              <strong>提示：</strong> AI 会自动识别单选、多选和简答题。生成后请在右侧预览表格中仔细核对内容，确保无误后再导出。
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-2 flex flex-col">
             {questions.length > 0 ? (
               <PreviewTable questions={questions} setQuestions={setQuestions} />
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200 min-h-[500px] text-gray-400">
                 <div className="bg-gray-50 p-4 rounded-full mb-4">
                   <FileText size={48} className="text-gray-300" />
                 </div>
                 <p className="text-lg font-medium">暂无数据</p>
                 <p className="text-sm">请在左侧上传文件或输入文本并点击生成</p>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;