from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
import io
import json

app = Flask(__name__)
CORS(app)

# Disease classes (14 common crop diseases in India)
DISEASE_CLASSES = [
    'Tomato_Early_Blight',
    'Tomato_Late_Blight', 
    'Tomato_Leaf_Mold',
    'Tomato_Septoria_Leaf_Spot',
    'Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato_Healthy',
    'Potato_Early_Blight',
    'Potato_Late_Blight',
    'Potato_Healthy',
    'Corn_Common_Rust',
    'Corn_Gray_Leaf_Spot',
    'Corn_Healthy',
    'Rice_Leaf_Blast',
    'Rice_Brown_Spot'
]

# Load disease information database
DISEASE_INFO = {
    'Tomato_Early_Blight': {
        'name': 'Tomato Early Blight',
        'scientific_name': 'Alternaria solani',
        'description': 'Early blight is a common fungal disease that causes dark brown spots with concentric rings on older leaves.',
        'symptoms': [
            'Brown spots with concentric rings on lower leaves',
            'Yellow halo around spots',
            'Leaves eventually die and fall off',
            'Can affect stems and fruits'
        ],
        'organic_treatment': [
            'Remove and destroy infected leaves',
            'Apply neem oil spray (5ml per liter water)',
            'Use copper-based fungicides',
            'Spray baking soda solution (1 tablespoon per liter)',
            'Maintain proper plant spacing for air circulation'
        ],
        'chemical_treatment': [
            'Chlorothalonil (2g per liter)',
            'Mancozeb (2.5g per liter)',
            'Azoxystrobin',
            'Apply every 7-10 days'
        ],
        'prevention': [
            'Use disease-resistant varieties',
            'Practice crop rotation (3-4 years)',
            'Water at base of plant, not overhead',
            'Mulch to prevent soil splash',
            'Remove plant debris after harvest'
        ]
    },
    'Tomato_Late_Blight': {
        'name': 'Tomato Late Blight',
        'scientific_name': 'Phytophthora infestans',
        'description': 'A devastating disease that can destroy entire crops within days during humid conditions.',
        'symptoms': [
            'Large brown or black lesions on leaves',
            'White fuzzy growth on undersides of leaves',
            'Brown spots on stems and fruits',
            'Rapid plant death in humid weather'
        ],
        'organic_treatment': [
            'Remove infected plants immediately',
            'Apply copper fungicides',
            'Use biological control (Bacillus subtilis)',
            'Improve air circulation'
        ],
        'chemical_treatment': [
            'Metalaxyl + Mancozeb',
            'Dimethomorph',
            'Cymoxanil',
            'Apply preventively in humid weather'
        ],
        'prevention': [
            'Plant resistant varieties',
            'Avoid overhead irrigation',
            'Space plants properly',
            'Monitor weather for high humidity'
        ]
    },
    'Potato_Early_Blight': {
        'name': 'Potato Early Blight',
        'scientific_name': 'Alternaria solani',
        'description': 'Common fungal disease causing yield loss in potatoes.',
        'symptoms': [
            'Circular brown spots on older leaves',
            'Target-like concentric rings',
            'Premature leaf drop',
            'Reduced tuber size'
        ],
        'organic_treatment': [
            'Neem oil application',
            'Remove infected foliage',
            'Copper-based sprays',
            'Compost tea application'
        ],
        'chemical_treatment': [
            'Chlorothalonil',
            'Mancozeb',
            'Azoxystrobin',
            'Spray every 7-14 days'
        ],
        'prevention': [
            'Certified disease-free seed potatoes',
            'Crop rotation',
            'Proper fertilization',
            'Avoid water stress'
        ]
    },
    'Potato_Late_Blight': {
        'name': 'Potato Late Blight',
        'scientific_name': 'Phytophthora infestans',
        'description': 'Historic disease that caused Irish potato famine, still devastating today.',
        'symptoms': [
            'Water-soaked lesions on leaves',
            'White mold on leaf undersides',
            'Brown rot on tubers',
            'Foul smell from infected tubers'
        ],
        'organic_treatment': [
            'Destroy infected plants',
            'Copper fungicides',
            'Biological fungicides',
            'Hill up soil to protect tubers'
        ],
        'chemical_treatment': [
            'Metalaxyl',
            'Mancozeb',
            'Cymoxanil + Famoxadone',
            'Apply before disease appears'
        ],
        'prevention': [
            'Resistant varieties',
            'Certified seed',
            'Fungicide spray program',
            'Good drainage'
        ]
    },
    'Corn_Common_Rust': {
        'name': 'Corn Common Rust',
        'scientific_name': 'Puccinia sorghi',
        'description': 'Fungal disease causing rust-colored pustules on corn leaves.',
        'symptoms': [
            'Small reddish-brown pustules on leaves',
            'Pustules rupture releasing spores',
            'Reduced photosynthesis',
            'Premature leaf death'
        ],
        'organic_treatment': [
            'Plant resistant hybrids',
            'Remove infected leaves',
            'Sulfur-based fungicides',
            'Improve air circulation'
        ],
        'chemical_treatment': [
            'Azoxystrobin',
            'Propiconazole',
            'Tebuconazole',
            'Apply at first sign'
        ],
        'prevention': [
            'Resistant hybrids',
            'Early planting',
            'Balanced fertilization',
            'Crop rotation'
        ]
    },
    'Rice_Leaf_Blast': {
        'name': 'Rice Leaf Blast',
        'scientific_name': 'Magnaporthe oryzae',
        'description': 'Most destructive disease of rice, can cause up to 50% yield loss.',
        'symptoms': [
            'Diamond-shaped lesions on leaves',
            'Gray center with brown borders',
            'Neck rot in severe cases',
            'Reduced grain filling'
        ],
        'organic_treatment': [
            'Use resistant varieties',
            'Silicon fertilizer application',
            'Neem cake in soil',
            'Biological control agents'
        ],
        'chemical_treatment': [
            'Tricyclazole',
            'Carbendazim',
            'Isoprothiolane',
            'Apply at tillering stage'
        ],
        'prevention': [
            'Resistant varieties',
            'Balanced nitrogen fertilization',
            'Proper water management',
            'Remove infected stubble'
        ]
    }
}

# Load pre-trained ResNet-50 model
print("Loading AI model...")
model = models.resnet50(pretrained=True)
num_classes = len(DISEASE_CLASSES)
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Load trained weights if available
import os
if os.path.exists('disease_model_best.pth'):
    print("✅ Loading trained model weights from disease_model_best.pth")
    checkpoint = torch.load('disease_model_best.pth', map_location='cpu')
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"✅ Model trained with accuracy: {checkpoint.get('accuracy', 'N/A')}")
else:
    print("⚠️  Using ImageNet pretrained weights (untrained on plant diseases)")
    print("💡 Run train_model.py to train on PlantVillage dataset")

model.eval()
print(f"Model loaded successfully with {num_classes} disease classes")

# Image preprocessing pipeline
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def get_disease_info(disease_class):
    """Get detailed information about a disease"""
    if disease_class in DISEASE_INFO:
        return DISEASE_INFO[disease_class]
    
    # For healthy or unlisted diseases
    disease_name = disease_class.replace('_', ' ')
    if 'Healthy' in disease_class:
        return {
            'name': disease_name,
            'scientific_name': 'N/A',
            'description': 'Your plant appears healthy! No disease detected.',
            'symptoms': ['No visible disease symptoms'],
            'organic_treatment': ['Continue good agricultural practices'],
            'chemical_treatment': ['No treatment needed'],
            'prevention': [
                'Maintain proper plant nutrition',
                'Ensure adequate watering',
                'Monitor regularly for pests',
                'Practice crop rotation'
            ]
        }
    else:
        return {
            'name': disease_name,
            'scientific_name': 'Unknown',
            'description': 'Disease detected. Consult local agricultural expert for specific treatment.',
            'symptoms': ['Visible disease symptoms on plant'],
            'organic_treatment': ['Consult agricultural extension officer'],
            'chemical_treatment': ['Contact plant pathologist'],
            'prevention': ['Regular monitoring', 'Good cultural practices']
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Disease Detection AI',
        'model': 'ResNet-50',
        'classes': len(DISEASE_CLASSES)
    }), 200

@app.route('/detect', methods=['POST'])
def detect_disease():
    """Main disease detection endpoint"""
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        file = request.files['image']
        
        # Validate file
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Read and preprocess image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # Transform image
        img_tensor = transform(img).unsqueeze(0)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
            # Get top 3 predictions
            top3_prob, top3_idx = torch.topk(probabilities, 3)
            
            predictions = []
            for i in range(3):
                disease_class = DISEASE_CLASSES[top3_idx[i].item()]
                confidence = top3_prob[i].item() * 100
                predictions.append({
                    'disease': disease_class,
                    'confidence': round(confidence, 2)
                })
            
            # Get the top prediction
            top_disease_class = DISEASE_CLASSES[top3_idx[0].item()]
            top_confidence = top3_prob[0].item() * 100
            
            # Get disease information
            disease_info = get_disease_info(top_disease_class)
            
            # Determine if plant is healthy
            is_healthy = 'Healthy' in top_disease_class
            
            response = {
                'success': True,
                'disease': disease_info['name'],
                'scientific_name': disease_info['scientific_name'],
                'confidence': f"{top_confidence:.2f}%",
                'is_healthy': is_healthy,
                'description': disease_info['description'],
                'symptoms': disease_info['symptoms'],
                'treatment': {
                    'organic': disease_info['organic_treatment'],
                    'chemical': disease_info['chemical_treatment']
                },
                'prevention': disease_info['prevention'],
                'alternative_predictions': [
                    {
                        'disease': DISEASE_CLASSES[top3_idx[i].item()].replace('_', ' '),
                        'confidence': f"{top3_prob[i].item() * 100:.2f}%"
                    }
                    for i in range(1, 3)
                ]
            }
            
            return jsonify(response), 200
            
    except Exception as e:
        print(f"Error in disease detection: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process image',
            'details': str(e)
        }), 500

@app.route('/diseases', methods=['GET'])
def list_diseases():
    """List all detectable diseases"""
    diseases = [
        {
            'class': disease_class,
            'name': disease_class.replace('_', ' '),
            'category': disease_class.split('_')[0]
        }
        for disease_class in DISEASE_CLASSES
    ]
    
    return jsonify({
        'total': len(diseases),
        'diseases': diseases
    }), 200

if __name__ == '__main__':
    print("=" * 50)
    print("🌾 KrishiSahayak Disease Detection AI Service")
    print("=" * 50)
    print(f"✅ Model: ResNet-50")
    print(f"✅ Classes: {len(DISEASE_CLASSES)}")
    print(f"✅ Server: http://localhost:5001")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
