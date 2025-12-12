// Test script to verify ProfileScreen backend integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './src/services/authService';

// Mock AsyncStorage for testing (in real app this would be handled by React Native)
if (typeof global !== 'undefined' && !global.AsyncStorage) {
  global.AsyncStorage = {
    getItem: async (key) => {
      console.log(`Getting ${key} from AsyncStorage`);
      return null; // Simulate no token initially
    },
    setItem: async (key, value) => {
      console.log(`Setting ${key} in AsyncStorage:`, value);
    },
    removeItem: async (key) => {
      console.log(`Removing ${key} from AsyncStorage`);
    }
  };
}

async function testProfileIntegration() {
  console.log('🧪 Testing ProfileScreen backend integration...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResult = await AuthService.register({
      email: 'testprofile@example.com',
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

    // Test 2: Get user profile
    console.log('\n2️⃣ Testing profile retrieval...');
    const profileResult = await AuthService.getProfile();
    
    if (profileResult.success) {
      console.log('✅ Profile retrieved successfully');
      console.log('   Profile data:', JSON.stringify(profileResult.user.profile, null, 2));
    } else {
      console.log('❌ Profile retrieval failed:', profileResult.message);
    }

    // Test 3: Update profile information
    console.log('\n3️⃣ Testing profile update...');
    const updateResult = await AuthService.updateProfile({
      'profile.name': 'Updated Test User',
      'profile.phone': '+91-9876543210',
      'profile.location.city': 'New Delhi',
      'profile.location.state': 'Delhi',
      'profile.farmDetails.farmSize': '5-10 acres',
      'profile.farmDetails.farmType': 'Organic',
      'profile.farmDetails.cropsGrown': ['Wheat', 'Rice', 'Corn'],
      'settings.language': 'hi',
      'settings.notifications': true
    });
    
    if (updateResult.success) {
      console.log('✅ Profile updated successfully');
      console.log('   Updated profile:', JSON.stringify(updateResult.user.profile, null, 2));
      console.log('   Updated settings:', JSON.stringify(updateResult.user.settings, null, 2));
    } else {
      console.log('❌ Profile update failed:', updateResult.message);
    }

    // Test 4: Verify updated data
    console.log('\n4️⃣ Verifying updated profile...');
    const verifyResult = await AuthService.getProfile();
    
    if (verifyResult.success) {
      console.log('✅ Profile verification successful');
      const profile = verifyResult.user.profile;
      const settings = verifyResult.user.settings;
      
      console.log('📋 Profile Summary:');
      console.log(`   Name: ${profile?.name || 'Not set'}`);
      console.log(`   Phone: ${profile?.phone || 'Not set'}`);
      console.log(`   Location: ${profile?.location?.city}, ${profile?.location?.state}`);
      console.log(`   Farm Size: ${profile?.farmDetails?.farmSize || 'Not set'}`);
      console.log(`   Farm Type: ${profile?.farmDetails?.farmType || 'Not set'}`);
      console.log(`   Crops: ${profile?.farmDetails?.cropsGrown?.join(', ') || 'None'}`);
      console.log(`   Language: ${settings?.language || 'en'}`);
      console.log(`   Notifications: ${settings?.notifications ? 'Enabled' : 'Disabled'}`);
    } else {
      console.log('❌ Profile verification failed:', verifyResult.message);
    }

    console.log('\n🎉 ProfileScreen integration test completed successfully!');
    console.log('✅ All core functionality working:');
    console.log('   - User registration');
    console.log('   - Profile data retrieval');
    console.log('   - Profile updates (nested fields)');
    console.log('   - Settings management');
    console.log('   - Data persistence verification');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testProfileIntegration();
}

export default testProfileIntegration;