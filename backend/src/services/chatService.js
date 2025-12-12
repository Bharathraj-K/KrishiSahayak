const axios = require('axios');

class ChatService {
  constructor() {
    // Groq API configuration (FREE)
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile'; // Updated model
    
    // Agricultural knowledge base context
    this.systemPrompt = `You are an expert agricultural assistant for Indian farmers. Your name is KrishiSahayak AI. 
You provide helpful, accurate, and practical advice on:
- Crop cultivation and farming techniques (for ANY crop/plant)
- Soil health and fertilization
- Pest and disease management
- Weather-based farming recommendations
- Market prices and crop selection
- Organic farming methods
- Government schemes for farmers
- Water management and irrigation

IMPORTANT INSTRUCTIONS:
1. When asked about ANY crop/plant planting time, ALWAYS provide:
   - Best planting months (be specific)
   - Season (Kharif/Rabi/Zaid for Indian context)
   - Duration to harvest
   - Temperature requirements
   - Soil requirements
   - Key planting tips

2. Use your knowledge of agriculture, climate zones, and crop science to answer about ANY plant, not just common ones.
3. If asked about an unusual crop, still provide the best information based on agricultural principles.
4. Always provide responses in simple, easy-to-understand language.
5. Consider Indian farming conditions, climate (tropical/subtropical), and local practices.
6. Be specific with months and numbers - avoid vague answers.
7. If you're truly unsure, acknowledge it and suggest consulting local agricultural extension officers.

Be encouraging and supportive in all responses.`;

    // Quick question templates
    this.quickQuestions = [
      "What crops should I plant this season?",
      "How to improve soil fertility?",
      "Best organic pesticides for vegetables?",
      "When to harvest wheat?",
      "How to manage water during drought?",
      "Government schemes for farmers?",
      "Best crops for rain-fed areas?",
      "How to prevent crop diseases?"
    ];
  }

  /**
   * Get AI response for user message
   */
  async getChatResponse(userMessage, conversationHistory = []) {
    try {
      // If no API key, return mock response
      if (!this.apiKey || this.apiKey === 'YOUR_GROQ_API_KEY') {
        console.log('No Groq API key found, using mock response');
        return this.getMockResponse(userMessage);
      }

      // Prepare messages array
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      console.log(`Using Groq API with model: ${this.model}`);

      // Call Groq API
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: messages,
          max_tokens: 800,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        message: response.data.choices[0].message.content,
        model: `groq/${this.model}`,
        tokensUsed: response.data.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('Groq API error:', error.message);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      // Fallback to mock response
      return this.getMockResponse(userMessage);
    }
  }

  /**
   * Get quick question templates
   */
  getQuickQuestions() {
    return this.quickQuestions;
  }

  /**
   * Generate farming tips based on season
   */
  getSeasonalTips(season = 'all') {
    const tips = {
      summer: [
        "Focus on heat-resistant crops like cotton, groundnut, and vegetables",
        "Implement drip irrigation to conserve water",
        "Mulch crops to retain soil moisture",
        "Plant early morning or late evening to avoid heat stress",
        "Monitor for pest infestations, which increase in hot weather"
      ],
      monsoon: [
        "Plant rice, maize, and millets during monsoon season",
        "Ensure proper drainage to prevent waterlogging",
        "Watch for fungal diseases in humid conditions",
        "Apply organic manure after first rains",
        "Check weather forecasts for heavy rainfall alerts"
      ],
      winter: [
        "Grow wheat, mustard, chickpea, and winter vegetables",
        "Irrigate early morning to prevent frost damage",
        "Use green manure crops for soil enrichment",
        "Monitor for aphids and other winter pests",
        "Apply phosphorus-rich fertilizers for root crops"
      ],
      all: [
        "Regular soil testing is essential for crop health",
        "Practice crop rotation to maintain soil fertility",
        "Use integrated pest management (IPM) techniques",
        "Maintain proper records of farming activities",
        "Stay updated with local agricultural advisories"
      ]
    };

    return tips[season.toLowerCase()] || tips.all;
  }

  /**
   * Get farming advice by category
   */
  getAdviceByCategory(category) {
    const advice = {
      soil: {
        title: "Soil Management",
        tips: [
          "Test soil pH regularly (ideal: 6.0-7.5 for most crops)",
          "Add organic matter through compost or farmyard manure",
          "Practice green manuring with legume crops",
          "Avoid over-tilling to preserve soil structure",
          "Use crop rotation to prevent nutrient depletion"
        ]
      },
      water: {
        title: "Water Management",
        tips: [
          "Implement drip or sprinkler irrigation for efficiency",
          "Water during early morning or evening to reduce evaporation",
          "Mulch around plants to retain soil moisture",
          "Harvest rainwater for supplemental irrigation",
          "Monitor soil moisture before watering"
        ]
      },
      pest: {
        title: "Pest Control",
        tips: [
          "Use neem-based organic pesticides",
          "Practice crop rotation to break pest cycles",
          "Encourage beneficial insects like ladybugs",
          "Remove and destroy infected plant parts",
          "Use pheromone traps for monitoring"
        ]
      },
      fertilizer: {
        title: "Fertilizer Management",
        tips: [
          "Apply fertilizers based on soil test results",
          "Use organic compost for long-term soil health",
          "Apply nitrogen in split doses for better absorption",
          "Use bio-fertilizers like rhizobium for legumes",
          "Avoid over-fertilization which can harm crops"
        ]
      },
      market: {
        title: "Marketing Tips",
        tips: [
          "Check market prices before harvesting",
          "Consider direct marketing to consumers",
          "Join farmer producer organizations (FPOs)",
          "Store produce properly to wait for better prices",
          "Explore government minimum support price (MSP) schemes"
        ]
      }
    };

    return advice[category.toLowerCase()] || {
      title: "General Farming Advice",
      tips: this.getSeasonalTips('all')
    };
  }

  /**
   * Mock response for testing without API key
   */
  getMockResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    return {
      message: `⚠️ **Groq API Key Not Configured**\n\nI'm currently running in mock mode with limited knowledge. For accurate information about ANY crop and farming questions:\n\n**Get FREE Groq API Key:**\n1. Visit: https://console.groq.com/keys\n2. Sign up (free, no credit card needed)\n3. Create API key\n4. Add to backend/.env file:\n   \`GROQ_API_KEY=your-groq-api-key\`\n\n**Groq Benefits:**\n✅ Completely FREE forever\n✅ 30 requests/minute\n✅ 14,400 requests/day\n✅ Powerful Llama 3.1 70B model\n✅ Accurate answers for ANY crop\n\n**General Indian Crop Seasons:**\n- **Kharif** (June-Oct): Rice, Maize, Cotton, Soybean\n- **Rabi** (Oct-Mar): Wheat, Barley, Mustard, Chickpea\n- **Zaid** (Mar-Jun): Watermelon, Cucumber, Vegetables\n\nOnce configured, I can answer about ANY crop with specific months, temperatures, and farming tips! 🌾`,
      model: 'mock',
      tokensUsed: 0
    };
  }

  /**
   * Error handler
   */
  handleError(error) {
    if (error.response) {
      return new Error(`OpenAI API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      return new Error('OpenAI API is not responding. Please try again later.');
    } else {
      return new Error(`Chat Service Error: ${error.message}`);
    }
  }
}

module.exports = new ChatService();
