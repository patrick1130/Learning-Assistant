'use client';

import React, { useRef, useEffect } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

interface MindMapViewerProps {
  markdown: string;
}

const transformer = new Transformer();

export default function MindMapViewer({ markdown }: MindMapViewerProps) {
  // 使用 useRef 来引用 SVG 元素
  const svgRef = useRef<SVGSVGElement>(null);
  // 用 useRef 来保存 Markmap 实例，防止重复创建
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (svgRef.current && markdown) {
      // 1. 将 Markdown 转换为 Markmap 需要的数据结构
      const { root } = transformer.transform(markdown);
      
      // 2. 如果实例不存在，创建一个新的
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current);
      }
      
      // 3. 更新数据并渲染
      mmRef.current.setData(root);
      // 自动缩放以适应容器
      mmRef.current.fit();
    }
  }, [markdown]); // 当 markdown 内容变化时重新渲染

  return (
    <div className="w-full h-[500px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative group">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
        支持滚轮缩放和拖拽
      </div>
    </div>
  );
}