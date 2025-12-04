import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/contexts/LanguageContext';
import MainNavigator from './src/navigation/MainNavigator';
import { theme } from './src/styles/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={theme.colors.primary} />
            <MainNavigator />
          </NavigationContainer>
        </PaperProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}