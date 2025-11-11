// Add a test user to the database
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addTestUser() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edufund'
    });

    console.log('✓ Connected to database');

    // Test user details
    const testUser = {
      email: 'test@example.com',
      password: 'test123',
      role: 'student'
    };

    // Check if test user already exists
    const [existing] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [testUser.email]
    );

    if (existing.length > 0) {
      console.log('✗ Test user already exists:', testUser.email);
      console.log('   User ID:', existing[0].id);
      console.log('   Role:', existing[0].role);
      console.log('   Created:', existing[0].created_at);
    } else {
      // Hash password
      const hashedPassword = bcrypt.hashSync(testUser.password, 10);

      // Insert test user
      const [result] = await connection.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [testUser.email, hashedPassword, testUser.role]
      );

      console.log('✓ Test user created successfully!');
      console.log('   Email:', testUser.email);
      console.log('   Password:', testUser.password);
      console.log('   Role:', testUser.role);
      console.log('   User ID:', result.insertId);
    }

    // Show all users
    const [users] = await connection.query('SELECT id, email, role, created_at FROM users');
    console.log('\n✓ All users in database:');
    users.forEach(user => {
      console.log(`   [${user.id}] ${user.email} (${user.role})`);
    });

    await connection.end();
  } catch (err) {
    console.error('✗ Error:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

addTestUser();
