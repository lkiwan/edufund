// Test avatar upload endpoint
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function testAvatarUpload() {
  console.log('🧪 Testing Avatar Upload Endpoint...\n');

  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    const testImagePath = path.join(__dirname, 'test-avatar.png');
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log('✅ Test image created');

    // Create form data
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(testImagePath));
    formData.append('userId', '2');

    console.log('📤 Uploading to /api/upload/avatar...');

    // Upload
    const response = await fetch('http://localhost:3001/api/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const data = await response.json();

    // Clean up test image
    fs.unlinkSync(testImagePath);

    // Check result
    if (data.success) {
      console.log('✅ Upload successful!');
      console.log('   Avatar URL:', data.url);
      console.log('   Filename:', data.filename);
      console.log('\n🎉 Avatar upload is working correctly!');
      console.log('\nYou can now upload profile pictures from the UI:');
      console.log('   http://localhost:4030/profile-settings');
    } else {
      console.log('❌ Upload failed:', data.error || data.message);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure server is running on port 3001');
    console.error('2. Check uploads/campaigns directory exists');
    console.error('3. Verify sharp package is installed (npm install sharp)');
  }
}

testAvatarUpload();
