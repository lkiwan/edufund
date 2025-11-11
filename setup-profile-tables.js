const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupProfileTables() {
  const connection = await mysql.createConnection({
    host: '10.255.255.254',
    user: 'root',
    password: '123456',
    database: 'edufund'
  });

  try {
    console.log('Connected to database...');

    // 1. Check and update users table
    console.log('\n1. Updating users table...');
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    console.log('✅ Users table updated');

    // 2. Create notifications table
    console.log('\n2. Creating notifications table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500) DEFAULT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Notifications table created');

    // 3. Create support_tickets table
    console.log('\n3. Creating support_tickets table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        admin_response TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Support tickets table created');

    // 4. Create user_preferences table
    console.log('\n4. Creating user_preferences table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT FALSE,
        newsletter BOOLEAN DEFAULT TRUE,
        campaign_updates BOOLEAN DEFAULT TRUE,
        donation_receipts BOOLEAN DEFAULT TRUE,
        monthly_reports BOOLEAN DEFAULT TRUE,
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'UTC',
        currency VARCHAR(10) DEFAULT 'MAD',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ User preferences table created');

    // 5. Create activity_log table
    console.log('\n5. Creating activity_log table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Activity log table created');

    // 6. Verify campaign_followers exists (for saved campaigns)
    console.log('\n6. Verifying campaign_followers table...');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'campaign_followers'
    `);
    if (tables.length > 0) {
      console.log('✅ Campaign followers table exists');
    } else {
      await connection.query(`
        CREATE TABLE campaign_followers (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          campaign_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
          UNIQUE KEY unique_follow (user_id, campaign_id),
          INDEX idx_user_id (user_id),
          INDEX idx_campaign_id (campaign_id)
        )
      `);
      console.log('✅ Campaign followers table created');
    }

    console.log('\n✅ All tables created successfully!');
    console.log('\nDatabase schema ready for profile features.');

  } catch (error) {
    console.error('Error setting up tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

setupProfileTables()
  .then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
