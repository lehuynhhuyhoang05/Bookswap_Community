// ============================================================
// Script: run-migration-007.js
// Chạy migration 007 để tạo user_activity_logs table
// Usage: node run-migration-007.js
// ============================================================
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'bookswap_user',
    password: 'bookswap_pass',
    database: 'bookswap_db',
    multipleStatements: true,
  });

  try {
    console.log('✅ Connected to database');

    // Đọc file migration
    const migrationPath = path.join(__dirname, 'sql', 'migrations', '007-create-user-activity-logs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration 007...');
    await connection.query(sql);
    console.log('✅ Migration 007 applied successfully!');

    // Verify table created
    const [tables] = await connection.query("SHOW TABLES LIKE 'user_activity_logs'");
    if (tables.length > 0) {
      console.log('✅ Table user_activity_logs exists');

      // Show table structure
      const [columns] = await connection.query("DESCRIBE user_activity_logs");
      console.log('\n📋 Table structure:');
      console.table(columns);

      // Show indexes
      const [indexes] = await connection.query("SHOW INDEX FROM user_activity_logs");
      console.log('\n🔑 Indexes:');
      console.table(indexes.map(idx => ({
        Key_name: idx.Key_name,
        Column_name: idx.Column_name,
        Seq_in_index: idx.Seq_in_index,
      })));
    } else {
      console.log('❌ Table user_activity_logs not found');
    }
  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    console.error(err.stack);
  } finally {
    await connection.end();
  }
}

runMigration();
