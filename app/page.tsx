'use client';

import { useState, useMemo } from 'react';
import MindMapViewer from './MindMapViewer';

// --- 类型定义 (简化版，因为详情是动态加载的) ---
interface CoreConcept { title: string; short_desc: string; }
interface MiniProject { level: string; title: string; description: string; steps: string[]; }
interface Pitfall { problem: string; solution: string; }
interface LearningResult {
  core_concepts: CoreConcept[];
  mini_projects: MiniProject[];
  pitfalls: Pitfall[];
}

// --- 通用 Fetch 函数 ---
async function fetchExpand(type: string, item: any, topic: string, goal: string) {
  const res = await fetch('/api/expand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, item, topic, goal }),
  });
  return await res.json();
}

// --- 组件 1: 核心概念 (点击加载详情) ---
function ConceptCard({ item, topic, goal }: { item: CoreConcept, topic: string, goal: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setIsOpen(!isOpen);
    // 如果没加载过，且现在要展开，才去请求
    if (!detail && !isOpen) {
      setLoading(true);
      const data = await fetchExpand('concept_detail', item, topic, goal);
      setDetail(data.content);
      setLoading(false);
    }
  };

  return (
    <div onClick={handleToggle} className="bg-slate-50 p-5 rounded-xl border hover:border-blue-300 cursor-pointer transition-all">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{item.title}</h3>
        <span className="text-blue-500">{isOpen ? '▲' : '▼'}</span>
      </div>
      <p className="text-sm text-slate-600">{item.short_desc}</p>
      
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200 text-sm leading-6 text-slate-800 bg-white p-3 rounded">
          {loading ? (
            <span className="flex items-center text-slate-400">
              <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              AI 正在生成详细解释...
            </span>
          ) : detail}
        </div>
      )}
    </div>
  );
}

// --- 组件 2: 实战项目 (点击加载解答) ---
function ProjectCard({ proj, topic, goal }: { proj: MiniProject, topic: string, goal: string }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!showAnswer && !solution) {
      setLoading(true);
      const data = await fetchExpand('project_solution', proj, topic, goal);
      setSolution(data.content);
      setLoading(false);
    }
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-xl">{proj.title}</h3>
        <span className="bg-slate-100 text-xs font-bold px-2 py-1 rounded">{proj.level}</span>
      </div>
      <p className="text-slate-600 mb-4">{proj.description}</p>
      <ul className="list-disc list-inside text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded">
        {proj.steps?.map((s, i) => <li key={i}>{s}</li>)}
      </ul>

      <button onClick={handleToggle} className="text-sm font-bold text-green-600 flex items-center hover:underline">
        {showAnswer ? '🙈 隐藏解答' : '🔑 查看解答'}
      </button>

      {showAnswer && (
        <div className="mt-3 p-4 bg-green-50 rounded border border-green-100 text-sm whitespace-pre-wrap">
          {loading ? 'AI 正在编写代码/步骤...' : solution}
        </div>
      )}
    </div>
  );
}

// --- 组件 3: 避坑指南 (点击加载扩展) ---
function PitfallCard({ pit, topic, goal }: { pit: Pitfall, topic: string, goal: string }) {
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const loadData = async (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(''); // 关闭
      return;
    }
    setActiveTab(tab);
    
    // 如果还没加载过数据，先去请求
    if (!expandedData) {
      setLoading(true);
      const data = await fetchExpand('pitfall_expand', pit, topic, goal);
      setExpandedData(data); // data 是个 JSON 对象
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-red-900 text-lg">🚫 {pit.problem}</h3>
        <p className="text-sm text-red-600 mt-1">💡 {pit.solution}</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['detail', 'example', 'practice'].map(tab => (
          <button 
            key={tab}
            onClick={() => loadData(tab)}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}
          >
            {tab === 'detail' ? '详细解释' : tab === 'example' ? '示例' : '练习题'}
          </button>
        ))}
      </div>

      <div className="min-h-[60px]">
        {loading && <div className="text-sm text-slate-400 p-2">AI 正在生成深度内容...</div>}
        
        {!loading && expandedData && activeTab === 'detail' && (
          <div className="bg-slate-50 p-3 rounded text-sm text-slate-800">{expandedData.detailed_explanation}</div>
        )}
        
        {!loading && expandedData && activeTab === 'example' && (
          <div className="grid gap-2 md:grid-cols-2 text-xs">
             <div className="bg-red-50 p-2 rounded text-red-800 border border-red-100">❌ {expandedData.example_bad}</div>
             <div className="bg-green-50 p-2 rounded text-green-800 border border-green-100">✅ {expandedData.example_good}</div>
          </div>
        )}

        {!loading && expandedData && activeTab === 'practice' && (
          <div className="space-y-2">
            {expandedData.practice_exercises?.map((q: any, i: number) => (
              <div key={i} className="bg-slate-50 p-2 rounded border text-sm">
                <div className="font-bold mb-1">Q: {q.question}</div>
                <details className="text-slate-500 cursor-pointer"><summary>看答案</summary><div className="mt-1 text-slate-800">{q.answer}</div></details>
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
      const data = await res.json();
      setResult(data);
    } catch (e) { alert('失败'); } 
    finally { setLoading(false); }
  };

  // 生成大纲用的 Markdown (不含详情，因为详情是动态的)
  const markdownContent = useMemo(() => {
    if (!result || !topic) return '';
    let md = `# ${topic}\n`;
    result.core_concepts.forEach(c => md += `- **${c.title}**\n`);
    result.mini_projects.forEach(p => md += `- **${p.title}**\n`);
    result.pitfalls.forEach(p => md += `- **${p.problem}**\n`);
    return md;
  }, [result, topic]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Pareto Learner (Lazy Load版)</h1>
          <p className="text-slate-500">先出大纲，点击再生成详情，省钱又快。</p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
             <input className="border p-2 rounded" value={topic} onChange={e => setTopic(e.target.value)} placeholder="想学的技能" />
             <input className="border p-2 rounded" value={goal} onChange={e => setGoal(e.target.value)} placeholder="目标项目" />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-slate-300">
            {loading ? '正在生成大纲...' : '生成学习路径'}
          </button>
        </div>

        {result && (
          <div className="space-y-8 pb-20">
            {/* 脑图 */}
            <div className="bg-white p-6 rounded-xl border"><MindMapViewer markdown={markdownContent} /></div>

            {/* 列表 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">🧠 关键概念</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {result.core_concepts.map((item, idx) => (
                  <ConceptCard key={idx} item={item} topic={topic} goal={goal} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">🛠️ 实战项目</h2>
              {result.mini_projects.map((proj, idx) => (
                <ProjectCard key={idx} proj={proj} topic={topic} goal={goal} />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">⚠️ 避坑指南</h2>
              {result.pitfalls.map((pit, idx) => (
                <PitfallCard key={idx} pit={pit} topic={topic} goal={goal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}