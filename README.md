# 🌾 KrishiSahayak - Digital Farming Assistant

A comprehensive web application for Indian farmers providing weather forecasts, market prices, disease detection, and AI-powered farming advice.

## 📁 Project Structure

```
KrishiSahayak/
├── frontend/          # React web application
│   ├── src/          # React components and screens
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
│
├── backend/          # Node.js Express API
│   ├── src/         # Backend source code
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│   └── package.json  # Backend dependencies
│
└── README.md        # This file
```

## ✨ Features

1. **🌤️ Weather Forecasts** - Real-time weather data and farming advice
2. **📈 Market Prices** - Live crop prices from government API with trend analysis
3. **🔬 Disease Detection** - AI-powered plant disease identification with treatment
4. **💬 AI Chat Assistant** - Groq-powered farming advice (FREE, unlimited)
5. **👤 Profile Management** - Farm details, crops, notification preferences
6. **🔔 In-App Notifications** - Real-time alerts for weather, prices, diseases

## 🛠️ Tech Stack

**Frontend:**
- React 18.2.0
- Material-UI 5.14
- React Router DOM 6.20
- Chart.js (price trends)
- Axios

**Backend:**
- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication
- Multer (file uploads)

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account (or local MongoDB)
- API keys (see Setup section)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd KrishiSahayak
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENWEATHER_API_KEY=your_openweather_key
DATA_GOV_API_KEY=your_data_gov_key
PLANT_ID_API_KEY=your_plant_id_key
GROQ_API_KEY=your_groq_api_key
```

Start backend server:
```bash
npm start
# Server runs on http://localhost:5000
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
npm start
# App runs on http://localhost:3000
```

## 🔑 API Keys Setup

### 1. OpenWeatherMap (Weather)
- Visit: https://openweathermap.org/api
- Sign up for free account
- Get API key from dashboard
- Free tier: 1000 calls/day

### 2. Data.gov.in (Market Prices)
- Visit: https://data.gov.in
- Create account and request API key
- Use Agmarknet API for market data

### 3. Plant.id (Disease Detection)
- Visit: https://plant.id
- Sign up for free account
- Free tier: 100 identifications/day

### 4. Groq (AI Chat - FREE!)
- Visit: https://console.groq.com/keys
- Sign up (NO credit card needed)
- Create API key
- Free tier: 30 requests/min, 14,400/day
- Model: Llama 3.3 70B

## 📱 Features Overview

### Weather Service
- Current weather conditions
- 5-day forecast
- Temperature, humidity, wind speed
- Farming-specific advice based on weather

### Market Prices
- Real-time crop prices
- Price trend charts
- Compare prices across markets
- Price alerts (coming soon)

### Disease Detection
- Upload plant images
- AI identifies diseases
- Treatment recommendations (organic + chemical)
- Prevention tips
- Database of common diseases

### AI Chat Assistant
- Ask any farming question
- Get instant answers about crops, soil, pests
- Seasonal advice
- Government schemes information
- Powered by Groq's Llama 3.3 (FREE)

### Profile Management
- Personal information
- Farm details (size, type, soil)
- Crops grown
- Location
- Notification preferences

### Notifications
- Weather alerts
- Price changes
- Disease warnings
- In-app notification bell
- Customizable preferences

## 🎯 Usage

1. **Register/Login** - Create account or login
2. **Complete Profile** - Add farm details for personalized advice
3. **Check Weather** - Get forecasts and farming recommendations
4. **View Market Prices** - Track crop prices and trends
5. **Scan Diseases** - Upload plant images for diagnosis
6. **Chat with AI** - Ask farming questions anytime
7. **Manage Notifications** - Set preferences in Profile

## 🧪 Testing

### Test Notifications
Visit `/test-notifications` to create sample notifications and test the notification system.

### Sample Accounts
Create your own account via the registration page.

## 📦 Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Build command: `npm run build`
4. Publish directory: `build`
5. Set API URL environment variable

## 🤝 Contributing

This is a university major project. Contributions are welcome for improvements.

## 📄 License

MIT License - Free to use for educational purposes

## 👨‍💻 Author

Developed as a university major project for helping Indian farmers with digital farming solutions.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- Data.gov.in for market price data
- Plant.id for disease detection
- Groq for FREE AI chat capabilities
- Material-UI for beautiful components

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for Indian Farmers** 🌾

---

**Made with ❤️ for Indian Farmers**

*KrishiSahayak - आपका डिजिटल कृषि साथी*