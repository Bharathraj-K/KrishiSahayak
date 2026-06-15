# KrishiSahayak — Local Setup & Run Guide (Windows)

This guide shows how to run **Frontend (React)**, **Backend (Node/Express)**, and the **ML microservices (Flask)** locally.

---

## Prerequisites

- **Node.js**: v18+ recommended (v14+ works for basic usage)
- **Python**: 3.8+ (3.10+ recommended)
- **MongoDB**:
  - MongoDB Atlas connection string **or** local MongoDB instance
- (Optional) **Redis** for caching (the backend can run without it)

---

## Project Ports (Local)

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **ML services**
  - **Disease Detection**: `http://localhost:5001` (`POST /detect`)
  - **Crop Recommendation**: `http://localhost:5002` (`POST /predict`)
  - **Yield Prediction**: `http://localhost:5004` (`POST /predict`)

---

## 1) Backend setup (Node/Express)

Open PowerShell in the repo root (`KrishiSahayak/`).

Install dependencies:

```powershell
cd backend
npm install
```

Create `backend/.env` (example template):

```env
# Server
PORT=5000
NODE_ENV=development

# Database (required)
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret

# External APIs (optional but recommended)
OPENWEATHER_API_KEY=your_openweather_key
DATA_GOV_API_KEY=your_data_gov_key
GROQ_API_KEY=your_groq_api_key
PLANT_ID_API_KEY=your_plant_id_key   # optional fallback for disease detection

# ML microservices (optional overrides — defaults shown)
AI_SERVICE_URL=http://localhost:5001
CROP_RECOMMENDATION_SERVICE_URL=http://localhost:5002
YIELD_PREDICTION_SERVICE_URL=http://localhost:5004

# Market defaults (optional)
DEFAULT_MARKET_STATE=Uttar Pradesh

# Redis (optional)
DISABLE_REDIS=true
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# Rate limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_REQUESTS_DEV=5000
```

Start the backend:

```powershell
npm run dev
```

Health check:
- `http://localhost:5000/health`

---

## 2) ML services setup (Python/Flask)

You can run the ML services in two ways:

### Option A (recommended): Install Python deps once, then run all services from the backend script

In **three separate PowerShell windows** (or one-by-one), install requirements:

```powershell
cd backend\ml\disease-ai
python -m pip install -r requirements.txt
```

```powershell
cd backend\ml\crop_recommendation
python -m pip install -r requirements.txt
```

```powershell
cd backend\ml\yield_prediction
python -m pip install -r requirements.txt
```

Then start all ML services together (from `backend/`):

```powershell
cd backend
npm run ml:start
```

### Option B: Run each service manually

```powershell
cd backend\ml\disease-ai
python app.py
```

```powershell
cd backend\ml\crop_recommendation
python app.py
```

```powershell
cd backend\ml\yield_prediction
python app.py
```

ML health checks:
- Disease: `http://localhost:5001/health`
- Crop: `http://localhost:5002/health`
- Yield: `http://localhost:5004/health`

---

## 3) Frontend setup (React)

In a new PowerShell window:

```powershell
cd frontend
npm install
npm start
```

The frontend uses the backend API at:
- `http://localhost:5000/api` (configured in `frontend/src/services/api.web.js`)

---

## Recommended run order (local)

1. Start **ML services** (optional but recommended)  
2. Start **Backend**  
3. Start **Frontend**

---

## Common issues (quick fixes)

- **MongoDB connection errors**
  - Verify `MONGODB_URI` is set in `backend/.env`
  - If using Atlas: allow your IP address in Network Access

- **ML services not responding**
  - Make sure each service is running on its expected port (5001/5002/5004)
  - If you changed ports, update `AI_SERVICE_URL`, `CROP_RECOMMENDATION_SERVICE_URL`, `YIELD_PREDICTION_SERVICE_URL`

- **Redis errors**
  - Set `DISABLE_REDIS=true` in `backend/.env` (backend will work without cache)

- **Chat assistant in mock mode**
  - Set `GROQ_API_KEY` in `backend/.env`

---

## Useful URLs

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/health`

