import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import ChatAssistantScreen from '../screens/ChatAssistantScreen';
import WeatherScreen from '../screens/WeatherScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Disease Detection':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Chat Assistant':
              iconName = focused ? 'chat' : 'chat-outline';
              break;
            case 'Weather':
              iconName = focused ? 'weather-cloudy' : 'weather-cloudy-clock';
              break;
            case 'Market Prices':
              iconName = focused ? 'currency-inr' : 'cash';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: theme.colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'KrishiSahayak' }}
      />
      <Tab.Screen 
        name="Disease Detection" 
        component={DiseaseDetectionScreen}
        options={{ title: 'Disease Detection' }}
      />
      <Tab.Screen 
        name="Chat Assistant" 
        component={ChatAssistantScreen}
        options={{ title: 'Chat Assistant' }}
      />
      <Tab.Screen 
        name="Weather" 
        component={WeatherScreen}
        options={{ title: 'Weather' }}
      />
      <Tab.Screen 
        name="Market Prices" 
        component={MarketPricesScreen}
        options={{ title: 'Market Prices' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;