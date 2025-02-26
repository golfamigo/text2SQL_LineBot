/**
 * 此脚本用于自动处理SQL文件的迁移和部署
 * 工作流程：
 * 1. 编辑根目录下的SQL文件
 * 2. 运行此脚本，它将：
 *    - 检测被修改的SQL文件
 *    - 创建带有时间戳的迁移文件
 *    - 直接通过psql部署到Supabase
 *    - 部署成功后删除迁移文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Supabase配置（写死在代码中，方便使用）
const SUPABASE_DB_PASSWORD = '@Vu4ej388##'; // 替换为您的数据库密码

// 确保迁移目录存在
const migrationsDir = './supabase/migrations';
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log(`创建目录: ${migrationsDir}`);
}

// 获取SQL文件列表
const sqlFiles = fs.readdirSync('./').filter(file => file.endsWith('.sql'));
console.log(`找到 ${sqlFiles.length} 个SQL文件`);

if (sqlFiles.length === 0) {
    console.log('没有找到SQL文件，程序退出。');
    process.exit(0);
}

// 使用一致的时间戳，确保所有迁移文件使用同一个批次
const now = new Date();
let timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
const batchTimestamp = timestamp + '120000';
console.log(`使用时间戳: ${batchTimestamp}`);

// 查找已存在的迁移文件
const existingMigrations = fs.existsSync(migrationsDir) 
    ? fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'))
    : [];

// 记录被修改的SQL文件
const modifiedFiles = [];
// 记录新创建的迁移文件
const createdMigrations = [];

// 为每个SQL文件检查是否需要创建迁移
sqlFiles.forEach((file, index) => {
    // 获取文件名（不含扩展名）和内容
    const baseName = path.basename(file, '.sql');
    const content = fs.readFileSync(file, 'utf8');
    
    // 查找是否已经有对应此文件的迁移
    const matchingMigrations = existingMigrations.filter(m => m.includes(`_${baseName}.sql`));
    let needsMigration = true;

    if (matchingMigrations.length > 0) {
        // 检查内容是否有变化
        const latestMigration = matchingMigrations.sort().reverse()[0];
        const migrationContent = fs.readFileSync(path.join(migrationsDir, latestMigration), 'utf8');
        needsMigration = content !== migrationContent;
    }

    if (needsMigration) {
        // 创建新的迁移文件名，使用序号确保顺序
        const migrationFileName = `${batchTimestamp}_${index.toString().padStart(3, '0')}_${baseName}.sql`;
        
        // 写入新文件
        fs.writeFileSync(path.join(migrationsDir, migrationFileName), content);
        
        console.log(`创建迁移: ${migrationFileName}`);
        modifiedFiles.push(file);
        createdMigrations.push(migrationFileName);
    } else {
        console.log(`文件未修改，跳过: ${file}`);
    }
});

// 如果没有修改的文件，退出程序
if (modifiedFiles.length === 0) {
    console.log('没有文件被修改，无需部署。');
    process.exit(0);
}

console.log(`\n${modifiedFiles.length} 个文件被修改，开始部署到Supabase...`);

// 设置psql执行环境
process.env.PGPASSWORD = SUPABASE_DB_PASSWORD;

try {
    // 执行所有迁移文件（包括之前的和当前的）
    const migrationFiles = fs.readdirSync(migrationsDir).sort();
    
    for (const migrationFile of migrationFiles) {
        console.log(`执行: ${migrationFile}`);
        execSync(`psql -h aws-0-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.rgrnhvdainseuppeyqlm -d postgres -f "${path.join(migrationsDir, migrationFile)}"`, {
            stdio: 'inherit',
            env: process.env
        });
    }
    
    console.log('\n✅ 成功！SQL文件已通过psql部署到Supabase。');
    
    // 部署成功后删除所有迁移文件
    console.log('\n清理迁移文件...');
    for (const file of fs.readdirSync(migrationsDir)) {
        fs.unlinkSync(path.join(migrationsDir, file));
        console.log(`删除: ${file}`);
    }
    console.log('迁移文件已清理完毕。');
    
} catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    console.error('请检查错误并重试。');
    process.exit(1);
}
