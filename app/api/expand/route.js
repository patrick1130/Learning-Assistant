import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, item, topic, goal } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });

    let userPrompt = "";
    
    // SVG 画图通用指令 - 要求配色柔和
    const commonInstruction = `
      请返回 JSON 格式。
      
      【关于配图】
      如果该内容适合用图解（如几何、物理模型、流程、对比），请务必在 "visual_svg" 字段中提供一段 SVG 代码。
      SVG 要求：
      1. 风格：可爱、扁平化。
      2. 配色：莫兰迪色系 (如 #b39ddb, #ffccbc, #80deea, #ff9a9e)。
      3. 必须是完整的 <svg> 标签，包含 viewBox。
      4. 如果不需要图，"visual_svg" 留空。

      【关于文字】
      1. 文字内容放在 "content" 字段。
      2. 解释要通俗易懂，适合初中生，多用比喻。
    `;

    if (type === 'concept_detail') {
      userPrompt = `用户是初中女生。请详细解释概念：${item.title} (属于 ${topic})。${commonInstruction}`;
    } else if (type === 'project_solution') {
      userPrompt = `用户正在做项目 ${item.title}。请提供详细解答。${commonInstruction}`;
    } else if (type === 'pitfall_expand') {
      userPrompt = `
        用户遇到坑：${item.problem}。
        请提供 JSON 扩展内容，包含:
        - detailed_explanation (原理)
        - example_bad (错误例子)
        - example_good (正确例子)
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