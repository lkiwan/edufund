// This file initializes and migrates the MySQL database schema
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'edufund',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Initialize database tables
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to MySQL database');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin user exists
    const [adminRows] = await connection.query('SELECT * FROM users WHERE email = ?', ['omar@gmail.com']);

    if (adminRows.length === 0) {
      // Create admin user with hashed password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('0668328275Aa', salt);

      await connection.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['omar@gmail.com', hashedPassword, 'admin']
      );

      console.log('Admin user created successfully');
    }

    // Create demo users for testing
    const demoUsers = [
      { email: 'sarah.johnson@student.edu', password: 'password123', role: 'student' },
      { email: 'john.doe@donor.com', password: 'password123', role: 'donor' },
      { email: 'admin@edufund.com', password: 'admin123', role: 'admin' }
    ];

    for (const demoUser of demoUsers) {
      const [userRows] = await connection.query('SELECT * FROM users WHERE email = ?', [demoUser.email]);

      if (userRows.length === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(demoUser.password, salt);

        await connection.query(
          'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
          [demoUser.email, hashedPassword, demoUser.role]
        );

        console.log(`Demo ${demoUser.role} user created: ${demoUser.email}`);
      }
    }

    // Create campaigns table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        goal_amount DECIMAL(10, 2) NOT NULL,
        current_amount DECIMAL(10, 2) DEFAULT 0,
        category VARCHAR(100),
        city VARCHAR(255),
        university VARCHAR(255),
        cover_image TEXT,
        status VARCHAR(50) DEFAULT 'active',
        end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INT,
        featured TINYINT(1) DEFAULT 0,
        student_name VARCHAR(255),
        student_avatar TEXT,
        student_university VARCHAR(255),
        student_field VARCHAR(255),
        student_year VARCHAR(50),
        beneficiary_name VARCHAR(255),
        beneficiary_relationship VARCHAR(100),
        verification_status VARCHAR(50) DEFAULT 'unverified',
        trust_score INT DEFAULT 0,
        tags TEXT,
        allow_anonymous TINYINT(1) DEFAULT 1,
        allow_comments TINYINT(1) DEFAULT 1,
        withdrawn_amount DECIMAL(10, 2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create donations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT,
        donor_name VARCHAR(255),
        donor_email VARCHAR(255),
        donor_message TEXT,
        is_anonymous TINYINT(1) DEFAULT 0,
        amount DECIMAL(10, 2) NOT NULL,
        tip_amount DECIMAL(10, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'MAD',
        payment_method VARCHAR(50) DEFAULT 'card',
        status VARCHAR(50) DEFAULT 'completed',
        receipt_sent TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create campaign_metrics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_metrics (
        campaign_id INT PRIMARY KEY,
        view_count INT DEFAULT 0,
        share_count INT DEFAULT 0,
        updates_posted INT DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
      )
    `);

    // Create campaign_updates table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT,
        title VARCHAR(500),
        content TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create campaign_comments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT,
        author_name VARCHAR(255),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create favorites table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        campaign_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, campaign_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
      )
    `);

    // Create campaign_team_members table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'member',
        permissions VARCHAR(255) DEFAULT 'view,edit',
        status VARCHAR(50) DEFAULT 'pending',
        invited_by INT,
        invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        accepted_at DATETIME,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (invited_by) REFERENCES users(id)
      )
    `);

    // Create campaign_beneficiaries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        verified TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
      )
    `);

    // Create bank_accounts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        account_holder_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        bank_name VARCHAR(255),
        routing_number VARCHAR(100),
        account_type VARCHAR(50) DEFAULT 'checking',
        is_verified TINYINT(1) DEFAULT 0,
        is_default TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create withdrawals table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        bank_account_id INT,
        status VARCHAR(50) DEFAULT 'pending',
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        notes TEXT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
      )
    `);

    // Create recurring_donations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recurring_donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT,
        donor_name VARCHAR(255),
        donor_email VARCHAR(255),
        amount DECIMAL(10, 2) NOT NULL,
        frequency VARCHAR(50) DEFAULT 'monthly',
        status VARCHAR(50) DEFAULT 'active',
        next_charge_date DATETIME,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        cancelled_at DATETIME,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create donation_refunds table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donation_refunds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        requested_by INT,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (donation_id) REFERENCES donations(id),
        FOREIGN KEY (requested_by) REFERENCES users(id)
      )
    `);

    // Create thank_you_messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS thank_you_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT NOT NULL,
        campaign_id INT NOT NULL,
        message TEXT NOT NULL,
        sent_by INT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES donations(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (sent_by) REFERENCES users(id)
      )
    `);

    // Create offline_donations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS offline_donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        donor_name VARCHAR(255),
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        notes TEXT,
        recorded_by INT NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (recorded_by) REFERENCES users(id)
      )
    `);

    // Create donation_receipts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donation_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT NOT NULL,
        receipt_number VARCHAR(100) UNIQUE NOT NULL,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tax_deductible TINYINT(1) DEFAULT 0,
        FOREIGN KEY (donation_id) REFERENCES donations(id)
      )
    `);

    // Create email_notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create verification_requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        user_id INT NOT NULL,
        document_type VARCHAR(50),
        document_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        reviewed_by INT,
        notes TEXT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
      )
    `);

    // ========== PROFILE FEATURE TABLES ==========

    // Add profile columns to users table
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `).catch(() => {
      // Columns might already exist, ignore error
      console.log('Users table columns already exist or updated');
    });

    // Create notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    // Create support_tickets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    // Create user_preferences table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    // Create activity_log table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    // Create campaign_followers table (if not exists from favorites)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_followers (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    console.log('Database tables initialized successfully (including profile features)');

  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    if (connection) connection.release();
  }
}

// Initialize the database when this module is loaded
initializeDatabase().catch(console.error);

// Export the pool for use in server
module.exports = pool;
