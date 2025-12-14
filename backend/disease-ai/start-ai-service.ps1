# AI Disease Detection Service Startup Script

Write-Host "=" * 60
Write-Host "🌾 Starting KrishiSahayak AI Services"
Write-Host "=" * 60

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion"
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+"
    exit 1
}

# Navigate to AI service directory
Set-Location E:\KrishiSahayak\backend\disease-ai

# Check if virtual environment exists
if (-Not (Test-Path ".\venv")) {
    Write-Host "📦 Creating Python virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "📥 Installing AI dependencies..."
pip install -r requirements.txt

# Start AI service
Write-Host ""
Write-Host "🚀 Starting AI Disease Detection Service on port 5001..."
Write-Host "=" * 60
python app.py
