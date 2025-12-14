import React from 'react';
import { QuestionData, QuestionType, Difficulty } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface PreviewTableProps {
  questions: QuestionData[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionData[]>>;
}

const PreviewTable: React.FC<PreviewTableProps> = ({ questions, setQuestions }) => {

  const handleChange = (id: string, field: keyof QuestionData, value: string | number) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleAdd = () => {
    const newQ: QuestionData = {
        id: `new-${Date.now()}`,
        description: '',
        type: QuestionType.Single,
        correctAnswer: '',
        score: 10,
        difficulty: Difficulty.Medium,
        explanation: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: ''
    };
    setQuestions([...questions, newQ]);
  };

  if (questions.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700">预览 & 编辑 ({questions.length})</h2>
        <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
            <Plus size={16} /> 添加题目
        </button>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#006400] sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">问题描述*</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-24">题型*</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-24">正确答案</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-16">分值</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-16">难度</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-32">选项A</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-32">选项B</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-32">选项C</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-32">选项D</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-12">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((q, idx) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                <td className="px-3 py-2">
                  <textarea
                    rows={2}
                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={q.description}
                    onChange={(e) => handleChange(q.id, 'description', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={q.type}
                    onChange={(e) => handleChange(q.id, 'type', e.target.value as QuestionType)}
                  >
                    {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={q.correctAnswer}
                    onChange={(e) => handleChange(q.id, 'correctAnswer', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={q.score}
                    onChange={(e) => handleChange(q.id, 'score', parseFloat(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                   <select
                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={q.difficulty}
                    onChange={(e) => handleChange(q.id, 'difficulty', e.target.value as Difficulty)}
                  >
                    {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={q.type === QuestionType.Open}
                    type="text"
                    className={`w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 ${q.type === QuestionType.Open ? 'bg-gray-100' : ''}`}
                    value={q.optionA}
                    onChange={(e) => handleChange(q.id, 'optionA', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={q.type === QuestionType.Open}
                    type="text"
                    className={`w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 ${q.type === QuestionType.Open ? 'bg-gray-100' : ''}`}
                    value={q.optionB}
                    onChange={(e) => handleChange(q.id, 'optionB', e.target.value)}
                  />
                </td>
                 <td className="px-3 py-2">
                  <input
                    disabled={q.type === QuestionType.Open}
                    type="text"
                    className={`w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 ${q.type === QuestionType.Open ? 'bg-gray-100' : ''}`}
                    value={q.optionC}
                    onChange={(e) => handleChange(q.id, 'optionC', e.target.value)}
                  />
                </td>
                 <td className="px-3 py-2">
                  <input
                    disabled={q.type === QuestionType.Open}
                    type="text"
                    className={`w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 ${q.type === QuestionType.Open ? 'bg-gray-100' : ''}`}
                    value={q.optionD}
                    onChange={(e) => handleChange(q.id, 'optionD', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewTable;