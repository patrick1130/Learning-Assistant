import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 接收参数：type(类型), item(当前点击的条目内容), context(上下文: topic+goal)
    const { type, item, topic, goal } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });

    let userPrompt = "";
    
    // 根据点击的按钮类型，动态构建 Prompt
    if (type === 'concept_detail') {
      userPrompt = `
        背景：用户正在学习 ${topic}，目标是 ${goal}。
        当前概念：${item.title}。
        任务：请给出该概念的详细原理解释（200字左右），通俗易懂。
      `;
    } else if (type === 'project_solution') {
      userPrompt = `
        背景：用户正在做项目 ${item.title} (学习 ${topic})。
        任务：请给出详细的解答指南。如果是编程，请提供核心代码片段；如果是操作，请提供具体步骤。
      `;
    } else if (type === 'pitfall_expand') {
      userPrompt = `
        背景：用户在学习 ${topic} 时遇到了坑：${item.problem}。
        任务：请提供 JSON 格式的扩展内容，包含：
        1. detailed_explanation (详细解释)
        2. example_bad (错误示例)
        3. example_good (正确示例)
        4. practice_exercises (数组，含3个 question 和 answer)
        
        只输出 JSON。
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: userPrompt }],
      // 只有避坑指南需要 JSON 模式，其他可以直接返回文本
      response_format: type === 'pitfall_expand' ? { type: "json_object" } : { type: "text" }
    });

    let content = completion.choices[0].message.content;
    
    // 如果是 JSON，简单清洗一下
    if (type === 'pitfall_expand') {
        content = content.replace(/```json|```/g, '');
        return NextResponse.json(JSON.parse(content));
    }

    // 其他情况直接返回文本
    return NextResponse.json({ content });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}