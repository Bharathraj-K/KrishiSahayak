import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Card, Title, Paragraph, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, styles } from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, [currentTime]);

  const quickActions = [
    {
      id: 1,
      title: 'Disease Detection',
      subtitle: 'Identify crop diseases',
      icon: 'camera',
      color: '#E8F5E8',
      onPress: () => navigation.navigate('Disease Detection'),
    },
    {
      id: 2,
      title: 'Ask Assistant',
      subtitle: 'Get farming advice',
      icon: 'chat',
      color: '#E3F2FD',
      onPress: () => navigation.navigate('Chat Assistant'),
    },
    {
      id: 3,
      title: 'Weather Info',
      subtitle: 'Check today\'s weather',
      icon: 'weather-cloudy',
      color: '#FFF3E0',
      onPress: () => navigation.navigate('Weather'),
    },
    {
      id: 4,
      title: 'Market Prices',
      subtitle: 'View today\'s rates',
      icon: 'currency-inr',
      color: '#F3E5F5',
      onPress: () => navigation.navigate('Market Prices'),
    },
  ];

  const todayTips = [
    'Morning 6-8 AM is the best time for field spraying',
    'Neem oil is a natural way to repel insects',
    'Check soil moisture before irrigation',
  ];

  const weatherSummary = {
    temperature: '28°C',
    humidity: '65%',
    rainfall: '0mm',
    condition: 'Sunny'
  };

  return (
    <ScrollView style={homeStyles.container}>
      {/* Greeting Section */}
      <Card style={[homeStyles.greetingCard, styles.card]}>
        <View style={homeStyles.greetingContent}>
          <Avatar.Icon 
            size={60} 
            icon="account" 
            style={homeStyles.avatar}
          />
          <View style={homeStyles.greetingText}>
            <Title style={homeStyles.greetingTitle}>{greeting}</Title>
            <Paragraph style={homeStyles.dateText}>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Paragraph>
          </View>
        </View>
      </Card>

      {/* Quick Weather Card */}
      <Card style={[homeStyles.weatherCard, styles.card]}>
        <Title style={homeStyles.sectionTitle}>Today's Weather</Title>
        <View style={homeStyles.weatherContent}>
          <View style={homeStyles.weatherItem}>
            <MaterialCommunityIcons name="thermometer" size={24} color={theme.colors.primary} />
            <Text style={homeStyles.weatherText}>{weatherSummary.temperature}</Text>
          </View>
          <View style={homeStyles.weatherItem}>
            <MaterialCommunityIcons name="water-percent" size={24} color={theme.colors.info} />
            <Text style={homeStyles.weatherText}>{weatherSummary.humidity}</Text>
          </View>
          <View style={homeStyles.weatherItem}>
            <MaterialCommunityIcons name="weather-rainy" size={24} color={theme.colors.info} />
            <Text style={homeStyles.weatherText}>{weatherSummary.rainfall}</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={[styles.card]}>
        <Title style={homeStyles.sectionTitle}>Quick Actions</Title>
        <View style={homeStyles.actionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[homeStyles.actionCard, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <MaterialCommunityIcons 
                name={action.icon} 
                size={40} 
                color={theme.colors.primary}
              />
              <Text style={homeStyles.actionTitle}>{action.title}</Text>
              <Text style={homeStyles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Today's Tips */}
      <Card style={[styles.card]}>
        <Title style={homeStyles.sectionTitle}>Today's Tips</Title>
        {todayTips.map((tip, index) => (
          <View key={index} style={homeStyles.tipContainer}>
            <MaterialCommunityIcons 
              name="lightbulb-on" 
              size={20} 
              color={theme.colors.warning} 
            />
            <Text style={homeStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      {/* Emergency Contact */}
      <Card style={[styles.card, { marginBottom: 20 }]}>
        <Title style={homeStyles.sectionTitle}>Emergency Contact</Title>
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: theme.colors.error }]}
          onPress={() => Alert.alert('Emergency', 'Farmer Helpline: 1800-180-1551')}
        >
          <MaterialCommunityIcons name="phone" size={20} color="white" />
          {'  '}Farmer Helpline
        </Button>
      </Card>
    </ScrollView>
  );
};

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  greetingCard: {
    backgroundColor: theme.colors.primary,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    backgroundColor: theme.colors.secondary,
  },
  greetingText: {
    marginLeft: 15,
    flex: 1,
  },
  greetingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateText: {
    color: 'white',
    opacity: 0.9,
  },
  weatherCard: {
    backgroundColor: '#E8F5E8',
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 5,
    minHeight: 120,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default HomeScreen;