// Initialize database tables fresh (no cache)
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Read from .env manually to avoid cache
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const config = {
  host: envVars.DB_HOST || 'localhost',
  port: parseInt(envVars.DB_PORT) || 3306,
  user: envVars.DB_USER || 'root',
  password: envVars.DB_PASSWORD || '',
  database: envVars.DB_NAME || 'edufund'
};

console.log('Configuration:', {
  ...config,
  password: config.password ? '***' : '(empty)'
});

async function initializeTables() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

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
    console.log('✓ Users table created');

    // Create admin user
    const [adminRows] = await connection.query('SELECT * FROM users WHERE email = ?', ['omar@gmail.com']);
    if (adminRows.length === 0) {
      const hashedPassword = bcrypt.hashSync('0668328275Aa', 10);
      await connection.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['omar@gmail.com', hashedPassword, 'admin']
      );
      console.log('✓ Admin user created');
    }

    // Create demo users
    const demoUsers = [
      { email: 'sarah.johnson@student.edu', password: 'password123', role: 'student' },
      { email: 'john.doe@donor.com', password: 'password123', role: 'donor' },
      { email: 'admin@edufund.com', password: 'admin123', role: 'admin' }
    ];

    for (const demoUser of demoUsers) {
      const [userRows] = await connection.query('SELECT * FROM users WHERE email = ?', [demoUser.email]);
      if (userRows.length === 0) {
        const hashedPassword = bcrypt.hashSync(demoUser.password, 10);
        await connection.query(
          'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
          [demoUser.email, hashedPassword, demoUser.role]
        );
        console.log(`✓ Demo ${demoUser.role} created: ${demoUser.email}`);
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
    console.log('✓ Campaigns table created');

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
    console.log('✓ Donations table created');

    // Create all other tables...
    const otherTables = [
      'campaign_metrics',
      'campaign_updates',
      'campaign_comments',
      'favorites',
      'campaign_team_members',
      'campaign_beneficiaries',
      'bank_accounts',
      'withdrawals',
      'recurring_donations',
      'donation_refunds',
      'thank_you_messages',
      'offline_donations',
      'donation_receipts',
      'email_notifications',
      'verification_requests'
    ];

    // Add remaining tables
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

    console.log('✓ All tables created successfully');

    // Show table list
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n✓ Database initialized with', tables.length, 'tables');

    await connection.end();
    console.log('\n✓ Setup complete! Your project is now connected to XAMPP MySQL.');
  } catch (err) {
    console.error('✗ Error:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

initializeTables();
