// ============================================================
// Script: run-migration-008.js
// Chạy migration 008 để tạo admins table và insert admin users
// Usage: node run-migration-008.js
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

    // Kiểm tra admins table đã tồn tại chưa
    const [existing] = await connection.query("SHOW TABLES LIKE 'admins'");
    if (existing.length > 0) {
      console.log('⚠️  Table admins already exists. Skipping creation...');
      
      // Show current admins
      const [admins] = await connection.query(`
        SELECT 
          a.admin_id,
          a.user_id,
          u.email,
          u.full_name,
          a.admin_level,
          a.admin_since
        FROM admins a
        INNER JOIN users u ON a.user_id = u.user_id
        ORDER BY a.admin_level DESC, a.admin_since ASC
      `);
      
      console.log('\n📋 Current admins:');
      console.table(admins);
      
      await connection.end();
      return;
    }

    // Đọc file migration
    const migrationPath = path.join(__dirname, 'sql', 'migrations', '008-create-admins-table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration 008...');
    await connection.query(sql);
    console.log('✅ Migration 008 applied successfully!');

    // Verify table created
    const [tables] = await connection.query("SHOW TABLES LIKE 'admins'");
    if (tables.length > 0) {
      console.log('✅ Table admins created');

      // Show table structure
      const [columns] = await connection.query("DESCRIBE admins");
      console.log('\n📋 Table structure:');
      console.table(columns);

      // Show indexes
      const [indexes] = await connection.query("SHOW INDEX FROM admins");
      console.log('\n🔑 Indexes:');
      console.table(indexes.map(idx => ({
        Key_name: idx.Key_name,
        Column_name: idx.Column_name,
        Unique: idx.Non_unique === 0 ? 'YES' : 'NO',
      })));

      // Show inserted admins
      const [admins] = await connection.query(`
        SELECT 
          a.admin_id,
          a.user_id,
          u.email,
          u.full_name,
          a.admin_level,
          CASE 
            WHEN a.admin_level = 3 THEN 'Root Admin'
            WHEN a.admin_level = 2 THEN 'Super Admin'
            ELSE 'Admin'
          END as role,
          a.admin_since
        FROM admins a
        INNER JOIN users u ON a.user_id = u.user_id
        ORDER BY a.admin_level DESC, a.admin_since ASC
      `);
      
      console.log('\n👥 Admin users inserted:');
      console.table(admins);
      
      console.log(`\n✅ Total admins created: ${admins.length}`);

      // Test FK constraint
      console.log('\n🔗 Testing FK constraint with audit_logs...');
      const [fks] = await connection.query(`
        SELECT 
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'bookswap_db'
          AND REFERENCED_TABLE_NAME = 'admins'
      `);
      
      if (fks.length > 0) {
        console.log('✅ FK constraints working:');
        console.table(fks);
      } else {
        console.log('⚠️  No FK constraints found pointing to admins table');
      }

    } else {
      console.log('❌ Table admins not created');
    }
  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    console.error(err.stack);
  } finally {
    await connection.end();
  }
}

runMigration();
