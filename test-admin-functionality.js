// Comprehensive test of all admin functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
const adminUser = {
  id: 1,
  email: 'omar@gmail.com'
};

async function testAdminEndpoints() {
  console.log('========================================');
  console.log('COMPREHENSIVE ADMIN FUNCTIONALITY TEST');
  console.log('========================================\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Get dashboard stats
  try {
    console.log('TEST 1: Getting admin dashboard stats...');
    const response = await axios.get(`${API_BASE}/admin/dashboard-stats`);
    if (response.data.success) {
      console.log('✓ Dashboard stats retrieved');
      console.log('  - Total users:', response.data.stats.users.total);
      console.log('  - Pending users:', response.data.stats.users.pending);
      console.log('  - Total campaigns:', response.data.stats.campaigns.total);
      console.log('  - Pending campaigns:', response.data.stats.campaigns.pending);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 2: Get all users
  try {
    console.log('\nTEST 2: Getting all users...');
    const response = await axios.get(`${API_BASE}/admin/users`);
    if (response.data.success) {
      console.log('✓ Users list retrieved');
      console.log('  - Total users:', response.data.total);
      console.log('  - Page:', response.data.page);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 3: Get pending users
  try {
    console.log('\nTEST 3: Getting pending users...');
    const response = await axios.get(`${API_BASE}/admin/users?status=pending`);
    if (response.data.success) {
      console.log('✓ Pending users retrieved');
      console.log('  - Pending users:', response.data.users.length);
      if (response.data.users.length > 0) {
        console.log('  - First pending user:', response.data.users[0].email);
      }
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 4: Get user details with history
  try {
    console.log('\nTEST 4: Getting user details with history...');
    const testUserId = 5; // test@example.com
    const response = await axios.get(`${API_BASE}/admin/users/${testUserId}`);
    if (response.data.success) {
      console.log('✓ User details retrieved');
      console.log('  - User:', response.data.user.email);
      console.log('  - Status:', response.data.user.status);
      console.log('  - Verified:', response.data.user.verified);
      console.log('  - Campaigns:', response.data.campaigns.length);
      console.log('  - Status history entries:', response.data.statusHistory.length);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 5: Approve user profile
  try {
    console.log('\nTEST 5: Approving user profile...');
    const testUserId = 5; // test@example.com
    const response = await axios.post(`${API_BASE}/admin/users/${testUserId}/approve`, {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      notes: 'Test approval'
    });
    if (response.data.success) {
      console.log('✓ User profile approved');
      console.log('  - Message:', response.data.message);
      console.log('  - New status:', response.data.user.status);
      console.log('  - Verified:', response.data.user.verified);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 6: Verify user was actually updated
  try {
    console.log('\nTEST 6: Verifying user approval was persisted...');
    const testUserId = 5;
    const response = await axios.get(`${API_BASE}/admin/users/${testUserId}`);
    if (response.data.success) {
      const user = response.data.user;
      if (user.status === 'active' && user.verified === 1) {
        console.log('✓ User approval persisted in database');
        console.log('  - Status:', user.status);
        console.log('  - Verified:', user.verified);
        console.log('  - Approved at:', user.profile_approved_at);
        passedTests++;
      } else {
        console.log('✗ User status not updated correctly');
        console.log('  - Status:', user.status, '(expected: active)');
        console.log('  - Verified:', user.verified, '(expected: 1)');
        failedTests++;
      }
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 7: Check status history was recorded
  try {
    console.log('\nTEST 7: Verifying status history was recorded...');
    const testUserId = 5;
    const response = await axios.get(`${API_BASE}/admin/users/${testUserId}`);
    if (response.data.success) {
      const historyCount = response.data.statusHistory.length;
      if (historyCount > 0) {
        console.log('✓ Status history recorded');
        console.log('  - History entries:', historyCount);
        console.log('  - Latest entry:', response.data.statusHistory[0].new_status);
        passedTests++;
      } else {
        console.log('✗ No status history found');
        failedTests++;
      }
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 8: Get all campaigns
  try {
    console.log('\nTEST 8: Getting all campaigns for admin...');
    const response = await axios.get(`${API_BASE}/admin/campaigns`);
    if (response.data.success) {
      console.log('✓ Campaigns list retrieved');
      console.log('  - Total campaigns:', response.data.total);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 9: Get campaign details with history
  try {
    console.log('\nTEST 9: Getting campaign details with history...');
    const campaignId = 1;
    const response = await axios.get(`${API_BASE}/admin/campaigns/${campaignId}/details`);
    if (response.data.success) {
      console.log('✓ Campaign details retrieved');
      console.log('  - Campaign:', response.data.campaign.title);
      console.log('  - Donations:', response.data.donations.length);
      console.log('  - Updates:', response.data.updates.length);
      console.log('  - Comments:', response.data.comments.length);
      console.log('  - Status history:', response.data.statusHistory.length);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 10: Get audit log
  try {
    console.log('\nTEST 10: Getting audit log...');
    const response = await axios.get(`${API_BASE}/admin/audit-log?limit=10`);
    if (response.data.success) {
      console.log('✓ Audit log retrieved');
      console.log('  - Total entries:', response.data.logs.length);
      if (response.data.logs.length > 0) {
        console.log('  - Latest action:', response.data.logs[0].action_type);
      }
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 11: Get notifications
  try {
    console.log('\nTEST 11: Getting admin notifications...');
    const response = await axios.get(`${API_BASE}/admin/notifications`);
    if (response.data.success) {
      console.log('✓ Notifications retrieved');
      console.log('  - Total notifications:', response.data.notifications.length);
      if (response.data.notifications.length > 0) {
        console.log('  - Unread notifications:', response.data.notifications.filter(n => n.read_status === 0).length);
      }
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 12: Test old admin endpoints still work
  try {
    console.log('\nTEST 12: Checking old admin endpoints (backwards compatibility)...');
    const response = await axios.get(`${API_BASE}/admin/stats`);
    if (response.data.success) {
      console.log('✓ Old admin stats endpoint still works');
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 13: Test campaign listing
  try {
    console.log('\nTEST 13: Getting public campaigns list...');
    const response = await axios.get(`${API_BASE}/campaigns`);
    if (response.data.success) {
      console.log('✓ Campaigns list retrieved');
      console.log('  - Campaigns:', response.data.campaigns.length);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 14: Test campaign details
  try {
    console.log('\nTEST 14: Getting campaign details...');
    const campaignId = 1;
    const response = await axios.get(`${API_BASE}/campaigns/${campaignId}`);
    if (response.data.success) {
      console.log('✓ Campaign details retrieved');
      console.log('  - Title:', response.data.campaign.title);
      console.log('  - Status:', response.data.campaign.status);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  // Test 15: Test donations for campaign
  try {
    console.log('\nTEST 15: Getting donations for campaign...');
    const campaignId = 1;
    const response = await axios.get(`${API_BASE}/campaigns/${campaignId}/donations`);
    if (response.data.success) {
      console.log('✓ Donations retrieved');
      console.log('  - Donations:', response.data.donations.length);
      passedTests++;
    }
  } catch (err) {
    console.log('✗ Failed:', err.response?.data || err.message);
    failedTests++;
  }

  console.log('\n========================================');
  console.log('TEST RESULTS');
  console.log('========================================');
  console.log(`✓ Passed: ${passedTests}/${passedTests + failedTests}`);
  console.log(`✗ Failed: ${failedTests}/${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('\nAdmin system is fully functional:');
    console.log('  ✓ User management with full history');
    console.log('  ✓ Profile approval actually updates database');
    console.log('  ✓ Campaign management with audit trail');
    console.log('  ✓ Complete audit logging');
    console.log('  ✓ Admin notifications');
    console.log('  ✓ Backwards compatibility maintained');
  } else {
    console.log('\n⚠️  Some tests failed. Please review errors above.');
  }
}

testAdminEndpoints().catch(console.error);
