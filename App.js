import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from './src/contexts/LanguageContext';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import { theme } from './src/styles/theme';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthChecked = (isAuth) => {
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthLoadingScreen onAuthChecked={handleAuthChecked} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={theme.colors.primary} />
            {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </PaperProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}