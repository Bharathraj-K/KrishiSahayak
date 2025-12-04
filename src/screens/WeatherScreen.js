import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl 
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  ActivityIndicator,
  Chip 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, styles } from '../styles/theme';

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockWeatherData = {
        location: 'Noida, Uttar Pradesh',
        current: {
          temperature: 28,
          condition: 'Sunny',
          humidity: 65,
          windSpeed: 12,
          pressure: 1013,
          uvIndex: 6,
          visibility: 10,
          icon: 'weather-sunny'
        },
        hourly: [
          { time: '12:00', temp: 28, icon: 'weather-sunny', condition: 'Sunny' },
          { time: '15:00', temp: 31, icon: 'weather-partly-cloudy', condition: 'Partly Cloudy' },
          { time: '18:00', temp: 29, icon: 'weather-cloudy', condition: 'Cloudy' },
          { time: '21:00', temp: 26, icon: 'weather-night', condition: 'Clear Night' },
        ],
        daily: [
          { day: 'Today', high: 32, low: 24, condition: 'Sunny', icon: 'weather-sunny', rain: 0 },
          { day: 'Tomorrow', high: 30, low: 23, condition: 'Cloudy', icon: 'weather-cloudy', rain: 20 },
          { day: 'Day After', high: 28, low: 21, condition: 'Rainy', icon: 'weather-rainy', rain: 80 },
          { day: 'Monday', high: 29, low: 22, condition: 'Partly Cloudy', icon: 'weather-partly-cloudy', rain: 10 },
          { day: 'Tuesday', high: 33, low: 25, condition: 'Sunny', icon: 'weather-sunny', rain: 0 },
        ],
        alerts: [
          {
            type: 'warning',
            title: 'Heavy Rain Warning',
            description: 'Heavy rain expected in next 24 hours. Protect your crops.'
          }
        ],
        farmingAdvice: [
          'Complete spraying work early morning today',
          'Avoid field work from 12-3 PM',
          'Evening is suitable for irrigation work'
        ]
      };
      setWeatherData(mockWeatherData);
      setLoading(false);
      setRefreshing(false);
    }, 1500);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeatherData();
  };

  const getWeatherIcon = (iconName) => {
    const iconMap = {
      'weather-sunny': 'weather-sunny',
      'weather-cloudy': 'weather-cloudy',
      'weather-partly-cloudy': 'weather-partly-cloudy',
      'weather-rainy': 'weather-rainy',
      'weather-night': 'weather-night',
    };
    return iconMap[iconName] || 'weather-sunny';
  };

  const getRainColor = (rainChance) => {
    if (rainChance >= 70) return theme.colors.error;
    if (rainChance >= 40) return theme.colors.warning;
    return theme.colors.info;
  };

  if (loading && !weatherData) {
    return (
      <View style={weatherStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={weatherStyles.loadingText}>Loading weather information...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={weatherStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Weather */}
      <Card style={[styles.card, weatherStyles.currentWeatherCard]}>
        <View style={weatherStyles.currentWeatherHeader}>
          <View style={weatherStyles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={20} color="white" />
            <Text style={weatherStyles.locationText}>{weatherData?.location}</Text>
          </View>
          <Button onPress={onRefresh} textColor="white">
            <MaterialCommunityIcons name="refresh" size={16} />
            {'  '}Update
          </Button>
        </View>

        <View style={weatherStyles.currentWeatherContent}>
          <View style={weatherStyles.temperatureSection}>
            <MaterialCommunityIcons 
              name={getWeatherIcon(weatherData?.current.icon)} 
              size={80} 
              color="white" 
            />
            <Text style={weatherStyles.temperature}>
              {weatherData?.current.temperature}°C
            </Text>
          </View>
          <Text style={weatherStyles.condition}>
            {weatherData?.current.condition}
          </Text>
        </View>
      </Card>

      {/* Weather Alerts */}
      {weatherData?.alerts?.map((alert, index) => (
        <Card key={index} style={[styles.card, weatherStyles.alertCard]}>
          <View style={weatherStyles.alertHeader}>
            <MaterialCommunityIcons name="alert" size={24} color={theme.colors.error} />
            <Text style={weatherStyles.alertTitle}>{alert.title}</Text>
          </View>
          <Text style={weatherStyles.alertDescription}>{alert.description}</Text>
        </Card>
      ))}

      {/* Detailed Weather Info */}
      <Card style={[styles.card]}>
        <Title style={weatherStyles.sectionTitle}>Detailed Information</Title>
        <View style={weatherStyles.detailsGrid}>
          <View style={weatherStyles.detailItem}>
            <MaterialCommunityIcons name="water-percent" size={24} color={theme.colors.info} />
            <Text style={weatherStyles.detailLabel}>Humidity</Text>
            <Text style={weatherStyles.detailValue}>{weatherData?.current.humidity}%</Text>
          </View>
          <View style={weatherStyles.detailItem}>
            <MaterialCommunityIcons name="weather-windy" size={24} color={theme.colors.info} />
            <Text style={weatherStyles.detailLabel}>Wind</Text>
            <Text style={weatherStyles.detailValue}>{weatherData?.current.windSpeed} km/h</Text>
          </View>
          <View style={weatherStyles.detailItem}>
            <MaterialCommunityIcons name="gauge" size={24} color={theme.colors.info} />
            <Text style={weatherStyles.detailLabel}>Pressure</Text>
            <Text style={weatherStyles.detailValue}>{weatherData?.current.pressure} mb</Text>
          </View>
          <View style={weatherStyles.detailItem}>
            <MaterialCommunityIcons name="white-balance-sunny" size={24} color={theme.colors.warning} />
            <Text style={weatherStyles.detailLabel}>UV Index</Text>
            <Text style={weatherStyles.detailValue}>{weatherData?.current.uvIndex}</Text>
          </View>
        </View>
      </Card>

      {/* Hourly Forecast */}
      <Card style={[styles.card]}>
        <Title style={weatherStyles.sectionTitle}>Today's Weather</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={weatherStyles.hourlyContainer}>
            {weatherData?.hourly.map((hour, index) => (
              <View key={index} style={weatherStyles.hourlyItem}>
                <Text style={weatherStyles.hourlyTime}>{hour.time}</Text>
                <MaterialCommunityIcons 
                  name={getWeatherIcon(hour.icon)} 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <Text style={weatherStyles.hourlyTemp}>{hour.temp}°</Text>
                <Text style={weatherStyles.hourlyCondition}>{hour.condition}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* 5-Day Forecast */}
      <Card style={[styles.card]}>
        <Title style={weatherStyles.sectionTitle}>5 Day Forecast</Title>
        {weatherData?.daily.map((day, index) => (
          <View key={index} style={weatherStyles.dailyItem}>
            <View style={weatherStyles.dailyLeft}>
              <Text style={weatherStyles.dayName}>{day.day}</Text>
              <MaterialCommunityIcons 
                name={getWeatherIcon(day.icon)} 
                size={32} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={weatherStyles.dailyMiddle}>
              <Text style={weatherStyles.dailyCondition}>{day.condition}</Text>
              <Chip 
                style={[weatherStyles.rainChip, { backgroundColor: getRainColor(day.rain) }]}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                {day.rain}% Rain
              </Chip>
            </View>
            <View style={weatherStyles.dailyRight}>
              <Text style={weatherStyles.dailyHigh}>{day.high}°</Text>
              <Text style={weatherStyles.dailyLow}>{day.low}°</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Farming Advice */}
      <Card style={[styles.card, { marginBottom: 20 }]}>
        <Title style={weatherStyles.sectionTitle}>Advice for Farmers</Title>
        {weatherData?.farmingAdvice.map((advice, index) => (
          <View key={index} style={weatherStyles.adviceItem}>
            <MaterialCommunityIcons 
              name="lightbulb-on" 
              size={16} 
              color={theme.colors.warning} 
            />
            <Text style={weatherStyles.adviceText}>{advice}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const weatherStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  currentWeatherCard: {
    backgroundColor: theme.colors.primary,
    marginBottom: 10,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  currentWeatherContent: {
    alignItems: 'center',
  },
  temperatureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  temperature: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  condition: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginLeft: 10,
  },
  alertDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 2,
  },
  hourlyContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  hourlyItem: {
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    minWidth: 80,
  },
  hourlyTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 5,
  },
  hourlyCondition: {
    fontSize: 10,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 15,
    minWidth: 50,
  },
  dailyMiddle: {
    flex: 2,
    alignItems: 'flex-start',
  },
  dailyCondition: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  rainChip: {
    height: 20,
  },
  dailyRight: {
    alignItems: 'flex-end',
  },
  dailyHigh: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dailyLow: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  adviceText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default WeatherScreen;