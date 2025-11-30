import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });
    const { topic, goal } = await req.json();

    // 简化 Prompt，只求 JSON 大纲
    const systemPrompt = `
      用户是初中女生，想学 ${topic} 来做 ${goal}。
      请输出一个帕累托最优（80/20）学习路径大纲。
      
      【要求】
      1. 必须是 JSON 格式。
      2. 语气亲切、鼓励性强。
      3. 只提供标题和简述，不要长篇大论。
      
      【JSON 结构】:
      {
        "core_concepts": [{ "title": "概念名称", "short_desc": "一句话可爱的简介" }],
        "mini_projects": [{ "level": "Lv.1", "title": "项目名", "description": "项目简介", "steps": ["步骤1", "步骤2"] }],
        "pitfalls": [{ "problem": "常见坑", "solution": "一句话解法" }]
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