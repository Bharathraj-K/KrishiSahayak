import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ 
  message = 'Loading...', 
  subMessage = '',
  showIcon = true 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showIcon && (
          <MaterialCommunityIcons 
            name="leaf" 
            size={80} 
            color={theme.colors.primary} 
            style={styles.icon}
          />
        )}
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
          style={styles.loader}
        />
        <Text style={styles.message}>{message}</Text>
        {subMessage && (
          <Text style={styles.subMessage}>{subMessage}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  loader: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoadingScreen;