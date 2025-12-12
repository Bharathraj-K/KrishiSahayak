import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const InfoCard = ({ 
  title, 
  subtitle, 
  icon, 
  iconColor = theme.colors.primary,
  backgroundColor = theme.colors.surface,
  children 
}) => {
  return (
    <Card style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={iconColor} 
            style={styles.icon}
          />
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children && (
        <View style={styles.cardContent}>
          {children}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  cardContent: {
    paddingTop: 10,
  },
});

export default InfoCard;