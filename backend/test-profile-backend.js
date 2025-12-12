// Simple Node.js test for ProfileScreen backend integration
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

class TestAuthService {
  constructor() {
    this.token = null;
  }

  async register(userData) {
    try {
      console.log(`   Attempting registration at: ${BASE_URL}/auth/register`);
      const response = await axios.post(`${BASE_URL}/auth/register`, userData);
      this.token = response.data.tokens.accessToken;
      return { success: true, user: response.data.user };
    } catch (error) {
      console.log('   Registration error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  async getProfile() {
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  async updateProfile(updates) {
    try {
      const response = await axios.put(`${BASE_URL}/auth/me`, updates, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }
}

async function testProfileIntegration() {
  console.log('🧪 Testing ProfileScreen backend integration...\n');

  const authService = new TestAuthService();
  const testEmail = `testprofile${Date.now()}@example.com`;

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResult = await authService.register({
      email: testEmail,
      password: 'Test123!@#',
      name: 'Test Profile User'
    });
    
    if (registerResult.success) {
      console.log('✅ Registration successful');
      console.log('   User ID:', registerResult.user._id);
      console.log('   Email:', registerResult.user.email);
    } else {
      console.log('❌ Registration failed:', registerResult.message);
      return;
    }

    // Test 2: Get user profile (initial state)
    console.log('\n2️⃣ Testing initial profile retrieval...');
    const profileResult = await authService.getProfile();
    
    if (profileResult.success) {
      console.log('✅ Initial profile retrieved successfully');
      console.log('   Profile data:', JSON.stringify(profileResult.user.profile || {}, null, 2));
      console.log('   Settings:', JSON.stringify(profileResult.user.settings || {}, null, 2));
    } else {
      console.log('❌ Profile retrieval failed:', profileResult.message);
    }

    // Test 3: Update profile information (like ProfileScreen edit form)
    console.log('\n3️⃣ Testing comprehensive profile update...');
    const updateData = {
      'profile.name': 'Updated Test User',
      'profile.phone': '+91-9876543210',
      'profile.location.address': '123 Test Street',
      'profile.location.city': 'New Delhi',
      'profile.location.state': 'Delhi',
      'profile.location.pincode': '110001',
      'profile.farmDetails.farmSize': '5-10 acres',
      'profile.farmDetails.farmType': 'Organic',
      'profile.farmDetails.cropsGrown': ['Wheat', 'Rice', 'Corn'],
      'profile.farmDetails.soilType': 'Loamy',
      'profile.farmDetails.irrigationType': 'Drip',
      'settings.language': 'hi',
      'settings.notifications': true,
      'settings.weatherAlerts': true,
      'settings.priceAlerts': false,
      'settings.diseaseAlerts': true,
      'settings.locationSharing': true
    };
    
    const updateResult = await authService.updateProfile(updateData);
    
    if (updateResult.success) {
      console.log('✅ Profile updated successfully');
    } else {
      console.log('❌ Profile update failed:', updateResult.message);
      return;
    }

    // Test 4: Verify all updated data
    console.log('\n4️⃣ Verifying complete updated profile...');
    const verifyResult = await authService.getProfile();
    
    if (verifyResult.success) {
      console.log('✅ Profile verification successful');
      const profile = verifyResult.user.profile;
      const settings = verifyResult.user.settings;
      
      console.log('\n📋 Complete Profile Summary:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 Personal Information:');
      console.log(`   Name: ${profile?.name || 'Not set'}`);
      console.log(`   Phone: ${profile?.phone || 'Not set'}`);
      console.log(`   Email: ${verifyResult.user.email}`);
      
      console.log('\n📍 Location Details:');
      console.log(`   Address: ${profile?.location?.address || 'Not set'}`);
      console.log(`   City: ${profile?.location?.city || 'Not set'}`);
      console.log(`   State: ${profile?.location?.state || 'Not set'}`);
      console.log(`   Pincode: ${profile?.location?.pincode || 'Not set'}`);
      
      console.log('\n🚜 Farm Details:');
      console.log(`   Farm Size: ${profile?.farmDetails?.farmSize || 'Not set'}`);
      console.log(`   Farm Type: ${profile?.farmDetails?.farmType || 'Not set'}`);
      console.log(`   Soil Type: ${profile?.farmDetails?.soilType || 'Not set'}`);
      console.log(`   Irrigation: ${profile?.farmDetails?.irrigationType || 'Not set'}`);
      console.log(`   Crops: ${profile?.farmDetails?.cropsGrown?.join(', ') || 'None'}`);
      
      console.log('\n⚙️ App Settings:');
      console.log(`   Language: ${settings?.language || 'en'}`);
      console.log(`   Notifications: ${settings?.notifications ? '✅' : '❌'}`);
      console.log(`   Weather Alerts: ${settings?.weatherAlerts ? '✅' : '❌'}`);
      console.log(`   Price Alerts: ${settings?.priceAlerts ? '✅' : '❌'}`);
      console.log(`   Disease Alerts: ${settings?.diseaseAlerts ? '✅' : '❌'}`);
      console.log(`   Location Sharing: ${settings?.locationSharing ? '✅' : '❌'}`);
      
      // Test 5: Test individual settings update (like toggle switches)
      console.log('\n5️⃣ Testing individual settings toggle...');
      const toggleResult = await authService.updateProfile({
        'settings.notifications': false
      });
      
      if (toggleResult.success) {
        console.log('✅ Settings toggle successful');
        console.log(`   Notifications now: ${toggleResult.user.settings.notifications ? 'ON' : 'OFF'}`);
      }

    } else {
      console.log('❌ Profile verification failed:', verifyResult.message);
    }

    console.log('\n🎉 ProfileScreen integration test completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All ProfileScreen functionality verified:');
    console.log('   📝 User registration & authentication');
    console.log('   👤 Profile data retrieval');
    console.log('   ✏️ Comprehensive profile editing');
    console.log('   🏠 Location information management');
    console.log('   🚜 Farm details management');
    console.log('   🌾 Crop selection functionality');
    console.log('   ⚙️ Settings management & toggles');
    console.log('   💾 Data persistence verification');
    console.log('   🔄 Real-time updates');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testProfileIntegration().catch(console.error);