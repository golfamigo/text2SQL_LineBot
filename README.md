# Text2SQL LineBot

一个将自然语言转换为SQL查询的Line机器人。

## 项目概述

这个项目实现了一个LineBot，它可以接收用户的自然语言问题，并将其转换为SQL查询语句，帮助非技术用户轻松查询数据库。

## 主要功能

- 自然语言到SQL的转换
- 与Line平台集成
- Supabase数据库支持
- 多语言支持（中文/英文）

## 技术栈

- Node.js
- Supabase
- Line Messaging API
- OpenAI API

## 安装指南

```bash
# 克隆项目
git clone https://github.com/yourusername/text2SQL_LineBot.git

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入必要的API密钥和配置

# 启动服务
npm start
```

## 数据库迁移

我们使用Supabase进行数据库管理，所有的迁移文件都存放在`supabase/migrations`目录中。

```bash
# 应用迁移
supabase db push
```

## 贡献指南

欢迎提交Pull Request或Issue来改进这个项目。

## 许可证

MIT
