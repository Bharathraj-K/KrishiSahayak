import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const FarmerButton = ({ 
  title, 
  icon, 
  onPress, 
  backgroundColor = theme.colors.primary, 
  textColor = 'white',
  disabled = false,
  fullWidth = true,
  size = 'large' 
}) => {
  const buttonStyle = [
    styles.button,
    {
      backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
      width: fullWidth ? '100%' : 'auto',
      paddingVertical: size === 'large' ? 20 : size === 'medium' ? 15 : 10,
      paddingHorizontal: size === 'large' ? 25 : size === 'medium' ? 20 : 15,
    }
  ];

  const textStyle = [
    styles.buttonText,
    {
      color: disabled ? '#666666' : textColor,
      fontSize: size === 'large' ? 18 : size === 'medium' ? 16 : 14,
    }
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={size === 'large' ? 24 : size === 'medium' ? 20 : 16}
            color={disabled ? '#666666' : textColor}
            style={styles.buttonIcon}
          />
        )}
        <Text style={textStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FarmerButton;