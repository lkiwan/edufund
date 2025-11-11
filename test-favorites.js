const mysql = require('mysql2/promise');
require('dotenv').config();

async function testFavorites() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edufund'
  });

  try {
    console.log('✅ Connected to database\n');

    // Get a user and campaign to test with
    const [users] = await connection.query('SELECT id, email FROM users WHERE role = "student" LIMIT 1');
    const [campaigns] = await connection.query('SELECT id, title FROM campaigns LIMIT 1');

    if (users.length === 0 || campaigns.length === 0) {
      console.log('❌ No users or campaigns found');
      return;
    }

    const userId = users[0].id;
    const userEmail = users[0].email;
    const campaignId = campaigns[0].id;
    const campaignTitle = campaigns[0].title;

    console.log(`📊 Testing favorites for:`);
    console.log(`   User: ${userEmail} (ID: ${userId})`);
    console.log(`   Campaign: "${campaignTitle}" (ID: ${campaignId})\n`);

    // Check if already favorited
    const [beforeCheck] = await connection.query(
      'SELECT id FROM favorites WHERE user_id = ? AND campaign_id = ?',
      [userId, campaignId]
    );
    const isFavoritedBefore = beforeCheck.length > 0;
    console.log(`   Initial state: ${isFavoritedBefore ? 'Already favorited ❤️' : 'Not favorited'}`);

    // Add to favorites (INSERT IGNORE won't error if already exists)
    await connection.query(
      'INSERT IGNORE INTO favorites (user_id, campaign_id) VALUES (?, ?)',
      [userId, campaignId]
    );

    // Check again
    const [afterAdd] = await connection.query(
      'SELECT id FROM favorites WHERE user_id = ? AND campaign_id = ?',
      [userId, campaignId]
    );
    const isFavoritedAfter = afterAdd.length > 0;
    console.log(`   After adding: ${isFavoritedAfter ? 'Favorited ❤️' : 'Not favorited'}`);

    if (isFavoritedAfter) {
      console.log('\n✅ Favorite added successfully!');
    }

    // Get user's all favorites
    const [allFavorites] = await connection.query(
      `SELECT c.id, c.title
       FROM favorites f
       JOIN campaigns c ON f.campaign_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    console.log(`\n📌 User's favorite campaigns (${allFavorites.length}):`);
    allFavorites.forEach((fav, index) => {
      console.log(`   ${index + 1}. "${fav.title.substring(0, 50)}..."`);
    });

    // Test removing favorite
    console.log('\n🗑️  Testing removal...');
    await connection.query(
      'DELETE FROM favorites WHERE user_id = ? AND campaign_id = ?',
      [userId, campaignId]
    );

    const [afterRemove] = await connection.query(
      'SELECT id FROM favorites WHERE user_id = ? AND campaign_id = ?',
      [userId, campaignId]
    );
    const isFavoritedAfterRemove = afterRemove.length > 0;
    console.log(`   After removing: ${isFavoritedAfterRemove ? 'Still favorited' : 'Removed successfully ✅'}`);

    // Add it back for testing
    await connection.query(
      'INSERT IGNORE INTO favorites (user_id, campaign_id) VALUES (?, ?)',
      [userId, campaignId]
    );
    console.log('   Added back for future tests ✅');

    // Show all users and their favorite counts
    console.log('\n📊 Favorite counts by user:');
    const [favoriteCounts] = await connection.query(`
      SELECT
        u.id,
        u.email,
        COUNT(f.id) as favorite_count
      FROM users u
      LEFT JOIN favorites f ON u.id = f.user_id
      GROUP BY u.id, u.email
      HAVING favorite_count > 0
      ORDER BY favorite_count DESC
      LIMIT 10
    `);

    favoriteCounts.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.email} - ${row.favorite_count} favorite(s)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

testFavorites();
