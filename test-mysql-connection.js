// Test MySQL connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('=== Testing MySQL Connection ===\n');

  // Display configuration (without password)
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || '127.0.0.1'}`);
  console.log(`  Port: ${process.env.DB_PORT || 3306}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'edufund'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}\n`);

  let connection;

  try {
    // Test 1: Connect to MySQL server (without database)
    console.log('Test 1: Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    console.log('✓ Successfully connected to MySQL server!\n');

    // Test 2: Check if database exists
    console.log('Test 2: Checking if database exists...');
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'edufund'));

    if (dbExists) {
      console.log(`✓ Database "${process.env.DB_NAME || 'edufund'}" exists!\n`);
    } else {
      console.log(`✗ Database "${process.env.DB_NAME || 'edufund'}" does NOT exist!\n`);
      console.log('Available databases:');
      databases.forEach(db => console.log(`  - ${db.Database}`));
      return;
    }

    // Test 3: Connect to the specific database
    console.log('Test 3: Connecting to the database...');
    await connection.query(`USE ${process.env.DB_NAME || 'edufund'}`);
    console.log(`✓ Successfully connected to database "${process.env.DB_NAME || 'edufund'}"!\n`);

    // Test 4: List tables
    console.log('Test 4: Listing tables...');
    const [tables] = await connection.query('SHOW TABLES');

    if (tables.length > 0) {
      console.log(`✓ Found ${tables.length} tables:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
      console.log();
    } else {
      console.log('✗ No tables found in database\n');
    }

    // Test 5: Count users
    console.log('Test 5: Checking users table...');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Users table has ${userCount[0].count} records\n`);

    // Test 6: Count campaigns
    console.log('Test 6: Checking campaigns table...');
    const [campaignCount] = await connection.query('SELECT COUNT(*) as count FROM campaigns');
    console.log(`✓ Campaigns table has ${campaignCount[0].count} records\n`);

    // Test 7: Count donations
    console.log('Test 7: Checking donations table...');
    const [donationCount] = await connection.query('SELECT COUNT(*) as count FROM donations');
    console.log(`✓ Donations table has ${donationCount[0].count} records\n`);

    console.log('=== All tests passed! ===');
    console.log('✓ MySQL connection is working correctly!');

  } catch (err) {
    console.error('✗ Error:', err.message);
    console.error('\nFull error:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

// Run the test
testConnection();
