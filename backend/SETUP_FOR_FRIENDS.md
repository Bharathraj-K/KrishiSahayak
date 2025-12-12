# 🚀 Quick Setup Guide for Friends

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (free)

## Setup Steps

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd KrishiSahayak/backend
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env
```

### 3. Configure MongoDB Atlas
1. Go to https://www.mongodb.com/atlas/database
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Get connection string
5. Update `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krishisahayak?retryWrites=true&w=majority
```

### 4. Run the Backend
```bash
# Development mode
npm run dev

# Or production mode
npm start
```

## ✅ What Works Out of the Box
- ✅ **No Redis Required** - Caching is disabled by default
- ✅ **MongoDB Atlas** - Cloud database (no local install needed)
- ✅ **All APIs Ready** - Authentication, user management
- ✅ **Cross-Platform** - Works on Windows, Mac, Linux

## 🔧 Optional: Enable Redis (for better performance)
If you want caching for better performance:

### Windows (with Chocolatey):
```powershell
choco install redis-64
redis-server
```

### Update .env:
```env
DISABLE_REDIS=false
```

## 🌐 Testing
Server will run on: `http://localhost:5000`
Health check: `http://localhost:5000/health`

## 📱 Connect React Native App
Update your React Native app's API base URL to:
```javascript
const API_BASE_URL = 'http://YOUR_PC_IP:5000';
// or for local testing: 'http://localhost:5000'
```

## 🆘 Troubleshooting
- **MongoDB errors**: Check connection string in `.env`
- **Port 5000 busy**: Change `PORT=5001` in `.env`
- **Network issues**: Make sure Windows Firewall allows Node.js

**That's it!** Your backend will work on any PC without Redis installation.