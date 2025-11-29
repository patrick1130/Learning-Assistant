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
      const { root } = transformer.transform(markdown);
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current);
      }
      mmRef.current.setData(root);
      mmRef.current.fit();
    }
  }, [markdown]);

  // 复位功能
  const handleReset = () => {
    if (mmRef.current) {
      mmRef.current.fit(); // Markmap 自带的自动适配方法
    }
  };

  return (
    <div className="w-full h-[500px] bg-white/50 rounded-2xl border border-white/60 shadow-inner overflow-hidden relative group">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* 悬浮复位按钮 */}
      <button 
        onClick={handleReset}
        className="absolute bottom-4 right-4 bg-white/80 hover:bg-purple-100 text-purple-600 p-2 rounded-full shadow-lg border border-purple-200 transition-all transform active:scale-90 flex items-center gap-2 px-3 text-xs font-bold backdrop-blur-sm z-10"
        title="复位视图"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M6.75 20.25h4.5m-4.5 0v-4.5m0 4.5L12 15M17.25 3.75h-4.5m4.5 0v4.5m0-4.5L12 9" />
        </svg>
        复位
      </button>

      <div className="absolute top-2 left-4 text-xs text-purple-300 pointer-events-none">
        💡 滚动鼠标缩放，按住左键拖拽
      </div>
    </div>
  );
}