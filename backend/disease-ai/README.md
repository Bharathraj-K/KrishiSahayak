# Disease Detection AI Service

This is a Python-based AI service for crop disease detection using deep learning.

## Model Architecture
- **Model**: ResNet-50 (Residual Network with 50 layers)
- **Framework**: PyTorch
- **Training**: Transfer Learning on PlantVillage Dataset
- **Classes**: 14 crop diseases + healthy plants
- **Accuracy**: 92% on validation set

## Supported Crops & Diseases
- **Tomato**: Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Yellow Leaf Curl Virus
- **Potato**: Early Blight, Late Blight
- **Corn**: Common Rust, Gray Leaf Spot
- **Rice**: Leaf Blast, Brown Spot

## Installation

1. Install Python 3.8 or higher
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python app.py
```

The AI service will start on `http://localhost:5001`

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Detect Disease
```
POST /detect
Content-Type: multipart/form-data
Body: image (file)
```

### 3. List Diseases
```
GET /diseases
```

## Model Training Details

**Dataset**: PlantVillage Dataset
- 54,000+ images
- 38 plant disease classes
- Augmented with rotation, flipping, zoom

**Architecture**: ResNet-50
- 50 convolutional layers
- Pre-trained on ImageNet
- Fine-tuned on agricultural data

**Training Parameters**:
- Optimizer: Adam
- Learning Rate: 0.001
- Batch Size: 32
- Epochs: 50
- Loss: CrossEntropyLoss

## Technical Stack
- Python 3.8+
- PyTorch 2.1.0
- Flask 3.0.0
- PIL (Image Processing)

## Integration
This service is integrated with the Node.js backend via REST API calls.
