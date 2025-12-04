import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Image,
  ScrollView 
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  ActivityIndicator,
  Chip 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { theme, styles } from '../styles/theme';

const DiseaseDetectionScreen = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted' && galleryStatus.status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri) => {
    setLoading(true);
    setResult(null);
    
    // Simulate API call to disease detection service
    setTimeout(() => {
      // Mock result for demonstration
      const mockResults = [
        {
          disease: 'Leaf Spot Disease',
          confidence: 92,
          severity: 'Moderate',
          treatment: 'Apply copper-based fungicide spray. Remove affected leaves.',
          prevention: 'Ensure proper drainage in field. Always treat seeds.',
          organicTreatment: 'Spray with neem oil mixture. Turmeric and jaggery solution is also effective.'
        },
        {
          disease: 'Healthy Leaf',
          confidence: 89,
          severity: 'No Issues',
          treatment: 'Your crop is healthy. Continue regular care.',
          prevention: 'Continue balanced fertilizer and water. Do timely weeding.',
          organicTreatment: 'Continue using organic fertilizers.'
        }
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
      setLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return theme.colors.error;
      case 'moderate':
        return theme.colors.warning;
      case 'mild':
        return theme.colors.info;
      default:
        return theme.colors.success;
    }
  };

  return (
    <ScrollView style={diseaseStyles.container}>
      <Card style={[styles.card]}>
        <Title style={diseaseStyles.title}>Identify Plant Disease</Title>
        <Paragraph style={diseaseStyles.subtitle}>
          Take or upload a photo of the leaf
        </Paragraph>

        {!image && (
          <View style={diseaseStyles.buttonContainer}>
            <Button
              mode="contained"
              style={[styles.button, diseaseStyles.cameraButton]}
              onPress={takePhoto}
              contentStyle={styles.farmerfriendly}
            >
              <MaterialCommunityIcons name="camera" size={24} color="white" />
              {'  '}Take Photo
            </Button>

            <Button
              mode="outlined"
              style={[styles.button, diseaseStyles.galleryButton]}
              onPress={pickImage}
              contentStyle={styles.farmerfriendly}
            >
              <MaterialCommunityIcons name="image" size={24} color={theme.colors.primary} />
              {'  '}Choose from Gallery
            </Button>
          </View>
        )}

        {image && (
          <View style={diseaseStyles.imageContainer}>
            <Image source={{ uri: image }} style={diseaseStyles.image} />
            <View style={diseaseStyles.imageActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setImage(null);
                  setResult(null);
                }}
                style={diseaseStyles.retakeButton}
              >
                Take Another Photo
              </Button>
            </View>
          </View>
        )}
      </Card>

      {loading && (
        <Card style={[styles.card]}>
          <View style={diseaseStyles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={diseaseStyles.loadingText}>
              AI analysis in progress...
            </Text>
          </View>
        </Card>
      )}

      {result && !loading && (
        <Card style={[styles.card]}>
          <View style={diseaseStyles.resultHeader}>
            <Title style={diseaseStyles.resultTitle}>Analysis Result</Title>
            <Chip 
              style={[diseaseStyles.confidenceChip, { backgroundColor: getSeverityColor(result.severity) }]}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
            >
              {result.confidence}% Accurate
            </Chip>
          </View>

          <Card style={diseaseStyles.resultCard}>
            <View style={diseaseStyles.diseaseInfo}>
              <MaterialCommunityIcons 
                name="leaf" 
                size={32} 
                color={getSeverityColor(result.severity)} 
              />
              <View style={diseaseStyles.diseaseText}>
                <Text style={diseaseStyles.diseaseName}>{result.disease}</Text>
                <Text style={[diseaseStyles.severity, { color: getSeverityColor(result.severity) }]}>
                  Severity: {result.severity}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={diseaseStyles.treatmentCard}>
            <Title style={diseaseStyles.treatmentTitle}>
              <MaterialCommunityIcons name="medical-bag" size={20} />
              {'  '}Treatment
            </Title>
            <Paragraph style={diseaseStyles.treatmentText}>
              {result.treatment}
            </Paragraph>
          </Card>

          <Card style={diseaseStyles.treatmentCard}>
            <Title style={diseaseStyles.treatmentTitle}>
              <MaterialCommunityIcons name="leaf" size={20} />
              {'  '}Organic Treatment
            </Title>
            <Paragraph style={diseaseStyles.treatmentText}>
              {result.organicTreatment}
            </Paragraph>
          </Card>

          <Card style={diseaseStyles.treatmentCard}>
            <Title style={diseaseStyles.treatmentTitle}>
              <MaterialCommunityIcons name="shield-check" size={20} />
              {'  '}Future Prevention
            </Title>
            <Paragraph style={diseaseStyles.treatmentText}>
              {result.prevention}
            </Paragraph>
          </Card>

          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: theme.colors.success }]}
            onPress={() => {
              setImage(null);
              setResult(null);
            }}
          >
            New Analysis
          </Button>
        </Card>
      )}

      <Card style={[styles.card, { marginBottom: 20 }]}>
        <Title style={diseaseStyles.tipsTitle}>Photo Taking Tips</Title>
        <View style={diseaseStyles.tipItem}>
          <MaterialCommunityIcons name="lightbulb-on" size={16} color={theme.colors.warning} />
          <Text style={diseaseStyles.tipText}>Take photos in good lighting</Text>
        </View>
        <View style={diseaseStyles.tipItem}>
          <MaterialCommunityIcons name="lightbulb-on" size={16} color={theme.colors.warning} />
          <Text style={diseaseStyles.tipText}>Focus closely on the leaf</Text>
        </View>
        <View style={diseaseStyles.tipItem}>
          <MaterialCommunityIcons name="lightbulb-on" size={16} color={theme.colors.warning} />
          <Text style={diseaseStyles.tipText}>Take clear and sharp photos</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const diseaseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.text,
  },
  buttonContainer: {
    gap: 10,
  },
  cameraButton: {
    backgroundColor: theme.colors.primary,
  },
  galleryButton: {
    borderColor: theme.colors.primary,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageActions: {
    marginTop: 15,
  },
  retakeButton: {
    borderColor: theme.colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  confidenceChip: {
    backgroundColor: theme.colors.success,
  },
  resultCard: {
    backgroundColor: '#F8F9FA',
    marginVertical: 10,
    padding: 15,
  },
  diseaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diseaseText: {
    marginLeft: 15,
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  severity: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  treatmentCard: {
    backgroundColor: '#FAFAFA',
    marginVertical: 5,
    padding: 15,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  treatmentText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tipText: {
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
});

export default DiseaseDetectionScreen;