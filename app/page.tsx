'use client';

import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!topic || !goal) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, goal }),
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert('服务繁忙，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-blue-800 uppercase bg-blue-100 rounded-full">
            Powered by DeepSeek
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Pareto 80/20 Learner</h1>
          <p className="text-slate-600">DeepSeek 大脑为你规划极简学习路径。</p>
        </header>

        {/* Input Section */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 border border-slate-100">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">我想学习 (技能/工具)</label>
              <input 
                type="text" 
                placeholder="例如：Python, 视频剪辑, 英语口语"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">目标是能完成 (具体项目)</label>
              <input 
                type="text" 
                placeholder="例如：做一个推特监控机器人"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-lg text-white font-bold text-lg transition-all ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'DeepSeek 正在思考...' : '生成学习路径 🚀'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. Core Concepts */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-blue-50 text-blue-600 p-2 rounded-lg mr-3 text-xl">🧠</span>
                关键概念 (The Vital 20%)
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {result.core_concepts?.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-xl hover:bg-slate-100 transition-colors">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Mini Projects */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-green-500">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-green-50 text-green-600 p-2 rounded-lg mr-3 text-xl">🛠️</span>
                实战练习 (Mini Projects)
              </h2>
              <div className="space-y-6">
                {result.mini_projects?.map((proj, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-xl text-slate-800">{proj.title}</h3>
                      <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 rounded-full text-slate-600">
                        {proj.level}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{proj.description}</p>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm font-bold text-slate-500 mb-2 uppercase">Steps:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {proj.steps?.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Pitfalls */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-red-500">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-red-50 text-red-600 p-2 rounded-lg mr-3 text-xl">⚠️</span>
                避坑指南 (Pitfalls)
              </h2>
              <div className="grid gap-4">
                {result.pitfalls?.map((pit, idx) => (
                  <div key={idx} className="flex bg-red-50 p-4 rounded-xl items-start">
                    <div className="mr-4 text-xl mt-1">🚧</div>
                    <div>
                      <h3 className="font-bold text-red-900">{pit.problem}</h3>
                      <p className="text-sm text-red-700 mt-1"><span className="font-bold">💡 解决方案：</span>{pit.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}