'use client';

import React, { useRef, useEffect } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

interface MindMapViewerProps {
  markdown: string;
  title: string; // 用于下载文件名
}

const transformer = new Transformer();

export default function MindMapViewer({ markdown, title }: MindMapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (svgRef.current && markdown) {
      const { root } = transformer.transform(markdown);
      
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current);
      }
      
      mmRef.current.setData(root);
      mmRef.current.fit();
    }
  }, [markdown]);

  // 复位视图
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    mmRef.current?.fit();
  };

  // 下载脑图
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_魔法脑图.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-[500px] bg-white/60 rounded-3xl border border-white/80 shadow-inner relative overflow-hidden group">
      
      {/* 脑图画布 */}
      <svg ref={svgRef} className="w-full h-full block" />
      
      {/* 右上角功能按钮组 */}
      <div className="absolute top-4 right-4 z-50 flex gap-3">
        
        {/* 复位按钮 */}
        <button 
          onClick={handleReset}
          className="bg-white/80 hover:bg-purple-100 text-purple-600 p-2 md:px-4 md:py-2 rounded-full shadow-lg border border-purple-200 transition-all active:scale-95 flex items-center gap-2 backdrop-blur-sm"
          title="复位视图"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M6.75 20.25h4.5m-4.5 0v-4.5m0 4.5L12 15M17.25 3.75h-4.5m4.5 0v4.5m0-4.5L12 9" />
          </svg>
          <span className="hidden md:inline font-bold text-xs">复位</span>
        </button>

        {/* 下载按钮 */}
        <button 
          onClick={handleDownload}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 md:px-4 md:py-2 rounded-full shadow-lg border border-purple-500 transition-all active:scale-95 flex items-center gap-2"
          title="下载脑图文件"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="hidden md:inline font-bold text-xs">下载</span>
        </button>

      </div>

      {/* 左下角提示 */}
      <div className="absolute bottom-4 left-4 text-xs text-purple-400 bg-white/80 px-3 py-1 rounded-full border border-purple-100 pointer-events-none">
        💡 鼠标滚轮缩放 · 左键拖拽
      </div>
    </div>
  );
}