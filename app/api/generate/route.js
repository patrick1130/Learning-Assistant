import OpenAI from "openai";
import { NextResponse } from "next/server";

// 注意：不要在函数外面初始化 OpenAI，否则构建会失败
export async function POST(req) {
  try {
    // 1. 在函数内部获取 Key (运行时才有)
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // 安全检查：如果没有 Key，优雅地报错，而不是让服务器崩溃
    if (!apiKey) {
      console.error("❌ 错误: 未找到 API Key");
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    // 2. 在函数内部初始化 OpenAI 实例
    // 这样只有当请求真正发生时，才会去连接 DeepSeek
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey, 
    });

    const { topic, goal } = await req.json();

    const systemPrompt = `
      你是一个课程设计师。用户想学 ${topic} 来做 ${goal}。
      请严格按照 JSON 格式输出 80/20 学习路径。
      不要输出 Markdown 标记。不要输出寒暄的话。
      JSON 结构必须包含: core_concepts, mini_projects, pitfalls。
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个只输出纯 JSON 的程序。" },
        { role: "user", content: systemPrompt },
      ],
      temperature: 1.1,
    });

    let content = completion.choices[0].message.content;
    console.log("DeepSeek 原始返回:", content);

    // 3. 数据清洗 (防止 AI 返回 ```json 等标记)
    content = content.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(content);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ 处理失败:', error);
    return NextResponse.json({ error: '生成失败，请检查服务器日志' }, { status: 500 });
  }
}