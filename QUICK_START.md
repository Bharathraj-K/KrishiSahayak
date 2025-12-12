# 🚀 Quick Start Guide - KrishiSahayak Web App

## Getting Started in 3 Steps

### Step 1: Start the Backend (Port 5000)
```bash
cd backend
npm install  # If not already done
npm start
```

You should see:
```
✓ MongoDB connected successfully
✓ Server running on port 5000
```

### Step 2: Start the Frontend (Port 3000)
```bash
# In the root directory (e:\KrishiSahayak)
npm start
```

The app will automatically open at `http://localhost:3000`

### Step 3: Test the Application

1. **Register a New User**
   - Click "Don't have an account? Register"
   - Fill in: Name, Email, Password, Confirm Password
   - Watch the password strength indicator turn green
   - Click "Register"

2. **Login**
   - Enter your email and password
   - Click "Login"
   - You'll be redirected to the Dashboard

3. **Explore Dashboard**
   - See the welcome message
   - View the 4 feature cards (Weather, Market, Disease, Profile)
   - Click "Logout" to test logout functionality

---

## 🔧 Troubleshooting

### Port 3000 Already in Use
```bash
$env:PORT=3001; npm start
```

### Backend Not Connecting
Make sure MongoDB Atlas credentials are correct in `backend/.env`:
```
MONGODB_URI=mongodb+srv://KrishiSahayak:KrishiSahayak@cluster0.mongodb.net/krishisahayak
```

### Clear Browser Cache
If you see old screens, press `Ctrl+Shift+R` to hard refresh.

---

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Backend Health**: http://localhost:5000

---

## 🎯 Test Credentials

Create your own by registering! There's no default user in the database yet.

**Register with**:
- Name: Test Farmer
- Email: test@farmer.com
- Password: Test@1234
- Confirm: Test@1234

---

## ✅ What You Should See

### Login Screen
- Green Material-UI header
- Email field with @ icon
- Password field with lock icon and visibility toggle
- Green "Login" button
- Link to registration

### Register Screen
- Full form with name, email, password fields
- Real-time password strength bar (changes from red → yellow → green)
- Green "Register" button
- Link back to login

### Dashboard
- Green AppBar with "कृषि सहायक - KrishiSahayak" branding
- Logout button in top right
- Welcome message
- 4 feature cards in grid:
  - 🌤️ Weather (blue)
  - 📈 Market Prices (green)
  - 🐛 Disease Detection (yellow/orange)
  - 👤 Profile (blue)
- Success notification about authentication system

---

## 🔐 Authentication Flow

```
Register → Login → Dashboard → Logout → Login Screen
    ↓         ↓         ↓          ↓
  Stores   Verifies  Protected   Clears
  JWT      Token     Route       Token
```

---

## 🎨 Color Scheme

- **Primary**: #4CAF50 (Green - representing agriculture)
- **Secondary**: #8BC34A (Light Green)
- **Weather**: Blue (CloudQueue icon)
- **Market**: Green (ShowChart icon)
- **Disease**: Orange (BugReport icon)
- **Profile**: Blue (AccountCircle icon)

---

## 📦 What's Included

- ✅ User Registration with validation
- ✅ User Login with JWT authentication
- ✅ Password strength indicator
- ✅ Protected Dashboard route
- ✅ Logout functionality
- ✅ Material-UI modern design
- ✅ Responsive layout
- ✅ Token auto-refresh on 401

---

## 🚀 Next: Phase 3

Once you've tested the authentication flow, we can implement:
1. Weather Service with OpenWeatherMap API
2. Market Prices screen
3. Disease Detection with image upload
4. Profile management

---

**Status**: 🟢 Ready to Use
**Browser**: Chrome, Firefox, Safari, Edge (any modern browser)
**Mobile**: Works on mobile browsers too (responsive design)
