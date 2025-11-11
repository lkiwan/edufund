// Create the edufund database in XAMPP MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  let connection;
  try {
    // Connect without specifying a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✓ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'edufund';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    console.log(`✓ Database "${dbName}" created successfully`);

    // Verify database was created
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbName);

    if (dbExists) {
      console.log(`✓ Verified: Database "${dbName}" exists`);
    } else {
      console.log(`✗ Error: Database "${dbName}" was not created`);
    }

    await connection.end();
  } catch (err) {
    console.error('Error creating database:', err.message);
    throw err;
  }
}

createDatabase();
