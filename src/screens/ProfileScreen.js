import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  Avatar,
  List,
  Switch,
  Chip,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, styles } from '../styles/theme';

const ProfileScreen = () => {
  
  const [userProfile, setUserProfile] = useState({
    name: 'Ram Singh',
    phone: '+91 98765 43210',
    location: 'Ghaziabad, Uttar Pradesh',
    farmSize: '5 Acres',
    crops: ['Wheat', 'Rice', 'Corn'],
  });

  const [settings, setSettings] = useState({
    notifications: true,
    weatherAlerts: true,
    priceAlerts: true,
    diseaseAlerts: true,
    locationSharing: true,
  });

  // Static language options for display only
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ];
  const currentLangDetails = { code: 'en', name: 'English', flag: '🇺🇸' };
  const isLoading = false;

  const cropOptions = [
    'Wheat', 'Rice', 'Corn', 'Chickpea', 'Peas', 'Mustard', 'Barley', 'Potato',
    'Onion', 'Tomato', 'Eggplant', 'Okra', 'Cabbage', 'Carrot', 'Mango', 'Guava'
  ];

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const toggleCrop = (crop) => {
    setUserProfile(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Do you really want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => console.log('Logout') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This is a permanent action. Do you really want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => console.log('Delete account')
        }
      ]
    );
  };

  return (
    <ScrollView style={profileStyles.container}>
      {/* Profile Header */}
      <Card style={[styles.card, profileStyles.headerCard]}>
        <View style={profileStyles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={userProfile.name.charAt(0)} 
            style={profileStyles.avatar}
          />
          <View style={profileStyles.profileInfo}>
            <Title style={profileStyles.userName}>{userProfile.name}</Title>
            <Paragraph style={profileStyles.userPhone}>{userProfile.phone}</Paragraph>
            <View style={profileStyles.locationContainer}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={profileStyles.userLocation}>{userProfile.location}</Text>
            </View>
            <View style={profileStyles.farmContainer}>
              <MaterialCommunityIcons 
                name="nature" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={profileStyles.farmSize}>Farm Size: {userProfile.farmSize}</Text>
            </View>
          </View>
        </View>
        <Button 
          mode="outlined" 
          style={profileStyles.editButton}
          onPress={() => Alert.alert('Edit Profile', 'Profile editing feature coming soon!')}
        >
          Edit Profile
        </Button>
      </Card>

      {/* Language Selection */}
      <Card style={[styles.card]}>
        <Title style={profileStyles.sectionTitle}>Select Language</Title>
        {isLoading && (
          <View style={profileStyles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={profileStyles.loadingText}>Changing language...</Text>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={profileStyles.languageContainer}>
            {languages.map((lang) => (
              <Chip
                key={lang.code}
                selected={currentLangDetails.code === lang.code}
                onPress={() => {}} // Non-functional for now
                style={[
                  profileStyles.languageChip,
                  currentLangDetails.code === lang.code && profileStyles.selectedLanguage
                ]}
                avatar={<Text>{lang.flag}</Text>}
                disabled={isLoading}
              >
                {lang.name}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* Crop Selection */}
      <Card style={[styles.card]}>
        <Title style={profileStyles.sectionTitle}>Your Crops</Title>
        <Paragraph style={profileStyles.sectionSubtitle}>
          Select crops you grow
        </Paragraph>
        <View style={profileStyles.cropContainer}>
          {cropOptions.map((crop) => (
            <Chip
              key={crop}
              selected={userProfile.crops.includes(crop)}
              onPress={() => toggleCrop(crop)}
              style={[
                profileStyles.cropChip,
                userProfile.crops.includes(crop) && profileStyles.selectedCrop
              ]}
            >
              {crop}
            </Chip>
          ))}
        </View>
      </Card>

      {/* Notification Settings */}
      <Card style={[styles.card]}>
        <Title style={profileStyles.sectionTitle}>Notification Settings</Title>
        
        <List.Item
          title="All Notifications"
          description="Receive all app notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Weather Alerts"
          description="Get weather-related notifications"
          left={props => <List.Icon {...props} icon="weather-cloudy" />}
          right={() => (
            <Switch
              value={settings.weatherAlerts}
              onValueChange={() => toggleSetting('weatherAlerts')}
              disabled={!settings.notifications}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Market Price Alerts"
          description="Get notifications about price changes"
          left={props => <List.Icon {...props} icon="currency-inr" />}
          right={() => (
            <Switch
              value={settings.priceAlerts}
              onValueChange={() => toggleSetting('priceAlerts')}
              disabled={!settings.notifications}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Disease Alerts"
          description="Get crop disease related notifications"
          left={props => <List.Icon {...props} icon="leaf" />}
          right={() => (
            <Switch
              value={settings.diseaseAlerts}
              onValueChange={() => toggleSetting('diseaseAlerts')}
              disabled={!settings.notifications}
            />
          )}
        />
      </Card>

      {/* Privacy Settings */}
      <Card style={[styles.card]}>
        <Title style={profileStyles.sectionTitle}>Privacy Settings</Title>
        
        <List.Item
          title="Location Sharing"
          description="Share your location for better service"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={() => (
            <Switch
              value={settings.locationSharing}
              onValueChange={() => toggleSetting('locationSharing')}
            />
          )}
        />
      </Card>

      {/* App Information */}
      <Card style={[styles.card]}>
        <Title style={profileStyles.sectionTitle}>ऐप की जानकारी</Title>
        
        <List.Item
          title="संस्करण"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        
        <Divider />
        
        <List.Item
          title="Help and Feedback"
          description="हमसे संपर्क करें"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Help', 'Help center coming soon!')}
        />
        
        <Divider />
        
        <List.Item
          title="Terms and Conditions"
          description="उपयोग की शर्तें पढ़ें"
          left={props => <List.Icon {...props} icon="file-document" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Terms', 'Terms and conditions coming soon!')}
        />
        
        <Divider />
        
        <List.Item
          title="Privacy Policy"
          description="डेटा उपयोग नीति देखें"
          left={props => <List.Icon {...props} icon="shield-check" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
        />
      </Card>

      {/* Account Actions */}
      <Card style={[styles.card]}>
        <Title style={profileStyles.sectionTitle}>खाता प्रबंधन</Title>
        
        <Button
          mode="outlined"
          style={[profileStyles.actionButton, { borderColor: theme.colors.primary }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} />
          {'  '}लॉग आउट
        </Button>
        
        <Button
          mode="outlined"
          style={[profileStyles.actionButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
          onPress={handleDeleteAccount}
        >
          <MaterialCommunityIcons name="delete" size={20} />
          {'  '}खाता हटाएं
        </Button>
      </Card>

      {/* Footer */}
      <Card style={[styles.card, { marginBottom: 20 }]}>
        <View style={profileStyles.footer}>
          <Text style={profileStyles.footerText}>
            कृषि सहायक - किसानों का डिजिटल साथी
          </Text>
          <Text style={profileStyles.footerSubtext}>
            Made with ❤️ for Indian Farmers
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userLocation: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 5,
  },
  farmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  farmSize: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 5,
  },
  editButton: {
    borderColor: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 15,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  languageChip: {
    backgroundColor: '#E8F5E8',
    marginRight: 5,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.primary,
  },
  cropContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    backgroundColor: '#E8F5E8',
    marginVertical: 2,
  },
  selectedCrop: {
    backgroundColor: theme.colors.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  actionButton: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ProfileScreen;