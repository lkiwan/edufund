// Run profile and account settings SQL schema
const fs = require('fs');
const path = require('path');
const pool = require('./src/db/init-db');

async function runSchema() {
  let connection;
  try {
    console.log('Reading SQL file...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'profile-account-settings-sql.sql'), 'utf8');

    // Split SQL statements by semicolon (but preserve stored procedures)
    const statements = sqlFile
      .replace(/DELIMITER \/\//g, '')
      .replace(/DELIMITER ;/g, '')
      .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
      .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

    connection = await pool.getConnection();
    console.log('Connected to database. Running schema...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement || statement.startsWith('/*') || statement === '//') continue;

      try {
        // Skip comments and empty lines
        if (statement.startsWith('--') || statement.length < 5) continue;

        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await connection.query(statement);
        successCount++;
      } catch (err) {
        // Ignore "already exists" errors
        if (err.code === 'ER_DUP_FIELDNAME' ||
            err.code === 'ER_TABLE_EXISTS_ERROR' ||
            err.message.includes('already exists') ||
            err.message.includes('Duplicate')) {
          console.log(`  → Skipped (already exists)`);
        } else {
          console.error(`  → Error: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Schema migration completed!`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Skipped/Errors: ${errorCount}`);
    console.log('\nNew tables and columns created:');
    console.log('  - Added columns to users table (first_name, last_name, phone, bio, avatar, etc.)');
    console.log('  - user_settings table');
    console.log('  - favorites table');
    console.log('  - user_sessions table');
    console.log('  - password_reset_tokens table');
    console.log('  - user_activity_log table');
    console.log('  - notifications table (updated)');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

runSchema();
