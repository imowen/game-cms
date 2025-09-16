const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrate() {
  console.log('🔄 Starting database migration...');

  try {
    // 连接数据库
    const db = await open({
      filename: path.join(process.cwd(), 'games.db'),
      driver: sqlite3.Database
    });

    // 检查status列是否存在
    const tableInfo = await db.all("PRAGMA table_info(games)");
    const hasStatusColumn = tableInfo.some(col => col.name === 'status');

    if (!hasStatusColumn) {
      console.log('📝 Adding status column...');
      await db.run('ALTER TABLE games ADD COLUMN status TEXT DEFAULT "published"');
      console.log('✅ Status column added successfully');
    } else {
      console.log('✅ Status column already exists');
    }

    // 确保现有游戏有默认状态
    const result = await db.run('UPDATE games SET status = "published" WHERE status IS NULL OR status = ""');
    console.log(`📝 Updated ${result.changes} games with default status`);

    await db.close();
    console.log('✅ Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();