import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, item, topic, goal } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });

    let userPrompt = "";
    
    // SVG 画图指令
    const commonInstruction = `
      请返回 JSON 格式。
      如果该内容涉及几何图形、物理模型、流程、结构或位置关系，请务必在 "visual_svg" 字段中提供一段 SVG 代码。
      
      SVG 要求：
      1. 风格可爱、扁平化。
      2. 配色柔和（如 #a18cd1, #fad0c4, #ff9a9e, #66ccff）。
      3. 必须是完整的 <svg> 标签，包含 viewBox，确保图形居中且不被截断。
      4. 如果不需要图，"visual_svg" 留空。
      5. 文字解释放在 "content" 字段，语言要适合初中女生，通俗易懂。
    `;

    if (type === 'concept_detail') {
      userPrompt = `
        用户是初中女生，正在学习 ${topic}。
        请详细解释概念：${item.title}。
        ${commonInstruction}
      `;
    } else if (type === 'project_solution') {
      userPrompt = `
        用户正在做项目 ${item.title} (目标: ${goal})。
        请提供详细解答步骤或代码。
        ${commonInstruction}
      `;
    } else if (type === 'pitfall_expand') {
      // 避坑指南逻辑保持 JSON 结构
      userPrompt = `
        用户遇到坑：${item.problem}。
        请提供 JSON 扩展内容，包含:
        - detailed_explanation (详细解释)
        - example_bad (错误示例)
        - example_good (正确示例)
        - practice_exercises (3道练习题及答案)
        只输出 JSON。
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: userPrompt }],
      response_format: { type: "json_object" },
    });

    let content = completion.choices[0].message.content.replace(/```json|```/g, '');
    return NextResponse.json(JSON.parse(content));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}