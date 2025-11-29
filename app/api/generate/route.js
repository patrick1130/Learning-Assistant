import OpenAI from "openai";
import { NextResponse } from "next/server";

// 确保 API Key 存在
const apiKey = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: apiKey, 
});

export async function POST(req) {
  // 1. 检查 API Key 是否读取成功
  if (!apiKey) {
    console.error("错误: 找不到 DEEPSEEK_API_KEY。请检查 .env.local 文件并重启服务器。");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { topic, goal } = await req.json();

    if (!topic || !goal) {
      return NextResponse.json({ error: 'Missing topic or goal' }, { status: 400 });
    }

    console.log(`[DeepSeek] 正在请求: ${topic} - ${goal}`);

    const systemPrompt = `
      你是一个精通帕累托法则（80/20法则）的顶级课程设计师。
      用户的目标是学习：${topic}。
      具体应用场景是：${goal}。
      
      请严格按照以下 JSON 格式输出学习路径，不要输出任何多余的废话，不要输出 Markdown 标记（如 \`\`\`json），只输出纯 JSON 字符串：
      {
        "core_concepts": [
          {"title": "概念名称", "description": "简短解释"}
        ],
        "mini_projects": [
          {"level": "初级", "title": "项目名称", "description": "项目描述", "steps": ["步骤1", "步骤2"]},
          {"level": "中级", "title": "项目名称", "description": "项目描述", "steps": ["步骤1", "步骤2"]},
          {"level": "高级", "title": "项目名称", "description": "项目描述", "steps": ["步骤1", "步骤2"]}
        ],
        "pitfalls": [
          {"problem": "常见难点", "solution": "解决方案"}
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个只输出纯 JSON 的助手。" },
        { role: "user", content: systemPrompt },
      ],
      temperature: 1.1,
    });

    let content = completion.choices[0].message.content;
    
    // Debug: 打印原始返回内容，方便排查
    console.log("[DeepSeek] 原始返回:", content);

    // 2. 关键修复：清洗数据，防止 Markdown 标记导致 JSON 解析失败
    // 有时候 AI 会返回 ```json { ... } ```，需要把 ```json 和 ``` 去掉
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(content);
    
    return NextResponse.json(data);

  } catch (error) {
    // 3. 打印详细错误到终端
    console.error('------- API 请求失败 -------');
    console.error('错误信息:', error.message);
    if (error.response) {
        console.error('DeepSeek 响应状态:', error.response.status);
        console.error('DeepSeek 响应数据:', error.response.data);
    }
    console.error('---------------------------');

    return NextResponse.json({ error: 'DeepSeek API Error' }, { status: 500 });
  }
}