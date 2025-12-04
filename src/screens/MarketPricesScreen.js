import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  ActivityIndicator,
  Chip,
  Searchbar 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, styles } from '../styles/theme';

const MarketPricesScreen = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Grains', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices'];

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockMarketData = [
        {
          id: 1,
          name: 'Wheat',
          category: 'Grains',
          price: 2150,
          unit: 'Quintal',
          change: +50,
          changePercent: 2.38,
          market: 'Ghaziabad Mandi',
          quality: 'FAQ',
          arrival: 450,
          icon: 'barley'
        },
        {
          id: 2,
          name: 'Rice',
          category: 'Grains',
          price: 1950,
          unit: 'Quintal',
          change: -25,
          changePercent: -1.26,
          market: 'Meerut Mandi',
          quality: 'Common',
          arrival: 320,
          icon: 'rice'
        },
        {
          id: 3,
          name: 'Corn',
          category: 'Grains',
          price: 1800,
          unit: 'Quintal',
          change: +30,
          changePercent: 1.69,
          market: 'Noida Mandi',
          quality: 'Yellow',
          arrival: 280,
          icon: 'corn'
        },
        {
          id: 4,
          name: 'Chana Dal',
          category: 'Pulses',
          price: 5200,
          unit: 'Quintal',
          change: +100,
          changePercent: 1.96,
          market: 'Delhi Mandi',
          quality: 'Bold',
          arrival: 180,
          icon: 'food'
        },
        {
          id: 5,
          name: 'Moong',
          category: 'Pulses',
          price: 7800,
          unit: 'Quintal',
          change: -150,
          changePercent: -1.89,
          market: 'Gurgaon Mandi',
          quality: 'Bold',
          arrival: 120,
          icon: 'food'
        },
        {
          id: 6,
          name: 'Mustard',
          category: 'Oilseeds',
          price: 4500,
          unit: 'Quintal',
          change: +80,
          changePercent: 1.81,
          market: 'Ghaziabad Mandi',
          quality: 'Black',
          arrival: 200,
          icon: 'flower'
        },
        {
          id: 7,
          name: 'Potato',
          category: 'Vegetables',
          price: 1200,
          unit: 'Quintal',
          change: +60,
          changePercent: 5.26,
          market: 'Agra Mandi',
          quality: 'Jyoti',
          arrival: 800,
          icon: 'food-variant'
        },
        {
          id: 8,
          name: 'Onion',
          category: 'Vegetables',
          price: 2800,
          unit: 'Quintal',
          change: -120,
          changePercent: -4.11,
          market: 'Nashik Mandi',
          quality: 'Medium',
          arrival: 650,
          icon: 'food-variant'
        },
        {
          id: 9,
          name: 'Tomato',
          category: 'Vegetables',
          price: 3200,
          unit: 'Quintal',
          change: +200,
          changePercent: 6.67,
          market: 'Pune Mandi',
          quality: 'Hybrid',
          arrival: 400,
          icon: 'food-variant'
        },
        {
          id: 10,
          name: 'Mango',
          category: 'Fruits',
          price: 4000,
          unit: 'Quintal',
          change: +150,
          changePercent: 3.90,
          market: 'Lucknow Mandi',
          quality: 'Desi',
          arrival: 220,
          icon: 'fruit-pineapple'
        }
      ];
      setMarketData(mockMarketData);
      setLoading(false);
      setRefreshing(false);
    }, 1500);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketData();
  };

  const filteredData = marketData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriceChangeColor = (change) => {
    return change >= 0 ? theme.colors.success : theme.colors.error;
  };

  const getPriceChangeIcon = (change) => {
    return change >= 0 ? 'trending-up' : 'trending-down';
  };

  if (loading && marketData.length === 0) {
    return (
      <View style={marketStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={marketStyles.loadingText}>Loading market prices...</Text>
      </View>
    );
  }

  return (
    <View style={marketStyles.container}>
      {/* Search Bar */}
      <Card style={[styles.card, marketStyles.searchCard]}>
        <Searchbar
          placeholder="Search crops..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={marketStyles.searchBar}
        />
      </Card>

      {/* Category Filter */}
      <Card style={[styles.card, marketStyles.categoryCard]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={marketStyles.categoryContainer}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  marketStyles.categoryChip,
                  selectedCategory === category && marketStyles.selectedChip
                ]}
                textStyle={[
                  marketStyles.categoryChipText,
                  selectedCategory === category && marketStyles.selectedChipText
                ]}
              >
                {category}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* Market Summary */}
      <Card style={[styles.card]}>
        <View style={marketStyles.summaryHeader}>
          <View>
            <Title style={marketStyles.summaryTitle}>Today's Market</Title>
            <Paragraph style={marketStyles.summarySubtitle}>
              {filteredData.length} crop prices
            </Paragraph>
          </View>
          <Button onPress={onRefresh} mode="outlined">
            <MaterialCommunityIcons name="refresh" size={16} />
            {'  '}Update
          </Button>
        </View>
      </Card>

      {/* Market Data List */}
      <ScrollView 
        style={marketStyles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredData.map((item) => (
          <Card key={item.id} style={[styles.card, marketStyles.priceCard]}>
            <View style={marketStyles.priceHeader}>
              <View style={marketStyles.cropInfo}>
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <View style={marketStyles.cropDetails}>
                  <Text style={marketStyles.cropName}>{item.name}</Text>
                  <Text style={marketStyles.cropQuality}>
                    {item.quality} | {item.market}
                  </Text>
                </View>
              </View>
              <Chip style={marketStyles.categoryBadge}>
                {item.category}
              </Chip>
            </View>

            <View style={marketStyles.priceDetails}>
              <View style={marketStyles.priceMain}>
                <Text style={marketStyles.priceAmount}>
                  ₹{item.price.toLocaleString('hi-IN')}
                </Text>
                <Text style={marketStyles.priceUnit}>per {item.unit}</Text>
              </View>

              <View style={marketStyles.priceChange}>
                <View style={[
                  marketStyles.changeContainer,
                  { backgroundColor: getPriceChangeColor(item.change) }
                ]}>
                  <MaterialCommunityIcons 
                    name={getPriceChangeIcon(item.change)} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={marketStyles.changeText}>
                    ₹{Math.abs(item.change)}
                  </Text>
                </View>
                <Text style={[
                  marketStyles.changePercent,
                  { color: getPriceChangeColor(item.change) }
                ]}>
                  ({item.changePercent > 0 ? '+' : ''}{item.changePercent}%)
                </Text>
              </View>
            </View>

            <View style={marketStyles.additionalInfo}>
              <View style={marketStyles.infoItem}>
                <MaterialCommunityIcons 
                  name="truck-delivery" 
                  size={16} 
                  color={theme.colors.info} 
                />
                <Text style={marketStyles.infoText}>
                  Arrival: {item.arrival} Quintal
                </Text>
              </View>
              <Text style={marketStyles.lastUpdated}>
                Updated: Just now
              </Text>
            </View>
          </Card>
        ))}

        {filteredData.length === 0 && (
          <Card style={[styles.card, marketStyles.noDataCard]}>
            <MaterialCommunityIcons 
              name="database-search" 
              size={64} 
              color={theme.colors.primary} 
            />
            <Text style={marketStyles.noDataText}>
              No data found
            </Text>
            <Text style={marketStyles.noDataSubtext}>
              Try other categories or search terms
            </Text>
          </Card>
        )}

        <Card style={[styles.card, { marginBottom: 20 }]}>
          <Title style={marketStyles.helpTitle}>Help</Title>
          <View style={marketStyles.helpItem}>
            <MaterialCommunityIcons name="information" size={16} color={theme.colors.info} />
            <Text style={marketStyles.helpText}>
              Prices are updated in real-time
            </Text>
          </View>
          <View style={marketStyles.helpItem}>
            <MaterialCommunityIcons name="information" size={16} color={theme.colors.info} />
            <Text style={marketStyles.helpText}>
              Always check local market before selling
            </Text>
          </View>
          <Button
            mode="outlined"
            style={marketStyles.helpButton}
            onPress={() => {/* Navigate to help */}}
          >
            More Info
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
};

const marketStyles = StyleSheet.create({
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
  searchCard: {
    margin: 10,
    padding: 10,
  },
  searchBar: {
    backgroundColor: '#F5F5F5',
  },
  categoryCard: {
    margin: 10,
    padding: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#E8F5E8',
    marginRight: 5,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    color: theme.colors.text,
  },
  selectedChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summarySubtitle: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  listContainer: {
    flex: 1,
  },
  priceCard: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropDetails: {
    marginLeft: 12,
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cropQuality: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    height: 28,
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceMain: {
    flex: 1,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  },
  priceChange: {
    alignItems: 'flex-end',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  changeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  changePercent: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: 6,
  },
  lastUpdated: {
    fontSize: 10,
    color: theme.colors.text,
    opacity: 0.5,
  },
  noDataCard: {
    alignItems: 'center',
    paddingVertical: 40,
    margin: 10,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 15,
  },
  noDataSubtext: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 5,
    textAlign: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  helpText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    color: theme.colors.text,
    lineHeight: 18,
  },
  helpButton: {
    marginTop: 10,
    borderColor: theme.colors.primary,
  },
});

export default MarketPricesScreen;