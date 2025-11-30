import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });
    const { topic, goal } = await req.json();

    // 针对初中女生的 Prompt
    const systemPrompt = `
      用户是一位初中女生，她想学习 ${topic}，目标是 ${goal}。
      请为她设计一个 "80/20 魔法学习路径"。
      
      【要求】
      1. 输出纯 JSON 格式。
      2. 语气要像大姐姐一样亲切、鼓励。
      3. 只提供标题和简短有趣的介绍，不要长篇大论。
      
      【JSON 结构】:
      {
        "core_concepts": [{ "title": "知识碎片名", "short_desc": "一句话可爱的简介" }],
        "mini_projects": [{ "level": "Lv.1", "title": "任务名", "description": "任务简介", "steps": ["步骤1", "步骤2"] }],
        "pitfalls": [{ "problem": "小怪兽(常见坑)", "solution": "防御术(一句话解法)" }]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个输出 JSON 的学习规划师。" }, 
        { role: "user", content: systemPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 1.1
    });

    let content = completion.choices[0].message.content.replace(/```json|```/g, '');
    return NextResponse.json(JSON.parse(content));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}