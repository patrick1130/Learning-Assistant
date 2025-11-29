import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, item, topic, goal } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });

    let userPrompt = "";
    
    // 我们统一要求 AI 返回 JSON 格式，以便包含图片代码
    // 专门针对初中女生优化 Prompt：要求图示可爱、配色柔和
    const commonInstruction = `
      请返回 JSON 格式。
      如果该内容涉及几何图形、物理模型、数据结构、流程或位置关系，请务必在 "visual_svg" 字段中提供一段 SVG 代码来辅助理解。
      
      SVG 要求：
      1. 风格简洁、可爱，使用柔和的配色（如 #a18cd1, #fad0c4, #ff9a9e, #66ccff）。
      2. 必须是完整的 <svg> 标签，包含 viewBox。
      3. 如果不需要图示，"visual_svg" 字段留空字符串。
      4. 文字解释放在 "content" 字段。
    `;

    if (type === 'concept_detail') {
      userPrompt = `
        用户是初中女生，正在学习 ${topic}。
        请解释概念：${item.title}。
        要求：
        1. "content": 详细解释，语言生动亲切，多用比喻。
        2. "visual_svg": 如果该概念（如圆、三角形、函数、物理受力）适合画图，请画一个 SVG 示意图。
        ${commonInstruction}
      `;
    } else if (type === 'project_solution') {
      userPrompt = `
        用户正在做项目 ${item.title}。
        请提供解答。
        要求：
        1. "content": 详细步骤或代码。
        2. "visual_svg": 如果涉及流程图或结构图，请用 SVG 画出来。
        ${commonInstruction}
      `;
    } else if (type === 'pitfall_expand') {
      // 避坑指南结构比较特殊，保持原有逻辑，暂时不强制画图，除非你特别想要
      userPrompt = `
        用户遇到坑：${item.problem}。
        请提供 JSON 扩展内容，包含 detailed_explanation, example_bad, example_good, practice_exercises。
        只输出 JSON。
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: userPrompt }],
      response_format: { type: "json_object" }, // 强制 JSON
    });

    let content = completion.choices[0].message.content;
    content = content.replace(/```json|```/g, ''); // 清洗
    
    return NextResponse.json(JSON.parse(content));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}