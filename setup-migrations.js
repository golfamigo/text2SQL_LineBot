/**
 * 此脚本用于创建带有时间戳的SQL迁移文件
 */

const fs = require('fs');
const path = require('path');

// 获取SQL文件列表
const sqlFiles = fs.readdirSync('./').filter(file => file.endsWith('.sql'));

// 确保迁移目录存在
const migrationsDir = './supabase/migrations';
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

// 当前日期
const now = new Date();
let timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

// 为每个SQL文件创建迁移
sqlFiles.forEach((file, index) => {
    // 创建唯一的时间戳，每个文件间隔1分钟
    const minutes = String((index + 1) * 2).padStart(2, '0');
    const fileTimestamp = timestamp + '120000'; // + minutes + '00';
    
    // 获取文件名（不含扩展名）
    const baseName = path.basename(file, '.sql');
    
    // 创建新的迁移文件名
    const migrationFileName = `${fileTimestamp}_${index.toString().padStart(3, '0')}_${baseName}.sql`;
    
    // 复制文件内容
    const content = fs.readFileSync(file, 'utf8');
    
    // 写入新文件
    fs.writeFileSync(path.join(migrationsDir, migrationFileName), content);
    
    console.log(`创建迁移: ${migrationFileName}`);
});

console.log('迁移文件创建完成！');
