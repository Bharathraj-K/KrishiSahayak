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
from torch.utils.data import DataLoader, random_split
import kagglehub
path = kagglehub.dataset_download("emmarex/plantdisease")
print("Path to dataset files:", path)
import os

# Configuration
# The actual dataset is in nested PlantVillage folder
DATASET_PATH = os.path.join(path, 'PlantVillage', 'PlantVillage')
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.001
TRAIN_SPLIT = 0.8  # 80% train, 20% validation
NUM_CLASSES = None  # Will be determined from dataset

# Disease classes mapping - will be auto-detected from dataset
DISEASE_CLASSES = []

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
    global NUM_CLASSES, DISEASE_CLASSES
    
    print("=" * 60)
    print("🌾 KrishiSahayak - Plant Disease Detection Model Training")
    print("=" * 60)
    
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset not found at {DATASET_PATH}")
        print("📥 Download PlantVillage dataset from:")
        print("   https://www.kaggle.com/datasets/emmarex/plantdisease")
        return
    
    # Load entire dataset first with validation transforms
    print("\n📂 Loading dataset...")
    full_dataset = datasets.ImageFolder(
        DATASET_PATH,
        transform=None  # We'll apply transforms after split
    )
    
    # Get classes from dataset
    DISEASE_CLASSES = full_dataset.classes
    NUM_CLASSES = len(DISEASE_CLASSES)
    print(f"✅ Found {NUM_CLASSES} disease classes")
    print(f"📋 Classes: {', '.join(DISEASE_CLASSES[:5])}... (and {NUM_CLASSES-5} more)")
    
    # Split dataset into train and validation
    train_size = int(TRAIN_SPLIT * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    # Create random split
    train_dataset, val_dataset = random_split(
        full_dataset, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)  # For reproducibility
    )
    
    # Apply transforms to the split datasets
    # Create new datasets with transforms
    train_data = datasets.ImageFolder(DATASET_PATH, transform=train_transform)
    val_data = datasets.ImageFolder(DATASET_PATH, transform=val_transform)
    
    # Re-apply the split with same indices
    train_data, _ = random_split(
        train_data, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    _, val_data = random_split(
        val_data, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    
    print(f"✅ Training samples: {train_size}")
    print(f"✅ Validation samples: {val_size}")
    print(f"✅ Train/Val split: {int(TRAIN_SPLIT*100)}/{int((1-TRAIN_SPLIT)*100)}")
    
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
