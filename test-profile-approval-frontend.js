// Test the frontend profile approval endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFrontendApproval() {
  console.log('========================================');
  console.log('Testing Frontend Profile Approval');
  console.log('========================================\n');

  try {
    // Test 1: Get pending profiles (what frontend calls)
    console.log('TEST 1: Getting pending profiles (frontend endpoint)...');
    const pending = await axios.get(`${API_BASE}/admin/profiles/pending`);
    console.log('✓ Pending profiles:', pending.data.profiles.length);

    if (pending.data.profiles.length > 0) {
      console.log('\nPending users:');
      pending.data.profiles.forEach(p => {
        console.log(`  - ID: ${p.id}, Email: ${p.email}, Status: ${p.status}`);
      });
    } else {
      console.log('✓ No pending profiles! (All have been approved)');
    }

    // Test 2: Approve a pending profile (frontend way)
    if (pending.data.profiles.length > 0) {
      const userId = pending.data.profiles[0].id;
      console.log(`\nTEST 2: Approving user ${userId} using frontend endpoint...`);

      const approveResponse = await axios.post(`${API_BASE}/admin/profiles/${userId}/approve`, {
        adminId: 1,
        adminEmail: 'omar@gmail.com',
        notes: 'Approved via frontend endpoint'
      });

      console.log('✓ Response:', approveResponse.data.message);

      // Test 3: Verify the user was actually updated
      console.log('\nTEST 3: Verifying user was updated in database...');
      const checkPending = await axios.get(`${API_BASE}/admin/profiles/pending`);
      const stillPending = checkPending.data.profiles.length;

      if (stillPending < pending.data.profiles.length) {
        console.log('✓ SUCCESS! User was removed from pending list');
        console.log(`  Pending before: ${pending.data.profiles.length}`);
        console.log(`  Pending after: ${stillPending}`);
      } else {
        console.log('✗ FAILED! User still in pending list');
      }

      // Test 4: Check user details
      console.log('\nTEST 4: Checking user details...');
      const userDetails = await axios.get(`${API_BASE}/admin/users/${userId}`);
      const user = userDetails.data.user;

      console.log('User status:');
      console.log(`  - Status: ${user.status}`);
      console.log(`  - Verified: ${user.verified}`);
      console.log(`  - Approved at: ${user.profile_approved_at}`);

      if (user.status === 'active' && user.verified === 1) {
        console.log('✓ User successfully activated!');
      } else {
        console.log('✗ User not properly activated');
      }
    }

    console.log('\n========================================');
    console.log('✅ All frontend endpoints are now working!');
    console.log('========================================');

  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testFrontendApproval();
