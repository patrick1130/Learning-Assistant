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

// Fetch Helper
async function fetchExpand(type: string, item: any, topic: string, goal: string) {
  const res = await fetch('/api/expand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, item, topic, goal }),
  });
  return await res.json();
}

// --- 组件 1: 概念卡片 ---
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
    <div onClick={handleToggle} className={`glass-card p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isOpen ? 'ring-2 ring-purple-300 bg-white/80' : 'hover:bg-white/60'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <span>{isOpen ? '✨' : '⭐'}</span>
          {item.title}
        </h3>
        <span className={`text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>
      <p className="text-sm text-slate-600 pl-7 opacity-80">{item.short_desc}</p>
      
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/50 text-sm leading-7 text-slate-700 animate-fade-in cursor-default" onClick={e => e.stopPropagation()}>
          {loading ? (
            <div className="flex items-center gap-2 text-purple-500 py-2"><span className="animate-bounce">🪄</span> AI 正在施法中...</div>
          ) : (
            <>
              {data?.visual_svg && (
                <div className="mb-4 p-4 bg-white/40 rounded-xl border border-white/60 flex justify-center" dangerouslySetInnerHTML={{ __html: data.visual_svg }} />
              )}
              <div className="whitespace-pre-wrap">{data?.content}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- 组件 2: 项目卡片 ---
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
    <div className="glass-card p-6 border-l-8 border-l-pink-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xl text-slate-800">{proj.title}</h3>
        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">{proj.level}</span>
      </div>
      <p className="text-slate-600 mb-4 text-sm">{proj.description}</p>
      <div className="bg-white/40 p-4 rounded-xl mb-4 border border-white/60">
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">任务清单</div>
        <ul className="space-y-1">
          {proj.steps?.map((s, i) => <li key={i} className="text-sm text-slate-700 flex items-start"><span className="text-pink-400 mr-2">●</span> {s}</li>)}
        </ul>
      </div>

      <button onClick={handleToggle} className="w-full py-3 rounded-xl text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors flex justify-center items-center gap-2">
        {showAnswer ? '🙈 收起秘籍' : '🗝️ 获取通关秘籍'}
      </button>

      {showAnswer && (
        <div className="mt-3 p-5 bg-slate-800 text-slate-50 rounded-xl text-sm whitespace-pre-wrap font-mono relative overflow-hidden">
          {loading ? <div className="text-center py-4 text-pink-200">🔮 水晶球正在显影...</div> : (
             <>
               {data?.visual_svg && <div className="mb-4 p-4 bg-white/10 rounded-xl flex justify-center" dangerouslySetInnerHTML={{ __html: data.visual_svg }} />}
               {data?.content}
             </>
          )}
        </div>
      )}
    </div>
  );
}

// --- 组件 3: 避坑指南 ---
function PitfallCard({ pit, topic, goal }: { pit: Pitfall, topic: string, goal: string }) {
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const loadData = async (tab: string) => {
    if (activeTab === tab) { setActiveTab(''); return; }
    setActiveTab(tab);
    if (!expandedData) {
      setLoading(true);
      const res = await fetchExpand('pitfall_expand', pit, topic, goal);
      setExpandedData(res);
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 border-dashed border-2 border-indigo-200/50">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-2xl bg-indigo-100 w-10 h-10 flex items-center justify-center rounded-full">🛡️</div>
        <div>
          <h3 className="font-bold text-indigo-900">{pit.problem}</h3>
          <p className="text-xs text-indigo-500 mt-1">{pit.solution}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {[{k:'detail',l:'📜 详解'},{k:'example',l:'🆚 栗子'},{k:'practice',l:'✍️ 练习'}].map(b => (
          <button key={b.k} onClick={() => loadData(b.k)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === b.k ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-indigo-500 hover:bg-indigo-50'}`}>{b.l}</button>
        ))}
      </div>
      <div className="mt-3">
        {loading && <div className="text-center text-xs text-indigo-300 py-2">防御术加载中...</div>}
        {!loading && expandedData && activeTab === 'detail' && <div className="bg-white/80 p-3 rounded-xl text-sm text-slate-700 animate-fade-in">{expandedData.detailed_explanation}</div>}
        {!loading && expandedData && activeTab === 'example' && (
          <div className="space-y-2 text-xs animate-fade-in">
             <div className="bg-red-50 p-2 rounded-lg text-red-700 border border-red-100">❌ {expandedData.example_bad}</div>
             <div className="bg-green-50 p-2 rounded-lg text-green-700 border border-green-100">✅ {expandedData.example_good}</div>
          </div>
        )}
        {!loading && expandedData && activeTab === 'practice' && (
          <div className="space-y-2 animate-fade-in">
            {expandedData.practice_exercises?.map((q:any, i:number) => (
              <div key={i} className="bg-white/80 p-3 rounded-xl border border-indigo-50">
                <div className="text-xs font-bold text-indigo-800 mb-1">Q{i+1}: {q.question}</div>
                <details className="text-xs text-slate-400 cursor-pointer group"><summary className="group-hover:text-indigo-500 transition-colors">偷看答案</summary><p className="mt-2 text-slate-600 bg-indigo-50 p-2 rounded-lg">{q.answer}</p></details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 主页面逻辑 ---
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
    } catch (e) { alert('哎呀，连接断开了，重试一下吧！'); } finally { setLoading(false); }
  };

  const handleItemRead = () => {
    if (readItems < totalItems) {
      const newRead = readItems + 1;
      setReadItems(newRead);
      setProgress(Math.round((newRead / totalItems) * 100));
    }
  };

  const markdownContent = useMemo(() => {
    if (!result || !topic) return '';
    let md = `# ${topic} 魔法书\n`;
    result.core_concepts.forEach(c => md += `- **${c.title}**\n`);
    result.mini_projects.forEach(p => md += `- **${p.title}**\n`);
    return md;
  }, [result, topic]);

  return (
    <main className="p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* 顶部标题 */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-md mb-2 tracking-tight">
            Pareto <span className="text-purple-600 bg-white/90 px-2 py-1 rounded-xl transform -rotate-2 inline-block shadow-lg">Magic</span>
          </h1>
          <p className="text-white/90 font-medium">✨ 80/20 极简学习法 · 你的专属 AI 导师 ✨</p>
        </header>

        {/* 核心交互区 */}
        <div className="glass-card p-6 md:p-8 mb-8 transform transition-all hover:scale-[1.005] duration-500">
          {!result ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-700 text-center mb-4">👋 嗨！今天想点亮什么技能？</h2>
              
              {/* 修复后的输入框布局：确保水平排列 */}
              <div className="flex flex-col gap-4 text-lg text-slate-600 items-center bg-white/40 p-6 rounded-2xl border border-white/50">
                <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
                  <span className="whitespace-nowrap">我想学习</span>
                  <input 
                    className="glass-input flex-1 px-4 py-3 rounded-xl text-purple-700 font-bold text-center focus:scale-105"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="例如：圆的性质" 
                  />
                </div>
                <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
                  <span className="whitespace-nowrap">是为了做</span>
                  <input 
                    className="glass-input flex-1 px-4 py-3 rounded-xl text-purple-700 font-bold text-center focus:scale-105"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="例如：解几何证明题" 
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={loading} 
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-purple-200 transform transition-all active:scale-95 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? '🪄 正在绘制魔法阵...' : '🚀 开启学习之旅'}
              </button>
            </div>
          ) : (
            // 结果页头部：进度条
            <div className="text-center">
              <div className="flex justify-between items-end mb-2 px-1">
                <span className="font-bold text-slate-600 text-sm">本章探索进度</span>
                <span className="text-2xl font-black text-purple-600">{progress}%</span>
              </div>
              <div className="h-5 bg-white rounded-full overflow-hidden border border-purple-100 p-1 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <button onClick={() => setResult(null)} className="text-xs text-slate-400 mt-4 hover:text-purple-500 underline decoration-dashed underline-offset-4">
                ← 换个话题
              </button>
            </div>
          )}
        </div>

        {/* 内容展示区 */}
        {result && (
          <div className="space-y-8 pb-20 animate-fade-in">
            
            {/* 脑图 */}
            <section className="glass-card p-2 rounded-3xl shadow-lg">
               <MindMapViewer markdown={markdownContent} title={topic} />
            </section>

            {/* 1. 概念列表 */}
            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-sm mb-4 flex items-center pl-2">
                <span className="bg-white/30 w-8 h-8 rounded-lg flex items-center justify-center mr-2 backdrop-blur-sm">🧩</span> 
                知识碎片 (Concepts)
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {result.core_concepts.map((item, idx) => <ConceptCard key={idx} item={item} topic={topic} goal={goal} onRead={handleItemRead} />)}
              </div>
            </div>

            {/* 2. 项目列表 */}
            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-sm mb-4 flex items-center pl-2">
                <span className="bg-white/30 w-8 h-8 rounded-lg flex items-center justify-center mr-2 backdrop-blur-sm">🏆</span> 
                技能试炼 (Quests)
              </h2>
              <div className="space-y-5">
                {result.mini_projects.map((proj, idx) => <ProjectCard key={idx} proj={proj} topic={topic} goal={goal} onRead={handleItemRead} />)}
              </div>
            </div>

            {/* 3. 避坑指南 */}
            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-sm mb-4 flex items-center pl-2">
                <span className="bg-white/30 w-8 h-8 rounded-lg flex items-center justify-center mr-2 backdrop-blur-sm">🛡️</span> 
                防御结界 (Shields)
              </h2>
              <div className="grid gap-4">
                {result.pitfalls.map((pit, idx) => <PitfallCard key={idx} pit={pit} topic={topic} goal={goal} />)}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}