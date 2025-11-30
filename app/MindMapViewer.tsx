'use client';

import React, { useRef, useEffect } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

interface MindMapViewerProps {
  markdown: string;
}

const transformer = new Transformer();

export default function MindMapViewer({ markdown }: MindMapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (svgRef.current && markdown) {
      // 1. 转换 Markdown
      const { root } = transformer.transform(markdown);
      
      // 2. 创建或更新 Markmap 实例
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current);
      }
      
      // 3. 设置数据并适配视图
      mmRef.current.setData(root);
      mmRef.current.fit();
    }
  }, [markdown]);

  // 复位功能函数
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止冒泡
    if (mmRef.current) {
      mmRef.current.fit(); // 核心复位命令
    }
  };

  return (
    // 关键点：relative 确保内部的 absolute 按钮是相对于这个框定位的
    <div className="w-full h-[400px] md:h-[500px] bg-white/50 rounded-2xl border border-white/60 shadow-inner overflow-hidden relative isolate">
      <svg ref={svgRef} className="w-full h-full block" />
      
      {/* 复位按钮 */}
      {/* 关键修改：z-50 确保在最上层，bottom-4 right-4 确保在右下角 */}
      <button 
        onClick={handleReset}
        className="absolute bottom-4 right-4 z-50 bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-full shadow-lg font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        title="复位视图"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M6.75 20.25h4.5m-4.5 0v-4.5m0 4.5L12 15M17.25 3.75h-4.5m4.5 0v4.5m0-4.5L12 9" />
        </svg>
        一键复位
      </button>

      {/* 提示文字 */}
      <div className="absolute top-3 left-4 z-10 text-xs text-purple-400 font-medium pointer-events-none select-none bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
        💡 鼠标滚轮缩放 · 左键拖拽
      </div>
    </div>
  );
}