import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey, 
    });

    const { topic, goal } = await req.json();

    // 🔥 核心修改：增加了 Example (示例)，强制 AI 模仿这个结构
    const systemPrompt = `
      你是一个课程设计师。用户想学 ${topic} 来做 ${goal}。
      
      请严格按照 JSON 格式输出 80/20 学习路径。
      
      【重要要求】
      1. 返回的数据必须是对象数组，不能是字符串数组。
      2. "mini_projects" 必须包含 "steps" 数组。
      3. 不要使用 Markdown 格式。

      【输出数据结构示例】(请完全照着这个格式填内容):
      {
        "core_concepts": [
          { "title": "概念名称A", "description": "这里写解释..." },
          { "title": "概念名称B", "description": "这里写解释..." }
        ],
        "mini_projects": [
          { 
            "level": "初级", 
            "title": "项目A", 
            "description": "描述...", 
            "steps": ["第一步做什么", "第二步做什么"] 
          }
        ],
        "pitfalls": [
          { "problem": "坑A", "solution": "解法A" }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个只输出 JSON 的程序。请严格遵守用户给定的数据结构示例。" },
        { role: "user", content: systemPrompt },
      ],
      temperature: 1.1,
      response_format: { type: "json_object" }, // 再次强制 JSON 模式
    });

    let content = completion.choices[0].message.content;
    
    // 清洗数据
    content = content.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(content);
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}