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
      
      // 设置一些选项让脑图更好看
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
    <div className="w-full h-[400px] md:h-[500px] bg-white/50 rounded-3xl border border-white/60 shadow-inner relative overflow-hidden group">
      
      {/* 脑图画布 */}
      <svg ref={svgRef} className="w-full h-full block" />
      
      {/* 右上角悬浮按钮组 (绝对定位 + 高层级) */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        
        {/* 复位按钮 */}
        <button 
          onClick={handleReset}
          className="bg-white/80 hover:bg-purple-50 text-purple-600 px-3 py-2 rounded-xl shadow-md border border-purple-100 transition-all active:scale-95 flex items-center gap-1 backdrop-blur-sm"
          title="回到中心"
        >
          <span className="text-lg">🎯</span>
          <span className="text-xs font-bold text-slate-600 hidden md:inline">复位</span>
        </button>

        {/* 下载按钮 */}
        <button 
          onClick={handleDownload}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-xl shadow-md border border-purple-400 transition-all active:scale-95 flex items-center gap-1"
          title="保存到电脑"
        >
          <span className="text-lg">📥</span>
          <span className="text-xs font-bold hidden md:inline">下载</span>
        </button>

      </div>

      {/* 左下角可爱的提示 */}
      <div className="absolute bottom-3 left-4 bg-white/60 px-3 py-1 rounded-full text-xs text-purple-400 border border-white pointer-events-none backdrop-blur-sm">
        ✨ 滚轮缩放 · 拖拽移动
      </div>
    </div>
  );
}