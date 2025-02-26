/**
 * 此脚本用于创建带有时间戳的SQL迁移文件
 * 工作流程：
 * 1. 编辑根目录下的SQL文件
 * 2. 运行此脚本将修改后的文件复制到supabase/migrations目录
 * 3. 提交并推送更改，GitHub Actions将自动部署
 */

const fs = require('fs');
const path = require('path');

// 清空迁移目录函数
function clearMigrationsDir(dir) {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            fs.unlinkSync(path.join(dir, file));
        }
        console.log(`已清空目录: ${dir}`);
    }
}

// 获取SQL文件列表
const sqlFiles = fs.readdirSync('./').filter(file => file.endsWith('.sql'));
console.log(`找到 ${sqlFiles.length} 个SQL文件`);

// 确保迁移目录存在
const migrationsDir = './supabase/migrations';
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log(`创建目录: ${migrationsDir}`);
}

// 清空迁移目录
clearMigrationsDir(migrationsDir);

// 使用一致的时间戳，确保所有迁移文件使用同一个批次
const now = new Date();
let timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
const batchTimestamp = timestamp + '120000';
console.log(`使用时间戳: ${batchTimestamp}`);

// 为每个SQL文件创建迁移
sqlFiles.forEach((file, index) => {
    // 获取文件名（不含扩展名）
    const baseName = path.basename(file, '.sql');
    
    // 创建新的迁移文件名，使用序号确保顺序
    const migrationFileName = `${batchTimestamp}_${index.toString().padStart(3, '0')}_${baseName}.sql`;
    
    // 复制文件内容
    const content = fs.readFileSync(file, 'utf8');
    
    // 写入新文件
    fs.writeFileSync(path.join(migrationsDir, migrationFileName), content);
    
    console.log(`创建迁移: ${migrationFileName}`);
});

console.log('\n迁移文件创建完成！');
console.log('下一步:');
console.log('1. git add .');
console.log('2. git commit -m "更新SQL函数"');
console.log('3. git push');
console.log('GitHub Actions将自动部署更改到Supabase');
