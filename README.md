# KrishiSahayak - कृषि सहायक 🌾

## 🎉 Successfully Converted to Web Application!

A user-friendly agricultural assistant **web application** designed specifically for Indian farmers. KrishiSahayak provides AI-powered tools for crop disease detection, weather forecasts, market prices, and expert agricultural advice.

### ✅ Migration Status: Complete
- Converted from React Native/Expo to pure React web app
- Using Material-UI for modern web interface
- React Router DOM for navigation
- JWT authentication with localStorage
- Backend running on Node.js + Express + MongoDB Atlas

### 🚀 Quick Start
**Backend**: `cd backend && npm start` (Port 5000)
**Frontend**: `npm start` (Port 3000)

Visit `http://localhost:3000` to see the login screen!

## 📱 Features

### 🏠 Home Dashboard
- Personalized greeting with farmer-friendly interface
- Quick weather summary with today's conditions
- Direct access to all main features
- Daily farming tips and advice
- Emergency helpline contact

### 🔍 Disease Detection
- Camera-based plant disease identification
- AI-powered image analysis with confidence scores
- Detailed treatment recommendations (both chemical and organic)
- Prevention tips for future crop protection
- User-friendly photo capture guidance

### 💬 AI Chat Assistant
- Multilingual conversational support (Hindi primary)
- Crop-specific advice and recommendations
- Voice and text input capabilities
- Quick question templates for common queries
- Context-aware responses for farming queries

### 🌤️ Weather Information
- Localized weather forecasts
- Farmer-specific weather insights
- 5-day weather predictions
- Severe weather alerts and warnings
- Hourly weather updates
- Farming advice based on weather conditions

### 💰 Market Prices
- Real-time mandi (market) prices
- Crop-wise price filtering
- Price change indicators with trends
- Multiple market comparisons
- Search functionality for specific crops
- Arrival quantity information

### 👤 Profile & Settings
- User profile management
- Language preference selection (8+ Indian languages)
- Crop selection for personalized content
- Notification settings
- Privacy controls
- Location-based services

## 🚀 Technology Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper
- **Icons**: MaterialCommunityIcons
- **State Management**: React Hooks
- **Camera**: Expo Camera & Image Picker
- **Location**: Expo Location
- **Styling**: StyleSheet with custom theme

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

### Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd KrishiSahayak
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the Development Server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on Device/Simulator**
   - **Android**: `npm run android` or scan QR code with Expo Go
   - **iOS**: `npm run ios` or scan QR code with Expo Go
   - **Web**: `npm run web`

## 🎨 Design Principles

### Farmer-Friendly Interface
- **Large Touch Targets**: Buttons and interactive elements are sized for easy use
- **Clear Typography**: Large fonts with high contrast for better readability
- **Intuitive Navigation**: Simple tab-based navigation with clear icons
- **Visual Hierarchy**: Important information prominently displayed
- **Error Prevention**: Clear guidance and confirmation dialogs

### Multilingual Support
- Primary language: Hindi (हिंदी)
- Support for 8+ Indian regional languages
- Context-aware language switching
- Cultural sensitivity in design and content

### Accessibility Features
- High contrast color scheme
- Large interactive elements (minimum 44px touch targets)
- Clear visual feedback for interactions
- Voice input capabilities
- Simple, linear navigation flow

## 📱 Screen Structure

```
KrishiSahayak/
├── Home (Dashboard)
├── Disease Detection (Camera + AI)
├── Chat Assistant (AI Chatbot)
├── Weather (Forecasts + Alerts)
├── Market Prices (Real-time prices)
└── Profile (Settings + Preferences)
```

## 🎯 Target Audience

- **Primary**: Indian smallholder farmers
- **Secondary**: Agricultural extension workers
- **Tertiary**: Agricultural students and researchers

## 🔧 Configuration

### App Configuration (`app.json`)
- App name and branding
- Permission requirements (Camera, Location)
- Platform-specific settings
- Asset configurations

### Theme Configuration (`src/styles/theme.js`)
- Color palette optimized for agricultural context
- Typography settings for multilingual support
- Component styling standards
- Accessibility considerations

## 🤝 Contributing

We welcome contributions to make KrishiSahayak better for farmers!

### Development Guidelines
1. Follow React Native best practices
2. Maintain farmer-friendly design principles
3. Ensure multilingual compatibility
4. Test on various device sizes
5. Consider offline functionality for rural areas

### Code Structure
- `src/screens/` - Main application screens
- `src/components/` - Reusable UI components
- `src/navigation/` - Navigation configuration
- `src/styles/` - Theme and styling
- `assets/` - Images, icons, and static resources

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Designed for Indian farmers with love ❤️
- Built using React Native and Expo
- Icons from MaterialCommunityIcons
- UI components from React Native Paper

## 📞 Support

For technical support or feature requests:
- Email: support@krishisahayak.com
- Phone: Farmer Helpline 1800-180-1551

---

**Made with ❤️ for Indian Farmers**

*KrishiSahayak - आपका डिजिटल कृषि साथी*