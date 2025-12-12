import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Lightbulb,
  WbSunny,
  LocalFlorist,
  Agriculture,
} from '@mui/icons-material';
import api from '../services/api.web';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickQuestions, setQuickQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch quick questions on mount
  useEffect(() => {
    fetchQuickQuestions();
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm KrishiSahayak AI, your agricultural assistant. 🌾\n\nI can help you with farming advice, crop selection, pest control, and more. How can I assist you today?",
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const fetchQuickQuestions = async () => {
    try {
      const response = await api.get('/chat/quick-questions');
      setQuickQuestions(response.data.data.questions);
    } catch (err) {
      console.error('Failed to fetch quick questions:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Get AI response
    setLoading(true);
    try {
      // Prepare conversation history (last 5 messages for context)
      const conversationHistory = messages
        .slice(-5)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await api.post('/chat/message', {
        message: userMessage,
        conversationHistory
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.data.response,
        model: response.data.data.model,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCategoryIcon = (index) => {
    const icons = [Agriculture, LocalFlorist, WbSunny, Lightbulb];
    const Icon = icons[index % icons.length];
    return <Icon />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        <SmartToy sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        AI Chat Assistant
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Lightbulb sx={{ mr: 1, fontSize: 20 }} />
            Quick Questions:
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {quickQuestions.slice(0, 8).map((question, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Chip
                  label={question}
                  icon={getCategoryIcon(idx)}
                  onClick={() => handleQuickQuestion(question)}
                  sx={{ width: '100%', height: 'auto', py: 1, '& .MuiChip-label': { whiteSpace: 'normal' } }}
                  variant="outlined"
                  color="primary"
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Chat Messages */}
      <Paper
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          mb: 2,
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                maxWidth: '70%',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.role === 'user' ? 'primary.main' : 'success.main',
                  mx: 1
                }}
              >
                {message.role === 'user' ? <Person /> : <SmartToy />}
              </Avatar>
              <Card
                sx={{
                  bgcolor: message.role === 'user' ? 'primary.light' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary'
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                      textAlign: 'right'
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 1 }}>
              <SmartToy />
            </Avatar>
            <Card>
              <CardContent sx={{ py: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" component="span">
                  Thinking...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask me anything about farming..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'action.disabledBackground' }
            }}
          >
            <Send />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>
    </Container>
  );
};

export default ChatScreen;
