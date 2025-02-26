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
- n8n (工作流自动化)

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

## 工作流程与文件管理

### SQL函数修改流程

1. 直接编辑根目录下的SQL文件
2. 运行`node setup-migrations.js`自动生成时间戳格式的迁移文件
3. 提交更改到Git仓库：`git add .`, `git commit -m "更新说明"`, `git push`
4. GitHub Actions将自动生成迁移文件到`supabase/migrations`目录

### 数据库迁移

现在我们使用本地部署方式应用迁移：

```bash
# 在Linux/Mac上
bash deploy-local.sh

# 在Windows上
.\deploy-local.ps1
```

这个脚本会提示您输入Supabase项目ID和数据库密码，然后尝试应用所有迁移。

## 自动化与CI/CD

- GitHub Actions: 自动生成迁移文件（不进行部署）
- n8n工作流程: 存放在`n8n_workflows`目录中

## 常见问题解决

- UUID类型参数需使用`::uuid`进行显式类型转换
- n8n错误通常由参数名称或类型不匹配导致

## 贡献指南

欢迎提交Pull Request或Issue来改进这个项目。

## 许可证

MIT
