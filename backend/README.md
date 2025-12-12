# KrishiSahayak Backend API

## Phase 1 Completed ✅

### 🎉 What's Been Accomplished

**✅ Core Infrastructure Setup**
- Node.js project initialized with Express.js
- MongoDB connection configured with Mongoose
- Redis caching setup (optional fallback when Redis unavailable)
- JWT authentication system implemented
- Comprehensive error handling and validation
- Security middleware (helmet, CORS, rate limiting)
- Development environment with nodemon

**✅ Authentication System**
- Complete User model with comprehensive schema
- Registration and login endpoints
- JWT token generation and validation
- Password hashing with bcrypt
- Profile management endpoints
- Account security features (password change, account deletion)
- FCM token support for push notifications

**✅ Advanced Features**
- Geospatial location queries
- User statistics tracking
- Flexible notification settings
- Farm details management
- Input validation and sanitization
- Proper error responses with codes
- Caching layer with Redis fallback

---

## 🚀 Current Status

### Server Running
The backend server is running on `http://localhost:5000` with the following endpoints:

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PATCH | `/api/auth/change-password` | Change password | Yes |
| PATCH | `/api/auth/fcm-token` | Update FCM token | Yes |
| POST | `/api/auth/logout` | User logout | Yes |
| DELETE | `/api/auth/account` | Delete user account | Yes |

---

## 📋 What's Next (Upcoming Phases)

### Phase 2: User Profile & Settings Integration
- Connect ProfileScreen.js to backend APIs
- Replace mock user data with real authentication
- Implement proper settings management

### Phase 3: Weather Service
- Integrate OpenWeatherMap API
- Replace WeatherScreen.js mock data
- Add location-based weather fetching

### Phase 4: Market Prices Service
- Integrate market price APIs
- Replace MarketPricesScreen.js mock data
- Add real-time price updates

### Phase 5: Disease Detection AI
- Implement image upload and AI analysis
- Replace DiseaseDetectionScreen.js mock detection
- Add treatment recommendations

### Phase 6: Chat Assistant
- Integrate OpenAI or custom NLP model
- Replace ChatAssistantScreen.js mock responses
- Add intelligent agricultural assistance

---

## 🛠️ How to Use

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- Redis (optional, for caching)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm start
   ```

### Environment Variables

```env
# Required
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/krishisahayak
JWT_SECRET=your_super_secure_jwt_secret_key

# Optional (Redis for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🧪 API Testing

### Health Check
```bash
GET http://localhost:5000/health
```

### User Registration
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "FarmerPass123",
  "name": "John Farmer",
  "phone": "9876543210"
}
```

### User Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "FarmerPass123"
}
```

### Get Profile (Protected)
```bash
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <your_jwt_token>
```

---

## 🔧 Technical Architecture

### Database Schema
- **Users Collection**: Complete user profiles with farm details, settings, stats
- **Geospatial Indexing**: Location-based farmer queries
- **Flexible Settings**: Notifications, language, theme preferences
- **Security**: Password hashing, JWT tokens, input validation

### Middleware Stack
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Express-validator with custom rules
- **Error Handling**: Comprehensive error responses with codes
- **Logging**: Morgan for request logging
- **Compression**: Gzip compression for responses

### Caching Strategy
- **Redis**: Primary cache for user sessions, API responses
- **Fallback**: Graceful degradation when Redis unavailable
- **TTL**: Configurable expiration times for different data types

---

## 🚨 Current Notes

1. **MongoDB Connection**: ✅ Working
2. **Redis Connection**: ⚠️ Optional (install Redis for full caching)
3. **Server Status**: ✅ Running on port 5000
4. **Security**: ✅ Rate limiting, validation, JWT protection

---

## 🎯 Ready for Phase 2

The foundation is solid! We can now move to Phase 2 where we'll:
1. Connect the React Native frontend to these APIs
2. Replace mock data with real backend calls
3. Implement proper authentication flow in the mobile app

**Next Step**: Start integrating ProfileScreen.js with the backend authentication system.