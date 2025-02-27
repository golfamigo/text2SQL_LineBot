/**
 * 此脚本用于自动处理SQL文件的迁移和部署
 * 工作流程：
 * 1. 编辑根目录下的SQL文件
 * 2. 运行此脚本，它将：
 *    - 检测自上次 commit 以来被修改的SQL文件
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

// 使用 git diff 获取自上次 commit 以来被修改的 SQL 文件
const changedFiles = execSync('git diff --name-only --diff-filter=ACM HEAD')
    .toString()
    .split('\n')
    .filter(file => file.endsWith('.sql'));

console.log(`自上次 commit 以来，有 ${changedFiles.length} 个SQL文件被修改`);

if (changedFiles.length === 0) {
    console.log('没有SQL文件被修改，程序退出。');
    process.exit(0);
}

// 使用一致的时间戳，确保所有迁移文件使用同一个批次
const now = new Date();
let timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
const batchTimestamp = timestamp + '120000'; // 固定時間，避免不同檔案產生不同時間戳
console.log(`使用时间戳: ${batchTimestamp}`);

// 记录新创建的迁移文件
const createdMigrations = [];

// 为每个被修改的SQL文件创建迁移
changedFiles.forEach((file, index) => {
    // 获取文件名（不含扩展名）和内容
    const baseName = path.basename(file, '.sql');
    const content = fs.readFileSync(file, 'utf8');

    // 创建新的迁移文件名，使用序号确保顺序
    const migrationFileName = `${batchTimestamp}_${index.toString().padStart(3, '0')}_${baseName}.sql`;

    // 写入新文件
    fs.writeFileSync(path.join(migrationsDir, migrationFileName), content);

    console.log(`创建迁移: ${migrationFileName}`);
    createdMigrations.push(migrationFileName);
});

// 如果没有修改的文件，退出程序
if (changedFiles.length === 0) {
    console.log('没有文件被修改，无需部署。');
    process.exit(0);
}

console.log(`\n${changedFiles.length} 个文件被修改，开始部署到Supabase...`);

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
