// Add comprehensive admin features and audit trail system
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAdminFeatures() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edufund'
    });

    console.log('✓ Connected to database\n');

    // 1. Add verified and status columns to users table
    console.log('Adding user verification fields...');
    try {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS verified TINYINT(1) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS profile_approved_at DATETIME NULL,
        ADD COLUMN IF NOT EXISTS approved_by INT NULL,
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL
      `);
      console.log('✓ User verification fields added');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log('Note: Some fields may already exist');
      }
    }

    // 2. Create audit_log table for tracking ALL admin actions
    console.log('\nCreating audit log table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        admin_id INT,
        admin_email VARCHAR(255),
        old_value TEXT,
        new_value TEXT,
        details TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_admin (admin_id),
        INDEX idx_created (created_at),
        INDEX idx_action (action_type),
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `);
    console.log('✓ Audit log table created');

    // 3. Create admin_settings table
    console.log('\nCreating admin settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_by INT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);
    console.log('✓ Admin settings table created');

    // 4. Create user_status_history table
    console.log('\nCreating user status history table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by INT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (changed_by) REFERENCES users(id)
      )
    `);
    console.log('✓ User status history table created');

    // 5. Create campaign_status_history table
    console.log('\nCreating campaign status history table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by INT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (changed_by) REFERENCES users(id)
      )
    `);
    console.log('✓ Campaign status history table created');

    // 6. Create admin_notifications table
    console.log('\nCreating admin notifications table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        priority VARCHAR(20) DEFAULT 'normal',
        read_status TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_read (read_status),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✓ Admin notifications table created');

    // 7. Add moderation fields to campaigns
    console.log('\nAdding moderation fields to campaigns...');
    try {
      await connection.query(`
        ALTER TABLE campaigns
        ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL,
        ADD COLUMN IF NOT EXISTS approved_by INT NULL,
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
        ADD COLUMN IF NOT EXISTS moderation_notes TEXT NULL,
        ADD COLUMN IF NOT EXISTS flagged TINYINT(1) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS flag_reason TEXT NULL
      `);
      console.log('✓ Campaign moderation fields added');
    } catch (err) {
      console.log('Note: Some fields may already exist');
    }

    // 8. Add moderation fields to donations
    console.log('\nAdding moderation fields to donations...');
    try {
      await connection.query(`
        ALTER TABLE donations
        ADD COLUMN IF NOT EXISTS flagged TINYINT(1) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS flag_reason TEXT NULL,
        ADD COLUMN IF NOT EXISTS verified_by INT NULL,
        ADD COLUMN IF NOT EXISTS verified_at DATETIME NULL
      `);
      console.log('✓ Donation moderation fields added');
    } catch (err) {
      console.log('Note: Some fields may already exist');
    }

    // 9. Create system_activity_log for all system actions
    console.log('\nCreating system activity log...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL,
        user_id INT,
        user_email VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        success TINYINT(1) DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_type (activity_type),
        INDEX idx_created (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✓ System activity log created');

    // 10. Update existing users to have proper status
    console.log('\nUpdating existing user statuses...');
    const [users] = await connection.query('SELECT id, email, role FROM users');
    for (const user of users) {
      if (user.role === 'admin') {
        await connection.query(
          'UPDATE users SET verified = 1, status = ? WHERE id = ?',
          ['active', user.id]
        );
      } else {
        await connection.query(
          'UPDATE users SET status = ? WHERE id = ? AND status IS NULL',
          ['pending', user.id]
        );
      }
    }
    console.log(`✓ Updated ${users.length} users`);

    // 11. Create some default admin settings
    console.log('\nCreating default admin settings...');
    const defaultSettings = [
      { key: 'campaign_auto_approve', value: 'false', desc: 'Automatically approve campaigns' },
      { key: 'require_profile_verification', value: 'true', desc: 'Require profile verification for campaigns' },
      { key: 'min_campaign_goal', value: '1000', desc: 'Minimum campaign goal amount' },
      { key: 'max_campaign_goal', value: '1000000', desc: 'Maximum campaign goal amount' },
      { key: 'campaign_review_period_days', value: '3', desc: 'Days to review campaign' },
      { key: 'enable_audit_log', value: 'true', desc: 'Enable audit logging' }
    ];

    for (const setting of defaultSettings) {
      await connection.query(
        'INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        [setting.key, setting.value, setting.desc]
      );
    }
    console.log('✓ Default settings created');

    // 12. Create admin notification for pending items
    const [pendingCampaigns] = await connection.query(
      'SELECT COUNT(*) as count FROM campaigns WHERE status IN ("draft", "pending")'
    );
    const [pendingUsers] = await connection.query(
      'SELECT COUNT(*) as count FROM users WHERE status = "pending" AND role != "admin"'
    );

    if (pendingCampaigns[0].count > 0) {
      await connection.query(
        `INSERT INTO admin_notifications (notification_type, title, message, priority)
         VALUES (?, ?, ?, ?)`,
        [
          'campaign_review',
          'Campaigns Pending Review',
          `There are ${pendingCampaigns[0].count} campaigns waiting for review`,
          'high'
        ]
      );
    }

    if (pendingUsers[0].count > 0) {
      await connection.query(
        `INSERT INTO admin_notifications (notification_type, title, message, priority)
         VALUES (?, ?, ?, ?)`,
        [
          'profile_review',
          'Profiles Pending Verification',
          `There are ${pendingUsers[0].count} user profiles waiting for verification`,
          'high'
        ]
      );
    }

    console.log('✓ Admin notifications created');

    await connection.end();

    console.log('\n========================================');
    console.log('✓ Admin system setup complete!');
    console.log('========================================');
    console.log('\nNew Features Added:');
    console.log('  ✓ User verification system');
    console.log('  ✓ Complete audit trail');
    console.log('  ✓ Status history tracking');
    console.log('  ✓ Admin notifications');
    console.log('  ✓ Campaign/donation moderation');
    console.log('  ✓ System activity logging');
    console.log('  ✓ Admin settings management');
    console.log('\nNew Tables Created:');
    console.log('  • audit_log');
    console.log('  • admin_settings');
    console.log('  • user_status_history');
    console.log('  • campaign_status_history');
    console.log('  • admin_notifications');
    console.log('  • system_activity_log');

  } catch (err) {
    console.error('✗ Error:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

addAdminFeatures();
