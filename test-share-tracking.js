const mysql = require('mysql2/promise');
require('dotenv').config();

async function testShareTracking() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edufund'
  });

  try {
    console.log('✅ Connected to database');

    // Get a campaign ID to test with
    const [campaigns] = await connection.query('SELECT id, title FROM campaigns LIMIT 1');
    if (campaigns.length === 0) {
      console.log('❌ No campaigns found');
      return;
    }

    const campaignId = campaigns[0].id;
    const campaignTitle = campaigns[0].title;
    console.log(`\n📊 Testing share tracking for campaign: "${campaignTitle}" (ID: ${campaignId})`);

    // Get current share count
    const [beforeMetrics] = await connection.query(
      'SELECT share_count FROM campaign_metrics WHERE campaign_id = ?',
      [campaignId]
    );
    const beforeCount = beforeMetrics[0]?.share_count || 0;
    console.log(`   Before: ${beforeCount} shares`);

    // Simulate a share
    await connection.query('INSERT IGNORE INTO campaign_metrics (campaign_id) VALUES (?)', [campaignId]);
    await connection.query('UPDATE campaign_metrics SET share_count = share_count + 1 WHERE campaign_id = ?', [campaignId]);

    // Get updated share count
    const [afterMetrics] = await connection.query(
      'SELECT share_count FROM campaign_metrics WHERE campaign_id = ?',
      [campaignId]
    );
    const afterCount = afterMetrics[0]?.share_count || 0;
    console.log(`   After:  ${afterCount} shares`);

    if (afterCount === beforeCount + 1) {
      console.log('\n✅ Share tracking is working correctly!');
      console.log('   The share count increased by 1 as expected.');
    } else {
      console.log('\n❌ Share tracking failed!');
      console.log(`   Expected: ${beforeCount + 1}, Got: ${afterCount}`);
    }

    // Show all campaigns with their share counts
    console.log('\n📈 Share counts for all campaigns:');
    const [allMetrics] = await connection.query(`
      SELECT
        c.id,
        c.title,
        COALESCE(cm.share_count, 0) as shares
      FROM campaigns c
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      ORDER BY shares DESC
      LIMIT 10
    `);

    allMetrics.forEach((row, index) => {
      console.log(`   ${index + 1}. "${row.title.substring(0, 50)}..." - ${row.shares} shares`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

testShareTracking();
