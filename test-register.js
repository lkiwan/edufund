// Test user registration endpoint
const axios = require('axios');

async function testRegister() {
  console.log('Testing user registration endpoint...\n');

  const testUser = {
    email: 'test' + Date.now() + '@example.com',
    password: 'testpassword123',
    role: 'student'
  };

  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', testUser);
    console.log('✓ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('✗ Registration failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Is the server running on port 3001?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegister();
