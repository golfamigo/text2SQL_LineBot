@echo off
echo 初始化Git仓库并连接到GitHub...

rem 初始化Git仓库
git init

rem 将所有文件添加到暂存区
git add .

rem 创建第一个提交
git commit -m "初始化仓库结构和基本文件"

rem 重命名分支为main（如果需要）
git branch -M main

rem 添加远程仓库
git remote add origin https://github.com/golfamigo/text2SQL_LineBot.git

rem 推送到GitHub
git push -u origin main

echo 完成！
