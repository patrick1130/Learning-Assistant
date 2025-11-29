'use client';

import { useState, useMemo } from 'react';
import MindMapViewer from './MindMapViewer';

// --- 类型定义 ---
interface CoreConcept { title: string; short_desc: string; }
interface MiniProject { level: string; title: string; description: string; steps: string[]; }
interface Pitfall { problem: string; solution: string; }
interface LearningResult {
  core_concepts: CoreConcept[];
  mini_projects: MiniProject[];
  pitfalls: Pitfall[];
}

// 通用 Fetch
async function fetchExpand(type: string, item: any, topic: string, goal: string) {
  const res = await fetch('/api/expand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, item, topic, goal }),
  });
  return await res.json();
}

// --- 组件 1: 概念卡片 (支持显示 SVG) ---
function ConceptCard({ item, topic, goal, onRead }: { item: CoreConcept, topic: string, goal: string, onRead: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{content: string, visual_svg?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isOpen && !data) {
      setLoading(true);
      const res = await fetchExpand('concept_detail', item, topic, goal);
      setData(res);
      setLoading(false);
      onRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div onClick={handleToggle} className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isOpen ? 'ring-2 ring-purple-300 bg-white/90' : 'hover:bg-white/80'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-purple-900 flex items-center">
          <span className="mr-2 text-xl">{isOpen ? '✨' : '🌟'}</span>
          {item.title}
        </h3>
        <span className={`text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>
      <p className="text-sm text-slate-600 pl-8">{item.short_desc}</p>
      
      {isOpen && (
        <div className="mt-4 ml-8 pt-3 border-t border-purple-100 text-sm leading-7 text-slate-700 animate-fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
          {loading ? (
            <div className="flex items-center space-x-2 text-purple-400">
              <span className="animate-bounce">🪄</span>
              <span>魔法正在生效中...</span>
            </div>
          ) : (
            <>
              {/* 如果有图，显示图 */}
              {data?.visual_svg && (
                <div 
                  className="mb-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex justify-center"
                  dangerouslySetInnerHTML={{ __html: data.visual_svg }} 
                />
              )}
              {/* 文字内容 */}
              <div className="whitespace-pre-wrap">{data?.content}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- 组件 2: 项目卡片 (支持显示 SVG) ---
function ProjectCard({ proj, topic, goal, onRead }: { proj: MiniProject, topic: string, goal: string, onRead: () => void }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [data, setData] = useState<{content: string, visual_svg?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!showAnswer && !data) {
      setLoading(true);
      const res = await fetchExpand('project_solution', proj, topic, goal);
      setData(res);
      setLoading(false);
      onRead();
    }
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-l-8 border-l-pink-300 hover:border-l-pink-400 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xl text-slate-800">{proj.title}</h3>
        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
          Lv.{proj.level}
        </span>
      </div>
      <p className="text-slate-600 mb-4 text-sm">{proj.description}</p>
      
      <div className="bg-white/50 p-4 rounded-xl mb-4 border border-white/60">
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Quest Steps</div>
        <ul className="space-y-1">
          {proj.steps?.map((s, i) => (
            <li key={i} className="text-sm text-slate-700 flex items-start">
              <span className="text-pink-400 mr-2">•</span> {s}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleToggle} className="w-full py-2 rounded-xl text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors flex justify-center items-center gap-2">
        {showAnswer ? '🙈 收起秘籍' : '🗝️ 获取通关秘籍'}
      </button>

      {showAnswer && (
        <div className="mt-3 p-4 bg-slate-800 text-slate-50 rounded-xl text-sm whitespace-pre-wrap font-mono relative overflow-hidden">
          {loading ? (
            <div className="text-center py-4">🔮 水晶球正在显影...</div>
          ) : (
             <>
               {/* 如果有图，显示图 (深色背景模式) */}
               {data?.visual_svg && (
                  <div 
                    className="mb-4 p-4 bg-white/10 rounded-xl flex justify-center"
                    dangerouslySetInnerHTML={{ __html: data.visual_svg }} 
                  />
               )}
               {data?.content}
             </>
          )}
        </div>
      )}
    </div>
  );
}

// --- 组件 3: 避坑指南 (保持不变，只是为了代码完整性放这里) ---
function PitfallCard({ pit, topic, goal }: { pit: Pitfall, topic: string, goal: string }) {
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const loadData = async (tab: string) => {
    if (activeTab === tab) { setActiveTab(''); return; }
    setActiveTab(tab);
    if (!expandedData) {
      setLoading(true);
      // 避坑指南的接口返回格式略有不同，所以直接用
      const res = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pitfall_expand', item: pit, topic, goal }),
      });
      const json = await res.json();
      setExpandedData(json);
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl border-dashed border-2 border-indigo-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-2xl bg-indigo-100 w-10 h-10 flex items-center justify-center rounded-full">🛡️</div>
        <div>
          <h3 className="font-bold text-indigo-900">{pit.problem}</h3>
          <p className="text-xs text-indigo-500 mt-1">{pit.solution}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[{k:'detail',l:'📜 详解'},{k:'example',l:'🆚 栗子'},{k:'practice',l:'✍️ 练习'}].map(b => (
          <button key={b.k} onClick={() => loadData(b.k)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === b.k ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500'}`}>{b.l}</button>
        ))}
      </div>

      <div className="mt-3">
        {loading && <div className="text-center text-xs text-indigo-300 py-2">防御术加载中...</div>}
        {!loading && expandedData && activeTab === 'detail' && (
          <div className="bg-white/80 p-3 rounded-xl text-sm text-slate-700">{expandedData.detailed_explanation}</div>
        )}
        {!loading && expandedData && activeTab === 'example' && (
          <div className="space-y-2 text-xs">
             <div className="bg-red-50 p-2 rounded-lg text-red-700 border border-red-100">× {expandedData.example_bad}</div>
             <div className="bg-green-50 p-2 rounded-lg text-green-700 border border-green-100">√ {expandedData.example_good}</div>
          </div>
        )}
        {!loading && expandedData && activeTab === 'practice' && (
          <div className="space-y-2">
            {expandedData.practice_exercises?.map((q:any, i:number) => (
              <div key={i} className="bg-white/80 p-3 rounded-xl border border-indigo-50">
                <div className="text-xs font-bold text-indigo-800 mb-1">Q{i+1}: {q.question}</div>
                <details className="text-xs text-slate-400 cursor-pointer"><summary>偷看答案</summary><p className="mt-2 text-slate-600 bg-indigo-50 p-2 rounded-lg">{q.answer}</p></details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 主页面 ---
export default function Home() {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LearningResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [readItems, setReadItems] = useState(0);

  const handleGenerate = async () => {
    if (!topic || !goal) return;
    setLoading(true);
    setResult(null);
    setProgress(0); setReadItems(0);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, goal }),
      });
      const data = await res.json();
      setResult(data);
      setTotalItems((data.core_concepts?.length || 0) + (data.mini_projects?.length || 0));
    } catch (e) { alert('连接断开了'); } finally { setLoading(false); }
  };

  const handleItemRead = () => {
    const newRead = readItems + 1;
    setReadItems(newRead);
    if (totalItems > 0) setProgress(Math.round((newRead / totalItems) * 100));
  };

  const markdownContent = useMemo(() => {
    if (!result || !topic) return '';
    let md = `# ${topic} 魔法书\n`;
    result.core_concepts.forEach(c => md += `- **${c.title}**\n`);
    result.mini_projects.forEach(p => md += `- **${p.title}**\n`);
    return md;
  }, [result, topic]);

  return (
    <main className="min-h-screen font-sans text-slate-800 animate-gradient p-4 md:p-10 selection:bg-purple-200">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10 pt-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-white drop-shadow-md tracking-tight">
            Pareto <span className="text-purple-600 bg-white/80 px-2 rounded-lg">Magic</span>
          </h1>
          <p className="text-white/90 text-lg font-medium">80/20 极简学习法 · 你的专属 AI 导师</p>
        </header>

        <div className="glass-card p-8 rounded-3xl shadow-xl mb-10 transform transition-all hover:scale-[1.01]">
          {!result ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-700 mb-6 text-center">👋 嗨！今天想点亮什么新技能？</h2>
              <div className="flex flex-col gap-4 text-lg text-slate-600 items-center">
                <div className="w-full">我想学习 <input className="glass-input mx-2 px-4 py-2 rounded-xl text-purple-700 font-bold w-full md:w-auto focus:outline-none" value={topic} onChange={e => setTopic(e.target.value)} placeholder="例如：圆的性质" /></div>
                <div className="w-full">是为了做 <input className="glass-input mx-2 px-4 py-2 rounded-xl text-purple-700 font-bold w-full md:w-auto focus:outline-none" value={goal} onChange={e => setGoal(e.target.value)} placeholder="例如：解几何题" /></div>
              </div>
              <button onClick={handleGenerate} disabled={loading} className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-purple-200 transform transition-all active:scale-95 hover:shadow-xl disabled:opacity-50">{loading ? '✨ 正在绘制魔法阵...' : '🚀 开始我的学习之旅'}</button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-between items-end mb-2 px-2"><span className="font-bold text-slate-600">本章探索进度</span><span className="text-2xl font-black text-purple-600">{progress}%</span></div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div></div>
              <button onClick={() => setResult(null)} className="text-sm text-slate-400 mt-4 hover:text-purple-500 underline">← 换个话题</button>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-8 pb-20 animate-fade-in-up">
            <section className="glass-card p-2 rounded-3xl overflow-hidden">
               <div className="bg-white/90 rounded-2xl h-[400px]"><MindMapViewer markdown={markdownContent} /></div>
            </section>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm mb-4 flex items-center"><span className="bg-white/20 p-2 rounded-xl mr-3 backdrop-blur-sm">✨</span> 魔法知识碎片</h2>
              <div className="grid gap-4 md:grid-cols-2">{result.core_concepts.map((item, idx) => <ConceptCard key={idx} item={item} topic={topic} goal={goal} onRead={handleItemRead} />)}</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm mb-4 flex items-center"><span className="bg-white/20 p-2 rounded-xl mr-3 backdrop-blur-sm">🔮</span> 技能试炼</h2>
              <div className="space-y-5">{result.mini_projects.map((proj, idx) => <ProjectCard key={idx} proj={proj} topic={topic} goal={goal} onRead={handleItemRead} />)}</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm mb-4 flex items-center"><span className="bg-white/20 p-2 rounded-xl mr-3 backdrop-blur-sm">🛡️</span> 防御结界</h2>
              <div className="grid gap-4">{result.pitfalls.map((pit, idx) => <PitfallCard key={idx} pit={pit} topic={topic} goal={goal} />)}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}