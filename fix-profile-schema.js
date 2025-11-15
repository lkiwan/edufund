// Fix profile and account settings schema for XAMPP MySQL
const pool = require('./src/db/init-db');

async function fixSchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to database. Fixing schema...\n');

    // 1. Add columns to users table
    console.log('Adding columns to users table...');

    const columnsToAdd = [
      { name: 'first_name', type: 'VARCHAR(100)' },
      { name: 'last_name', type: 'VARCHAR(100)' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'bio', type: 'TEXT' },
      { name: 'avatar', type: 'VARCHAR(500)' },
      { name: 'university', type: 'VARCHAR(200)' },
      { name: 'field', type: 'VARCHAR(150)' },
      { name: 'year', type: 'VARCHAR(50)' },
      { name: 'city', type: 'VARCHAR(100)' },
      { name: 'country', type: "VARCHAR(100) DEFAULT 'Morocco'" },
      { name: 'facebook', type: 'VARCHAR(300)' },
      { name: 'twitter', type: 'VARCHAR(300)' },
      { name: 'linkedin', type: 'VARCHAR(300)' },
      { name: 'instagram', type: 'VARCHAR(300)' },
      { name: 'website', type: 'VARCHAR(300)' }
    ];

    for (const col of columnsToAdd) {
      try {
        await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✓ Added column: ${col.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  → Column ${col.name} already exists`);
        } else {
          console.error(`  ✗ Error adding ${col.name}: ${err.message}`);
        }
      }
    }

    // 2. Create user_settings table
    console.log('\nCreating user_settings table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,

          email_notifications BOOLEAN DEFAULT TRUE,
          campaign_updates BOOLEAN DEFAULT TRUE,
          donation_receipts BOOLEAN DEFAULT TRUE,
          monthly_reports BOOLEAN DEFAULT TRUE,
          marketing_emails BOOLEAN DEFAULT FALSE,

          two_factor_enabled BOOLEAN DEFAULT FALSE,
          two_factor_secret VARCHAR(500),

          public_profile BOOLEAN DEFAULT TRUE,
          show_donations BOOLEAN DEFAULT TRUE,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('  ✓ user_settings table created');
    } catch (err) {
      console.log(`  → user_settings table already exists or error: ${err.message}`);
    }

    // 3. Verify/Create favorites table (might already exist from init-db.js)
    console.log('\nVerifying favorites table...');
    try {
      const [tables] = await connection.query("SHOW TABLES LIKE 'favorites'");
      if (tables.length > 0) {
        console.log('  ✓ favorites table exists');
      } else {
        await connection.query(`
          CREATE TABLE favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            campaign_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
            UNIQUE KEY unique_favorite (user_id, campaign_id),
            INDEX idx_user_favorites (user_id),
            INDEX idx_campaign_favorites (campaign_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('  ✓ favorites table created');
      }
    } catch (err) {
      console.log(`  → favorites table: ${err.message}`);
    }

    // 4. Create user_sessions table
    console.log('\nCreating user_sessions table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          session_token VARCHAR(500) NOT NULL,
          ip_address VARCHAR(50),
          user_agent TEXT,
          device_type VARCHAR(50),
          location VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,

          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_sessions (user_id),
          INDEX idx_session_token (session_token(255))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('  ✓ user_sessions table created');
    } catch (err) {
      console.log(`  → user_sessions: ${err.message}`);
    }

    // 5. Create password_reset_tokens table
    console.log('\nCreating password_reset_tokens table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(500) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_token (token(255)),
          INDEX idx_user_reset (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('  ✓ password_reset_tokens table created');
    } catch (err) {
      console.log(`  → password_reset_tokens: ${err.message}`);
    }

    // 6. Create user_activity_log table
    console.log('\nCreating user_activity_log table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_activity_log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          activity_type VARCHAR(100) NOT NULL,
          activity_description TEXT,
          ip_address VARCHAR(50),
          user_agent TEXT,
          metadata JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_activity (user_id),
          INDEX idx_activity_type (activity_type),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('  ✓ user_activity_log table created');
    } catch (err) {
      console.log(`  → user_activity_log: ${err.message}`);
    }

    // 7. Create indexes on users table
    console.log('\nCreating indexes...');
    const indexes = [
      'idx_users_email',
      'idx_users_role',
      'idx_users_created_at'
    ];

    for (const idx of indexes) {
      try {
        const column = idx.replace('idx_users_', '');
        await connection.query(`CREATE INDEX ${idx} ON users(${column})`);
        console.log(`  ✓ Created index: ${idx}`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`  → Index ${idx} already exists`);
        }
      }
    }

    // 8. Insert default settings for existing users
    console.log('\nInserting default settings for existing users...');
    try {
      await connection.query(`
        INSERT IGNORE INTO user_settings (user_id)
        SELECT id FROM users WHERE NOT EXISTS (
          SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
        )
      `);
      console.log('  ✓ Default settings created for existing users');
    } catch (err) {
      console.log(`  → Settings: ${err.message}`);
    }

    console.log('\n✅ Schema fix completed successfully!');
    console.log('\nYou can now use:');
    console.log('  - Profile Settings page');
    console.log('  - Account Settings page');
    console.log('  - Saved Campaigns page');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

fixSchema();
