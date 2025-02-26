require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();

// Line配置
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI配置
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 创建Line客户端
const lineClient = new line.Client(lineConfig);

// 为webhook设置中间件
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// 处理Line事件
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;
  
  try {
    // 将自然语言转换为SQL
    const sqlQuery = await convertToSQL(userMessage);
    
    // 执行SQL查询
    const { data, error } = await supabase.rpc('execute_query', { query: sqlQuery });
    
    if (error) throw error;
    
    // 格式化结果
    const formattedResult = formatQueryResult(data);
    
    // 回复用户
    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: `查询结果:\n${formattedResult}`
    });
  } catch (error) {
    console.error('Error:', error);
    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: `抱歉，处理您的请求时出错了: ${error.message}`
    });
  }
}

// 使用OpenAI将自然语言转换为SQL
async function convertToSQL(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一个专门将自然语言转换为PostgreSQL查询的AI助手。你只返回有效的SQL查询，不包含任何解释或其他文本。确保生成安全的查询，避免SQL注入风险。"
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('无法将您的问题转换为SQL查询');
  }
}

// 格式化查询结果
function formatQueryResult(data) {
  if (!data || data.length === 0) {
    return '没有找到结果';
  }
  
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('结果格式化错误:', error);
    return '查询成功，但无法格式化结果';
  }
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
