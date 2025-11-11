// Test XAMPP MySQL connection with different passwords
const mysql = require('mysql2/promise');

async function testConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: password
    });

    console.log(`✓ Connected successfully with password: "${password || '(empty)'}"`);

    // Test database existence
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\nAvailable databases:', databases.map(db => db.Database).join(', '));

    await connection.end();
    return true;
  } catch (err) {
    console.log(`✗ Failed with password "${password || '(empty)'}": ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('=== Testing XAMPP MySQL Connection ===\n');

  // Test common passwords
  const passwords = ['', '132456', 'root', 'admin'];

  for (const pwd of passwords) {
    const success = await testConnection(pwd);
    if (success) {
      console.log(`\n✓ SOLUTION: Use password "${pwd || '(empty)'}" in your .env file`);
      break;
    }
  }
}

runTests();
