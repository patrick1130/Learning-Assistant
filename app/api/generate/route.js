import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { topic, goal } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });

    // 简化 Prompt，只求大纲，不求详情
    const systemPrompt = `
      用户想学 ${topic} 来做 ${goal}。
      请输出 80/20 学习路径大纲。
      要求：
      1. JSON 格式。
      2. 不要具体的长篇解释、不要代码、不要练习题。只要标题和简述。
      
      格式示例:
      {
        "core_concepts": [{ "title": "...", "short_desc": "..." }],
        "mini_projects": [{ "level": "...", "title": "...", "description": "...", "steps": ["..."] }],
        "pitfalls": [{ "problem": "...", "solution": "..." }]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "system", content: "输出纯 JSON" }, { role: "user", content: systemPrompt }],
      response_format: { type: "json_object" },
      temperature: 1.1
    });

    let content = completion.choices[0].message.content.replace(/```json|```/g, '');
    return NextResponse.json(JSON.parse(content));

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}