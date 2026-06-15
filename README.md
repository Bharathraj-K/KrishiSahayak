# 🌾 KrishiSahayak - AI-Powered Digital Farming Assistant

> **Version 2.0** | Latest Updated: June 2026

A comprehensive AI-powered web application providing Indian farmers with real-time agricultural advisory, weather forecasts, market intelligence, disease detection, and yield predictions using machine learning.

**Live Demo:** [KrishiSahayak](https://krishisahayak.example.com)

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Complete Installation Guide](#complete-installation-guide)
- [Running the Application](#running-the-application)
- [ML Services Setup](#ml-services-setup)
- [Database Setup](#database-setup)
- [Admin Account Creation](#admin-account-creation)
- [API Configuration](#api-configuration)
- [Development Workflow](#development-workflow)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 📖 Project Overview

**KrishiSahayak** (कृषि सहायक) means "Agriculture Helper" in Hindi. This project is a **three-tier microservices application** designed to empower Indian farmers with data-driven decision-making tools through:

- **AI-Powered Disease Detection** – ResNet-50 CNN identifies 14+ plant diseases from leaf images
- **Smart Crop Recommendations** – ML model recommends optimal crops based on soil composition and climate
- **Yield Prediction** – Predictive analytics forecast crop yields for informed planning
- **Live Market Intelligence** – Real-time crop prices from government APIs with trend analysis
- **AI Farming Assistant** – Groq-powered Llama 3.3 LLM provides unlimited free farming advice
- **Real-Time Notifications** – Weather alerts, price changes, and disease warnings

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🌤️ **Weather Forecasts** | Real-time weather + 5-day forecasts with farming-specific advice |
| 📈 **Market Prices** | Live crop prices from Data.gov.in with trend charts & comparisons |
| 🔬 **Disease Detection** | Upload leaf image → AI detects disease + treatment recommendations |
| 🌾 **Crop Recommendations** | Input soil/weather data → Get best crop suggestions |
| 📊 **Yield Prediction** | Predict harvest quantity based on farming parameters |
| 🧪 **Fertilizer Recommendation** | Calculate optimal N-P-K application rates |
| 💬 **AI Chat Assistant** | Ask farming questions → Get instant answers (FREE, unlimited) |
| 🛒 **Marketplace** | Buy/sell agricultural products directly |
| 👤 **Profile Management** | Farm details, crops, location, notification settings |
| 🔔 **Smart Notifications** | Customizable alerts for weather, prices, diseases |
| 🌐 **Multi-Language** | Support for 8 Indian languages with i18next |

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18.2.0
- **UI Library:** Material-UI (MUI) 5.14 with custom theming
- **Charts:** Chart.js 4.5.1 (price trends visualization)
- **HTTP Client:** Axios 1.13 with interceptors
- **Routing:** React Router DOM 6.20
- **Localization:** i18next 25.7.2 (8 Indian languages)
- **Authentication:** Google OAuth (@react-oauth/google)

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.2.1
- **Database ORM:** Mongoose 9.0.1 (MongoDB)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** Bcryptjs 3.0.3
- **File Upload:** Multer 2.0.2
- **HTTP Requests:** Axios 1.7.2
- **Security:** Helmet 8.1.0, Express Rate Limit 8.2.1
- **Validation:** Express-validator 7.3.1
- **AI Integration:** Groq SDK 0.3.0
- **Logging:** Morgan 1.10.1
- **Server:** Compression enabled, CORS configured

### **Machine Learning Services (Python)**
- **Disease Detection (Port 5001):** PyTorch ResNet-50 CNN
- **Crop Recommendation (Port 5002):** Scikit-learn ML model
- **Yield Prediction (Port 5004):** Scikit-learn pipeline
- **Frameworks:** Flask (microservices), Pandas, NumPy, Pillow (PIL)

### **Database & Caching**
- **Primary DB:** MongoDB Atlas (cloud)
- **Optional Cache:** Redis
- **Collections:** Users, Notifications, MarketplaceListings

### **External Services**
- **Weather:** OpenWeatherMap API
- **Market Prices:** Data.gov.in Agmarknet API
- **AI Chat:** Groq Llama 3.3-70b (FREE)
- **Disease Detection Fallback:** Plant.id API
- **Authentication:** Google OAuth 2.0

---

## 📁 Project Structure

```
KrishiSahayak/
│
├── 📂 frontend/                    # React Web Application
│   ├── src/
│   │   ├── App.js                 # Main app component with routing
│   │   ├── index.js               # React entry point
│   │   ├── index.css              # Global styles
│   │   ├── components/            # Reusable UI components
│   │   │   ├── FarmerButton.js
│   │   │   ├── InfoCard.js
│   │   │   ├── LoadingScreen.js
│   │   │   └── NotificationBell.js
│   │   ├── screens/               # Page components (13 screens)
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── Dashboard.js
│   │   │   ├── WeatherScreen.js
│   │   │   ├── MarketScreen.js
│   │   │   ├── DiseaseScreen.js
│   │   │   ├── CropRecommendationScreen.js
│   │   │   ├── YieldPredictionScreen.js
│   │   │   ├── FertilizerRecommendationScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   ├── MarketplaceScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── TestNotifications.js
│   │   ├── services/              # API integration
│   │   │   ├── api.js             # Axios client with interceptors
│   │   │   └── authService.web.js
│   │   ├── contexts/              # State management
│   │   │   └── LanguageContext.js
│   │   ├── locales/               # i18next translations (8 languages)
│   │   ├── constants/
│   │   │   ├── locationOptions.js
│   │   │   └── marketOptions.js
│   │   └── assets/                # Images & static files
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── build/                     # Production build output
│   ├── package.json               # Frontend dependencies
│   └── .env.example               # Environment template
│
├── 📂 backend/                     # Node.js Express API
│   ├── src/
│   │   ├── server.js              # Express app initialization
│   │   ├── controllers/           # Request handlers (10 controllers)
│   │   │   ├── authController.js  # Registration, login, JWT
│   │   │   ├── weatherController.js
│   │   │   ├── marketController.js
│   │   │   ├── diseaseController.js
│   │   │   ├── cropRecommendationController.js
│   │   │   ├── yieldController.js
│   │   │   ├── chatController.js
│   │   │   ├── notificationController.js
│   │   │   ├── dashboardController.js
│   │   │   └── marketplaceController.js
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.js            # User profiles & farm details
│   │   │   ├── Notification.js
│   │   │   └── MarketplaceListing.js
│   │   ├── routes/                # API endpoints (10 route files)
│   │   │   ├── auth.js
│   │   │   ├── weather.js
│   │   │   ├── market.js
│   │   │   ├── disease.js
│   │   │   ├── cropRecommendation.js
│   │   │   ├── yield.js
│   │   │   ├── chat.js
│   │   │   ├── notifications.js
│   │   │   ├── dashboard.js
│   │   │   └── marketplace.js
│   │   ├── services/              # Business logic (10 services)
│   │   │   ├── weatherService.js
│   │   │   ├── marketService.js
│   │   │   ├── diseaseService.js
│   │   │   ├── chatService.js
│   │   │   ├── cropRecommendationService.js
│   │   │   ├── yieldPredictionService.js
│   │   │   ├── notificationService.js
│   │   │   ├── riskAlertService.js
│   │   │   ├── yieldMetaService.js
│   │   │   └── fertilizer recommendation services
│   │   ├── middleware/            # Custom middleware
│   │   │   ├── auth.js            # JWT protection & optional auth
│   │   │   ├── errorHandler.js    # Global error handling
│   │   │   └── validation.js      # Input validation rules
│   │   ├── config/                # Configuration
│   │   │   ├── database.js        # MongoDB connection
│   │   │   └── redis.js           # Redis configuration
│   │   ├── uploads/               # User file uploads (images)
│   │   │   └── diseases/
│   │   └── tests/                 # Test files
│   │       └── auth.test.js
│   │
│   ├── 📂 ml/                     # Machine Learning Microservices
│   │   ├── disease-ai/            # Disease Detection Service (Port 5001)
│   │   │   ├── app.py             # Flask app
│   │   │   ├── train_model.py     # Model training script
│   │   │   ├── train_model_colab.ipynb
│   │   │   ├── disease_model_best.pth  # Trained ResNet-50 model
│   │   │   ├── requirements.txt
│   │   │   ├── README.md
│   │   │   └── start-ai-service.ps1   # PowerShell startup script
│   │   │
│   │   ├── crop_recommendation/   # Crop Recommendation Service (Port 5002)
│   │   │   ├── app.py             # Flask app
│   │   │   ├── crop_recommendation_training.ipynb
│   │   │   ├── crop_recommendation_model.joblib
│   │   │   ├── crop_recommendation_scaler.joblib
│   │   │   └── requirements.txt
│   │   │
│   │   ├── yield_prediction/      # Yield Prediction Service (Port 5004)
│   │   │   ├── app.py
│   │   │   ├── yield_training_colab.ipynb
│   │   │   ├── yield_model_pipeline.joblib
│   │   │   ├── requirements.txt
│   │   │   └── data/
│   │   │
│   │   └── fertilizer_recommendation/  # Integrated in Backend
│   │       ├── constants/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       └── data/
│   │
│   ├── package.json               # Backend dependencies
│   ├── .env.example               # Environment template
│   └── server.js                  # Entry point
│
├── 📄 README.md                   # This file
├── 📄 RUNNING.md                  # Quick run instructions
├── 📄 ReportMD.md                 # Project report
└── 📂 tmp/                        # Temporary files
```

---

## 📋 Prerequisites

Before starting, ensure you have these installed:

### Required Software
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Python 3.10+** - Download from [python.org](https://www.python.org)
- **MongoDB Atlas** - Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - Download from [git-scm.com](https://git-scm.com)

### Required API Keys (Free Tier)
1. **OpenWeatherMap** - Weather data (1000 calls/day free)
2. **Groq** - AI Chat (No credit card, 14,400 req/day free)
3. **Data.gov.in** - Market prices (Government API)
4. **Plant.id** - Disease detection fallback (100 identifications/day free)
5. **Google OAuth** - Social login (free)

### System Requirements
- Minimum 4GB RAM
- 2GB free disk space
- Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

---

## 🚀 Complete Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/KrishiSahayak.git
cd KrishiSahayak
```

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2.2 Create Environment File
Create `backend/.env`:

```env
# ============ SERVER CONFIGURATION ============
PORT=5000
NODE_ENV=development

# ============ DATABASE ============
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krishisahayak?retryWrites=true&w=majority
MONGODB_DB_NAME=krishisahayak

# ============ JWT & AUTHENTICATION ============
JWT_SECRET=your_very_secure_random_jwt_secret_key_min_32_characters
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d

# ============ EXTERNAL APIs ============
OPENWEATHER_API_KEY=your_openweather_api_key
DATA_GOV_API_KEY=your_data_gov_api_key
PLANT_ID_API_KEY=your_plant_id_api_key
GROQ_API_KEY=your_groq_api_key

# ============ GOOGLE OAUTH ============
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============ ML SERVICES ============
DISEASE_SERVICE_URL=http://localhost:5001
CROP_RECOMMENDATION_SERVICE_URL=http://localhost:5002
YIELD_PREDICTION_SERVICE_URL=http://localhost:5004

# ============ FRONTEND ============
FRONTEND_URL=http://localhost:3000

# ============ REDIS (Optional) ============
REDIS_URL=redis://localhost:6379
USE_REDIS=false

# ============ EMAIL SERVICE (Optional) ============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# ============ FILE UPLOADS ============
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./src/uploads
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Step 4: ML Services Setup

See [ML Services Setup](#ml-services-setup) section below.

### Step 5: Database Setup

See [Database Setup](#database-setup) section below.

---

## ▶️ Running the Application

### **Option 1: Run All Services Simultaneously (Recommended)**

#### **Terminal 1 - Backend API**
```bash
cd backend
npm start
# Backend runs on http://localhost:5000
# API available at http://localhost:5000/api
```

#### **Terminal 2 - Frontend**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

#### **Terminal 3-5 - ML Services** (See ML Services Setup below)

---

### **Option 2: Run in Development with Auto-Reload**

#### Backend with Nodemon
```bash
cd backend
npm install -g nodemon
nodemon src/server.js
```

#### Frontend with Hot Reload (automatic on `npm start`)
```bash
cd frontend
npm start
```

---

### **Health Check**

After starting all services, verify they're running:

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend
Open http://localhost:3000 in browser

# ML Services
curl http://localhost:5001/health  # Disease detection
curl http://localhost:5002/health  # Crop recommendation
curl http://localhost:5004/health  # Yield prediction
```

---

## 🤖 ML Services Setup

### **Prerequisites for ML Services**
```bash
# Install Python 3.8+ and pip
python --version
pip --version
```

### **Disease Detection Service (Port 5001)**

#### Installation
```bash
cd backend/ml/disease-ai
pip install -r requirements.txt
```

#### Run Service
```bash
python app.py
# Service runs on http://localhost:5001
```

#### Alternative: Run via PowerShell Script
```powershell
cd backend\ml\disease-ai
.\start-ai-service.ps1
```

#### API Endpoints
```bash
# Health check
GET http://localhost:5001/health

# Detect disease from image
POST http://localhost:5001/detect
Content-Type: multipart/form-data
Body: image file

# Response:
{
  "disease": "Tomato Early Blight",
  "confidence": 0.92,
  "symptoms": ["Brown spots on leaves", "Concentric rings"],
  "treatments": {
    "organic": ["Neem oil spray", "Sulfur dust"],
    "chemical": ["Mancozeb 75% WP", "Chlorothalonil"]
  },
  "prevention": ["Crop rotation", "Remove infected leaves"]
}
```

---

### **Crop Recommendation Service (Port 5002)**

#### Installation
```bash
cd backend/ml/crop_recommendation
pip install -r requirements.txt
```

#### Run Service
```bash
python app.py
# Service runs on http://localhost:5002
```

#### API Endpoints
```bash
# Predict crops based on soil & weather
POST http://localhost:5002/predict
Content-Type: application/json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 21.77,
  "humidity": 80.47,
  "ph": 6.5,
  "rainfall": 202.9
}

# Response:
{
  "crops": ["Rice", "Wheat", "Maize"]
}
```

---

### **Yield Prediction Service (Port 5004)**

#### Installation
```bash
cd backend/ml/yield_prediction
pip install -r requirements.txt
```

#### Run Service
```bash
python app.py
# Service runs on http://localhost:5004
```

#### API Endpoints
```bash
# Predict yield
POST http://localhost:5004/predict
Content-Type: application/json
{
  "crop": "Rice",
  "year": 2024,
  "season": "Kharif",
  "state": "Punjab",
  "area": 50,
  "rainfall": 1200,
  "fertilizer": 300,
  "pesticide": 50
}

# Response:
{
  "predicted_yield": 2500,  # kg/hectare
  "confidence": 0.85
}
```

---

## 💾 Database Setup

### **MongoDB Atlas Setup (Cloud - Recommended)**

1. **Create Account**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up with email or Google account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in left panel
   - Click "Add New Database User"
   - Username: `krishisahayak`
   - Password: Generate secure password
   - Click "Add User"

4. **Get Connection String**
   - Go to "Databases" in left panel
   - Click "Connect" on your cluster
   - Choose "Drivers"
   - Copy connection string
   - Replace `<password>` with your user password

5. **Update Backend .env**
   ```env
   MONGODB_URI=mongodb+srv://krishisahayak:password@cluster.mongodb.net/krishisahayak?retryWrites=true&w=majority
   ```

6. **Allow IP Access**
   - Go to "Network Access" in left panel
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)
   - For production: Add your server IP only

### **Local MongoDB Setup (Alternative)**

#### Install MongoDB Community
- **Windows:** [Download MongoDB Community](https://www.mongodb.com/try/download/community)
- **macOS:** `brew install mongodb-community`
- **Linux:** `sudo apt-get install mongodb`

#### Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/krishisahayak
```

### **Database Schema**

The following collections are automatically created:

#### **users Collection**
```javascript
{
  _id: ObjectId,
  email: string (unique),
  password: string (bcrypted),
  name: string,
  phone: string,
  role: "farmer" | "customer",
  
  // Farm details
  farm: {
    size: number,          // hectares
    type: string,          // "cereal" | "vegetable" | "fruit"
    crops: [string],
    soilType: string,      // "loamy" | "sandy" | "clayey"
    soilPH: number,
    nitrogen: number,      // N level
    phosphorus: number,    // P level
    potassium: number      // K level
  },
  
  // Location
  location: {
    latitude: number,
    longitude: number,
    address: string,
    pincode: string,
    state: string,
    district: string
  },
  
  // Notifications
  notificationPreferences: {
    weatherAlerts: boolean,
    priceAlerts: boolean,
    diseaseAlerts: boolean,
    emailNotifications: boolean
  },
  
  // System
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: boolean,
  isAdmin: boolean        // For admin accounts
}
```

#### **notifications Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "weather" | "price" | "disease" | "general",
  title: string,
  message: string,
  isRead: boolean,
  link: string,
  metadata: object,
  createdAt: Date,
  expiresAt: Date         // Auto-delete after 30 days
}
```

#### **marketplacelistings Collection**
```javascript
{
  _id: ObjectId,
  seller: ObjectId,
  product: string,
  price: number,
  quantity: number,
  unit: string,
  description: string,
  images: [string],
  status: "active" | "sold" | "removed",
  contact: {
    phone: string,
    email: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 👥 Admin Account Creation

### **Method 1: Direct Database Insert (Development)**

#### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Go to `krishisahayak` → `users` collection
4. Click "Insert Document"
5. Paste this document and modify:

```json
{
  "email": "admin@krishisahayak.com",
  "password": "$2a$10$HASH_OF_YOUR_PASSWORD",
  "name": "Admin User",
  "phone": "9999999999",
  "role": "farmer",
  "isAdmin": true,
  "isActive": true,
  "farm": {
    "size": 0,
    "type": "cereal",
    "crops": [],
    "soilType": "loamy"
  },
  "location": {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "Delhi",
    "pincode": "110000",
    "state": "Delhi",
    "district": "Delhi"
  },
  "notificationPreferences": {
    "weatherAlerts": true,
    "priceAlerts": true,
    "diseaseAlerts": true,
    "emailNotifications": false
  },
  "createdAt": new Date(),
  "updatedAt": new Date(),
  "lastLogin": null
}
```

**To Generate Password Hash:**
```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('your_secure_password', 10)
# Copy the output hash and paste in password field
```

---

### **Method 2: Programmatic Creation (Node.js Script)**

Create `backend/scripts/create-admin.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@krishisahayak.com' });
    if (existingAdmin) {
      console.log('✗ Admin account already exists!');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash('AdminPassword@123', 10);

    // Create admin
    const admin = new User({
      email: 'admin@krishisahayak.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '9999999999',
      role: 'farmer',
      isAdmin: true,
      isActive: true,
      farm: {
        size: 0,
        type: 'cereal',
        crops: [],
        soilType: 'loamy'
      },
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: 'Delhi',
        pincode: '110000',
        state: 'Delhi',
        district: 'Delhi'
      },
      notificationPreferences: {
        weatherAlerts: true,
        priceAlerts: true,
        diseaseAlerts: true,
        emailNotifications: false
      }
    });

    await admin.save();
    console.log('✓ Admin account created successfully!');
    console.log('  Email: admin@krishisahayak.com');
    console.log('  Password: AdminPassword@123');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
```

#### Run Script
```bash
cd backend
node scripts/create-admin.js
```

---

### **Method 3: REST API During Development**

If auth routes allow, register then manually set `isAdmin: true`:

```bash
# Register user
POST http://localhost:5000/api/auth/register
{
  "email": "admin@krishisahayak.com",
  "password": "AdminPassword@123",
  "name": "Admin User"
}

# Then in database, update:
db.users.updateOne(
  { email: "admin@krishisahayak.com" },
  { $set: { isAdmin: true } }
)
```

---

### **Admin Account Credentials (After Creation)**
```
Email: admin@krishisahayak.com
Password: AdminPassword@123  (CHANGE THIS AFTER FIRST LOGIN!)
Role: Farmer (admin privileges)
```

---

## 🔌 API Configuration

### **Weather API (OpenWeatherMap)**
1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for free account
3. Go to API keys section
4. Copy your API key
5. Add to `.env`: `OPENWEATHER_API_KEY=your_key`

### **AI Chat (Groq) - FREE, No Credit Card Required!**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (email only, no payment needed)
3. Go to "Keys" section
4. Create new API key
5. Add to `.env`: `GROQ_API_KEY=your_key`

### **Market Prices (Data.gov.in)**
1. Go to [data.gov.in](https://data.gov.in)
2. Create account
3. Browse APIs → Search "Agmarknet"
4. Subscribe to Agmarknet API
5. Get API key from profile
6. Add to `.env`: `DATA_GOV_API_KEY=your_key`

### **Disease Detection Fallback (Plant.id)**
1. Go to [plant.id](https://web.plant.id)
2. Sign up for free account
3. Go to API section
4. Create API key (100 identifications/day free)
5. Add to `.env`: `PLANT_ID_API_KEY=your_key`

### **Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback`
   - Your production domain
6. Copy Client ID and Secret
7. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

---

## 💻 Development Workflow

### **Running Everything (Quick Start)**

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm start

# Terminal 3: Disease Detection
cd backend/ml/disease-ai
python app.py

# Terminal 4: Crop Recommendation
cd backend/ml/crop_recommendation
python app.py

# Terminal 5: Yield Prediction
cd backend/ml/yield_prediction
python app.py
```

All services should now be running:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Disease AI: http://localhost:5001
- Crop Rec: http://localhost:5002
- Yield Pred: http://localhost:5004

### **Testing Workflow**

#### Test Backend API with Postman/Insomnia
```bash
# 1. Register
POST http://localhost:5000/api/auth/register
{
  "email": "test@test.com",
  "password": "Test@1234",
  "name": "Test Farmer"
}

# 2. Login
POST http://localhost:5000/api/auth/login
{
  "email": "test@test.com",
  "password": "Test@1234"
}

# Response contains: token (use in Authorization header)

# 3. Get Weather
GET http://localhost:5000/api/weather?city=Delhi
Headers: Authorization: Bearer <token>

# 4. Get Market Prices
GET http://localhost:5000/api/market/prices?commodity=Wheat
Headers: Authorization: Bearer <token>

# 5. Disease Detection
POST http://localhost:5000/api/disease/detect
Headers: Authorization: Bearer <token>
Body: multipart/form-data with image file

# 6. Chat with AI
POST http://localhost:5000/api/chat/message
Headers: Authorization: Bearer <token>
{
  "message": "What is the best crop to grow in Punjab?"
}
```

#### Test Frontend
1. Open http://localhost:3000
2. Register new account
3. Complete profile
4. Test each feature:
   - Weather forecast
   - Market prices
   - Disease detection (upload leaf image)
   - Crop recommendation
   - Yield prediction
   - Chat with AI
   - Marketplace

### **Code Structure Best Practices**

```
Feature Development Workflow:

1. Create new controller (backend/src/controllers/newFeatureController.js)
   ↓
2. Create service logic (backend/src/services/newFeatureService.js)
   ↓
3. Create/update model if needed (backend/src/models/NewFeature.js)
   ↓
4. Create routes (backend/src/routes/newFeature.js)
   ↓
5. Register routes in server.js
   ↓
6. Create frontend screen (frontend/src/screens/NewFeatureScreen.js)
   ↓
7. Add API service (frontend/src/services/api.js - add new endpoints)
   ↓
8. Add routing (frontend/src/App.js)
   ↓
9. Test with Postman/Insomnia
   ↓
10. Test in browser
```

---

## 🌐 Deployment Guide

### **Backend Deployment (Railway/Render/Heroku)**

#### Option 1: Railway.app (Recommended)

1. **Prepare for Deployment**
   ```bash
   # Ensure Procfile exists with:
   # web: node backend/server.js
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository
   - Add environment variables from `.env`
   - Deploy

#### Option 2: Render.com

1. Go to [render.com](https://render.com)
2. Click "New+" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `node backend/server.js`
5. Add environment variables
6. Deploy

### **Frontend Deployment (Vercel/Netlify)**

#### Option 1: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework: React
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variable:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.railway.app/api
   ```
6. Deploy

#### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub repository
4. Configure:
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `build`
5. Add environment variables
6. Deploy

### **Production Checklist**

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Update MongoDB Atlas IP whitelist
- [ ] Set JWT_SECRET to strong random value
- [ ] Enable HTTPS
- [ ] Update Google OAuth redirect URIs
- [ ] Test all API endpoints
- [ ] Test all ML services
- [ ] Monitor error logs
- [ ] Set up backups for MongoDB

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas (for cloud)

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

#### 3. Python Dependencies Issue
```
ModuleNotFoundError: No module named 'torch'
```
**Solution:**
```bash
cd backend/ml/disease-ai
pip install -r requirements.txt --upgrade
```

#### 4. CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure CORS is configured in `server.js`
- Verify API calls use correct base URL

#### 5. ML Service Not Responding
```
Error: connect ECONNREFUSED 127.0.0.1:5001
```
**Solution:**
- Start disease detection service on port 5001
- Check if service is running: `curl http://localhost:5001/health`
- Verify URLs in backend `.env`

#### 6. JWT Token Expiration
```
Error: jwt malformed / jwt expired
```
**Solution:**
- Log out and log back in
- Check token expiry in `.env` (JWT_EXPIRE)
- Clear localStorage and refresh page

#### 7. Image Upload Fails
```
Error: ENOENT: no such file or directory
```
**Solution:**
```bash
# Create uploads directory
mkdir -p backend/src/uploads/diseases
```

#### 8. Google OAuth Not Working
```
popup_closed_by_user / auth_popup_blocked
```
**Solution:**
- Verify Google Client ID in `.env`
- Check redirect URIs in Google Cloud Console
- Disable browser popup blocker
- Check browser console for errors

### **Debug Mode**

#### Enable Verbose Logging
```bash
# Backend
DEBUG=* npm start

# Frontend
REACT_APP_DEBUG=true npm start
```

#### View Request/Response
```javascript
// In Axios interceptor (frontend/src/services/api.js)
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  }
);
```

#### Check ML Service Logs
```bash
# Run ML service with verbose output
python -u app.py
```

---

## 📝 Development Tips

### **Code Style**
- Use ESLint for JavaScript
- Follow Node.js naming conventions
- Use async/await over promises
- Add JSDoc comments for functions

### **Security Best Practices**
- Never commit `.env` files
- Use environment variables for secrets
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Sanitize file uploads

### **Performance Optimization**
- Enable caching for static assets
- Compress responses with Gzip
- Lazy load React components
- Optimize database queries with indexes
- Use Redis for frequently accessed data

### **Testing**
```bash
# Backend unit tests
cd backend
npm test

# Frontend component tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - Free to use for educational and commercial purposes

---

## 🙏 Acknowledgments

- **OpenWeatherMap** – Real-time weather data
- **Data.gov.in Agmarknet** – Government agricultural market data
- **Groq** – Free unlimited AI chat (Llama 3.3-70b)
- **Plant.id** – Disease detection API
- **Material-UI** – Beautiful React components
- **PyTorch** – Deep learning framework
- **Scikit-learn** – Machine learning library

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/yourusername/KrishiSahayak/issues)
- **Email:** support@krishisahayak.com
- **Documentation:** See [RUNNING.md](./RUNNING.md) and [ReportMD.md](./ReportMD.md)

---

## 🌾 Join Us!

Help us empower Indian farmers through technology. Every contribution counts!

**KrishiSahayak - आपका डिजिटल कृषि साथी** 🌾

Made with ❤️ for Indian Farmers

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
