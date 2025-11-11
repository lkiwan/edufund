const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCampaignReview() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edufund'
  });

  try {
    console.log('✅ Connected to database\n');

    // Update 2 campaigns to "pending" status for testing
    console.log('📝 Setting campaigns to "pending" status for review...\n');

    // Get the first 2 published campaigns
    const [campaigns] = await connection.query(
      'SELECT id, title, status FROM campaigns WHERE status = "published" LIMIT 2'
    );

    if (campaigns.length === 0) {
      console.log('❌ No published campaigns found to test with');
      return;
    }

    for (const campaign of campaigns) {
      await connection.query(
        'UPDATE campaigns SET status = "pending" WHERE id = ?',
        [campaign.id]
      );
      console.log(`   ✅ Campaign #${campaign.id}: "${campaign.title.substring(0, 50)}..." set to PENDING`);
    }

    // Show all campaign statuses
    console.log('\n📊 Current campaign statuses:');
    const [statusCounts] = await connection.query(`
      SELECT status, COUNT(*) as count
      FROM campaigns
      GROUP BY status
    `);

    statusCounts.forEach(row => {
      console.log(`   ${row.status}: ${row.count} campaign(s)`);
    });

    // Show pending campaigns details
    console.log('\n🔍 Pending campaigns waiting for review:');
    const [pendingCampaigns] = await connection.query(`
      SELECT c.id, c.title, c.goal_amount, c.current_amount, c.category, c.cover_image, u.email as creator
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.status = 'pending'
      ORDER BY c.created_at DESC
    `);

    if (pendingCampaigns.length === 0) {
      console.log('   No pending campaigns');
    } else {
      pendingCampaigns.forEach((c, index) => {
        console.log(`\n   ${index + 1}. Campaign ID: ${c.id}`);
        console.log(`      Title: "${c.title.substring(0, 60)}..."`);
        console.log(`      Goal: ${c.goal_amount} MAD`);
        console.log(`      Category: ${c.category}`);
        console.log(`      Image: ${c.cover_image || 'No image'}`);
        console.log(`      Creator: ${c.creator}`);
      });
    }

    console.log('\n✅ Test setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Admins can now see these campaigns in the admin panel');
    console.log('   2. Admins can approve or reject them');
    console.log('   3. Students can see their campaigns with "Under Review" status');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

testCampaignReview();
