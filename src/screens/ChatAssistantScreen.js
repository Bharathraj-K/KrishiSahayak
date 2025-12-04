import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { 
  Card, 
  Title, 
  Button, 
  Chip,
  ActivityIndicator 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, styles } from '../styles/theme';

const ChatAssistantScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I am your agricultural assistant. I can help you with farming, crops, weather and market information. You can ask me anything.',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const quickQuestions = [
    'My crop has pest infestation',
    'Will it rain today?',
    'What is today\'s wheat price?',
    'When should I apply fertilizer?',
    'When should I do irrigation?',
  ];

  const cropCategories = [
    { name: 'Rice', icon: 'rice' },
    { name: 'Wheat', icon: 'barley' },
    { name: 'Corn', icon: 'corn' },
    { name: 'Vegetables', icon: 'carrot' },
    { name: 'Fruits', icon: 'apple' },
  ];

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text.trim());
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.toLowerCase().includes('pest') || input.toLowerCase().includes('insect') || input.toLowerCase().includes('bug')) {
      return 'For pest problems:\n\n🌱 Spray neem oil (10ml per liter water)\n🌱 Turmeric powder and jaggery solution is also effective\n🌱 Evening time spraying works best\n\nAre you asking about any specific crop?';
    }
    
    if (input.includes('rain') || input.includes('weather')) {
      return 'Today\'s weather update:\n\n🌤️ Temperature: 28°C\n💧 Humidity: 65%\n🌧️ Rain probability: 40%\n\nLight rain expected in next 3 days. Please prepare your fields.';
    }
    
    if (input.includes('price') || input.includes('rate') || input.includes('cost')) {
      return 'Today\'s market rates:\n\n🌾 Wheat: ₹2,150/quintal\n🌾 Rice: ₹1,950/quintal\n🌽 Corn: ₹1,800/quintal\n🥔 Potato: ₹1,200/quintal\n\nWould you like to know the price of any specific crop?';
    }
    
    if (input.includes('fertilizer') || input.includes('manure')) {
      return 'Fertilizer information:\n\n🌱 Before sowing: Compost manure\n🌱 During sowing: DAP or NPK\n🌱 During crop growth: Urea\n\nSoil testing is the best approach. Have you done soil testing?';
    }
    
    if (input.includes('irrigation') || input.includes('water')) {
      return 'Irrigation advice:\n\n💧 Irrigate early morning or evening\n💧 Check soil moisture 2-3 inches deep before watering\n💧 Drip irrigation is the best method\n\nWhich crop do you need irrigation information for?';
    }
    
    return 'I understand. I try to answer your agriculture-related questions. You can ask me about crops, diseases, weather, or markets.\n\nCould you please tell me in more detail what information you need?';
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={chatStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Crop Categories */}
      <Card style={[styles.card, chatStyles.categoriesCard]}>
        <Title style={chatStyles.categoryTitle}>Select Crop</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={chatStyles.categoriesContainer}>
            {cropCategories.map((crop, index) => (
              <TouchableOpacity 
                key={index} 
                style={chatStyles.categoryItem}
                onPress={() => sendMessage(`Tell me about ${crop.name}`)}
              >
                <MaterialCommunityIcons 
                  name={crop.icon} 
                  size={30} 
                  color={theme.colors.primary} 
                />
                <Text style={chatStyles.categoryText}>{crop.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* Quick Questions */}
      <Card style={[styles.card, chatStyles.quickQuestionsCard]}>
        <Title style={chatStyles.quickTitle}>Quick Questions</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={chatStyles.quickQuestionsContainer}>
            {quickQuestions.map((question, index) => (
              <Chip
                key={index}
                style={chatStyles.questionChip}
                onPress={() => sendMessage(question)}
              >
                {question}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* Messages */}
      <ScrollView 
        style={chatStyles.messagesContainer}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              chatStyles.messageContainer,
              message.sender === 'user' ? chatStyles.userMessage : chatStyles.botMessage
            ]}
          >
            <Card style={[
              chatStyles.messageCard,
              message.sender === 'user' ? chatStyles.userMessageCard : chatStyles.botMessageCard
            ]}>
              <Text style={[
                chatStyles.messageText,
                message.sender === 'user' ? chatStyles.userMessageText : chatStyles.botMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={chatStyles.timestamp}>
                {message.timestamp.toLocaleTimeString('hi-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </Card>
          </View>
        ))}
        
        {isTyping && (
          <View style={[chatStyles.messageContainer, chatStyles.botMessage]}>
            <Card style={chatStyles.botMessageCard}>
              <View style={chatStyles.typingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={chatStyles.typingText}>Typing...</Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <Card style={chatStyles.inputCard}>
        <View style={chatStyles.inputContainer}>
          <TextInput
            style={chatStyles.textInput}
            placeholder="Write your question here..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={chatStyles.sendButton}
            onPress={() => sendMessage()}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </Card>
    </KeyboardAvoidingView>
  );
};

const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categoriesCard: {
    margin: 10,
    padding: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    minWidth: 70,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 5,
  },
  quickQuestionsCard: {
    margin: 10,
    padding: 10,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  quickQuestionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  questionChip: {
    backgroundColor: '#E3F2FD',
    marginRight: 5,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    marginVertical: 5,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '85%',
    padding: 12,
  },
  userMessageCard: {
    backgroundColor: theme.colors.primary,
  },
  botMessageCard: {
    backgroundColor: theme.colors.surface,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.text,
  },
  inputCard: {
    margin: 10,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatAssistantScreen;