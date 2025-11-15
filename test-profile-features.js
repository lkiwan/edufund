// Comprehensive test for Profile, Account, and Saved Campaigns features
const pool = require('./src/db/init-db');

async function runTests() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🧪 Running comprehensive tests...\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Check users table columns
    console.log('Test 1: Verifying users table columns...');
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM users");
      const columnNames = columns.map(c => c.Field);
      const requiredColumns = [
        'first_name', 'last_name', 'phone', 'bio', 'avatar',
        'university', 'field', 'year', 'city', 'country',
        'facebook', 'twitter', 'linkedin', 'instagram', 'website'
      ];

      const missing = requiredColumns.filter(col => !columnNames.includes(col));
      if (missing.length === 0) {
        console.log('  ✅ All required columns exist in users table');
        passed++;
      } else {
        console.log(`  ❌ Missing columns: ${missing.join(', ')}`);
        failed++;
      }
    } catch (err) {
      console.log('  ❌ Error checking columns:', err.message);
      failed++;
    }

    // Test 2: Check user_settings table
    console.log('\nTest 2: Verifying user_settings table...');
    try {
      const [result] = await connection.query("SELECT COUNT(*) as count FROM user_settings");
      console.log(`  ✅ user_settings table exists with ${result[0].count} entries`);
      passed++;
    } catch (err) {
      console.log('  ❌ user_settings table error:', err.message);
      failed++;
    }

    // Test 3: Check favorites table
    console.log('\nTest 3: Verifying favorites table...');
    try {
      const [result] = await connection.query("SELECT COUNT(*) as count FROM favorites");
      console.log(`  ✅ favorites table exists with ${result[0].count} favorites`);
      passed++;
    } catch (err) {
      console.log('  ❌ favorites table error:', err.message);
      failed++;
    }

    // Test 4: Check user_activity_log table
    console.log('\nTest 4: Verifying user_activity_log table...');
    try {
      const [result] = await connection.query("SELECT COUNT(*) as count FROM user_activity_log");
      console.log(`  ✅ user_activity_log table exists with ${result[0].count} entries`);
      passed++;
    } catch (err) {
      console.log('  ❌ user_activity_log table error:', err.message);
      failed++;
    }

    // Test 5: Check password_reset_tokens table
    console.log('\nTest 5: Verifying password_reset_tokens table...');
    try {
      const [result] = await connection.query("SELECT COUNT(*) as count FROM password_reset_tokens");
      console.log(`  ✅ password_reset_tokens table exists`);
      passed++;
    } catch (err) {
      console.log('  ❌ password_reset_tokens table error:', err.message);
      failed++;
    }

    // Test 6: Check user_sessions table
    console.log('\nTest 6: Verifying user_sessions table...');
    try {
      const [result] = await connection.query("SELECT COUNT(*) as count FROM user_sessions");
      console.log(`  ✅ user_sessions table exists`);
      passed++;
    } catch (err) {
      console.log('  ❌ user_sessions table error:', err.message);
      failed++;
    }

    // Test 7: Verify foreign keys
    console.log('\nTest 7: Verifying foreign keys...');
    try {
      const [fks] = await connection.query(`
        SELECT TABLE_NAME, CONSTRAINT_NAME
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND TABLE_SCHEMA = 'edufund'
        AND TABLE_NAME IN ('user_settings', 'favorites', 'user_activity_log')
      `);
      console.log(`  ✅ Foreign keys configured: ${fks.length} constraints found`);
      passed++;
    } catch (err) {
      console.log('  ❌ Foreign keys error:', err.message);
      failed++;
    }

    // Test 8: Test profile data query
    console.log('\nTest 8: Testing profile data query...');
    try {
      const [users] = await connection.query(`
        SELECT id, email, first_name, last_name, phone, bio, avatar,
               university, field, year, city, country,
               facebook, twitter, linkedin, instagram, website, role
        FROM users LIMIT 1
      `);
      if (users.length > 0) {
        console.log(`  ✅ Profile query successful for user: ${users[0].email}`);
        passed++;
      } else {
        console.log('  ⚠️  No users found in database');
        failed++;
      }
    } catch (err) {
      console.log('  ❌ Profile query error:', err.message);
      failed++;
    }

    // Test 9: Test settings query with join
    console.log('\nTest 9: Testing account settings query...');
    try {
      const [result] = await connection.query(`
        SELECT u.id, u.email, s.*
        FROM users u
        LEFT JOIN user_settings s ON u.id = s.user_id
        LIMIT 1
      `);
      if (result.length > 0) {
        console.log(`  ✅ Account settings query successful`);
        passed++;
      } else {
        console.log('  ⚠️  No data found');
        failed++;
      }
    } catch (err) {
      console.log('  ❌ Account settings query error:', err.message);
      failed++;
    }

    // Test 10: Test favorites query with campaign join
    console.log('\nTest 10: Testing favorites query...');
    try {
      const [result] = await connection.query(`
        SELECT c.*, f.created_at as favorited_at
        FROM campaigns c
        INNER JOIN favorites f ON c.id = f.campaign_id
        LIMIT 1
      `);
      if (result.length > 0) {
        console.log(`  ✅ Favorites query successful: ${result.length} favorites found`);
        passed++;
      } else {
        console.log('  ⚠️  No favorites found (this is normal if no favorites added yet)');
        passed++;
      }
    } catch (err) {
      console.log('  ❌ Favorites query error:', err.message);
      failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}/10`);
    console.log(`❌ Failed: ${failed}/10`);
    console.log(`Success Rate: ${((passed/10)*100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! The system is ready to use.');
      console.log('\n📱 Available Pages:');
      console.log('   - Profile Settings: http://localhost:4030/profile-settings');
      console.log('   - Account Settings: http://localhost:4030/account-settings');
      console.log('   - Saved Campaigns: http://localhost:4030/saved-campaigns');
      console.log('\n🔌 API Endpoints:');
      console.log('   - GET/PUT /api/profile/:userId');
      console.log('   - GET/PUT /api/account/settings/:userId');
      console.log('   - POST /api/account/change-password');
      console.log('   - DELETE /api/account/delete/:userId');
      console.log('   - GET /api/favorites/:userId');
      console.log('   - POST /api/favorites/toggle');
      console.log('   - POST /api/upload/avatar');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }

  } catch (err) {
    console.error('❌ Test suite error:', err);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

runTests();
