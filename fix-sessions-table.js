// Fix user_sessions table
const pool = require('./src/db/init-db');

async function fixSessionsTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Fixing user_sessions table...');

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
        expires_at TIMESTAMP NULL,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_sessions (user_id),
        INDEX idx_session_token (session_token(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ user_sessions table created successfully!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

fixSessionsTable();
