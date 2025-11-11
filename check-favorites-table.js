const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkFavoritesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edufund'
  });

  try {
    console.log('✅ Connected to database\n');

    // Check if favorites table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'favorites'"
    );

    if (tables.length === 0) {
      console.log('❌ favorites table does NOT exist');
      console.log('\n📝 Creating favorites table...\n');

      await connection.query(`
        CREATE TABLE favorites (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          campaign_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
          UNIQUE KEY unique_favorite (user_id, campaign_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      console.log('✅ favorites table created successfully!');
    } else {
      console.log('✅ favorites table exists');

      // Show table structure
      const [columns] = await connection.query('DESCRIBE favorites');
      console.log('\n📋 Table structure:');
      console.table(columns);

      // Count existing favorites
      const [count] = await connection.query('SELECT COUNT(*) as total FROM favorites');
      console.log(`\n📊 Total favorites: ${count[0].total}`);

      // Show sample favorites if any
      if (count[0].total > 0) {
        const [favorites] = await connection.query(`
          SELECT
            f.id,
            u.name as user_name,
            c.title as campaign_title,
            f.created_at
          FROM favorites f
          JOIN users u ON f.user_id = u.id
          JOIN campaigns c ON f.campaign_id = c.id
          LIMIT 5
        `);

        console.log('\n📌 Sample favorites:');
        favorites.forEach((fav, index) => {
          console.log(`   ${index + 1}. ${fav.user_name} follows "${fav.campaign_title.substring(0, 40)}..."`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

checkFavoritesTable();
