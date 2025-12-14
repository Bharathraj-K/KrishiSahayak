"""
Training script for plant disease detection model
Based on: https://github.com/Denisganga/the_plant_doctor
Dataset: PlantVillage from Kaggle (https://www.kaggle.com/datasets/emmarex/plantdisease)

To train:
1. Download PlantVillage dataset from Kaggle
2. Extract to 'PlantVillage/' folder
3. Run: python train_model.py
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

# Configuration
DATASET_PATH = 'PlantVillage'  # Download from Kaggle
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.001
NUM_CLASSES = 14  # Our specific disease classes

# Disease classes mapping
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

# Data augmentation and normalization
train_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def train_model():
    print("=" * 60)
    print("🌾 KrishiSahayak - Plant Disease Detection Model Training")
    print("=" * 60)
    
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset not found at {DATASET_PATH}")
        print("📥 Download PlantVillage dataset from:")
        print("   https://www.kaggle.com/datasets/emmarex/plantdisease")
        return
    
    # Load datasets
    print("\n📂 Loading dataset...")
    train_data = datasets.ImageFolder(
        os.path.join(DATASET_PATH, 'train'), 
        transform=train_transform
    )
    val_data = datasets.ImageFolder(
        os.path.join(DATASET_PATH, 'val'), 
        transform=val_transform
    )
    
    train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False, num_workers=4)
    
    print(f"✅ Training samples: {len(train_data)}")
    print(f"✅ Validation samples: {len(val_data)}")
    print(f"✅ Number of classes: {NUM_CLASSES}")
    
    # Load pre-trained ResNet-50 (better than ResNet-18)
    print("\n🔧 Loading ResNet-50 model...")
    model = models.resnet50(pretrained=True)
    
    # Freeze early layers (transfer learning)
    for param in model.parameters():
        param.requires_grad = False
    
    # Replace final layer for our classes
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, NUM_CLASSES)
    
    # Move to GPU if available
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"✅ Using device: {device}")
    model = model.to(device)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)
    
    # Training loop
    print("\n🚀 Starting training...")
    best_acc = 0.0
    
    for epoch in range(NUM_EPOCHS):
        print(f"\n{'='*60}")
        print(f"Epoch {epoch+1}/{NUM_EPOCHS}")
        print(f"{'='*60}")
        
        # Training phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for i, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            # Statistics
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            if (i + 1) % 50 == 0:
                print(f"Batch [{i+1}/{len(train_loader)}] "
                      f"Loss: {running_loss/(i+1):.4f} "
                      f"Acc: {100.*correct/total:.2f}%")
        
        train_acc = 100. * correct / total
        train_loss = running_loss / len(train_loader)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
        
        val_acc = 100. * val_correct / val_total
        val_loss = val_loss / len(val_loader)
        
        print(f"\n📊 Epoch {epoch+1} Results:")
        print(f"   Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"   Val Loss: {val_loss:.4f}   | Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'accuracy': best_acc,
                'classes': DISEASE_CLASSES
            }, 'disease_model_best.pth')
            print(f"   ✅ New best model saved! (Accuracy: {best_acc:.2f}%)")
    
    print("\n" + "=" * 60)
    print(f"🎉 Training Complete!")
    print(f"✅ Best Validation Accuracy: {best_acc:.2f}%")
    print(f"✅ Model saved as: disease_model_best.pth")
    print("=" * 60)

if __name__ == '__main__':
    train_model()
