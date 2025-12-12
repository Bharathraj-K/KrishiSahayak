import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BugReport,
  CloudUpload,
  Camera,
  CheckCircle,
  Warning,
  ExpandMore,
  LocalHospital,
  Nature,
  Science,
} from '@mui/icons-material';
import api from '../services/api.web';

const DiseaseScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preventionTips, setPreventionTips] = useState([]);
  const fileInputRef = useRef(null);

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setError('');
      setAnalysis(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze disease
  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await api.post('/disease/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysis(response.data.data.analysis);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prevention tips
  const fetchPreventionTips = async (category = 'general') => {
    try {
      const response = await api.get(`/disease/prevention-tips?category=${category}`);
      setPreventionTips(response.data.data.tips);
    } catch (err) {
      console.error('Failed to fetch prevention tips:', err);
    }
  };

  // Load prevention tips on mount
  React.useEffect(() => {
    fetchPreventionTips('general');
  }, []);

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'moderate':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <BugReport sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Disease Detection
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Analyze Disease" />
        <Tab label="Prevention Tips" />
      </Tabs>

      {/* Tab 0: Analyze Disease */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Upload Plant Image
              </Typography>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />

              <Box sx={{ mt: 2 }}>
                {imagePreview ? (
                  <Box>
                    <img
                      src={imagePreview}
                      alt="Selected plant"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => fileInputRef.current.click()}
                        fullWidth
                      >
                        Change Image
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<BugReport />}
                        onClick={handleAnalyze}
                        disabled={loading}
                        fullWidth
                      >
                        {loading ? <CircularProgress size={24} /> : 'Analyze'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                    }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Camera sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Select Plant Image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click to upload or drag and drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Supported formats: JPG, PNG, GIF, WEBP (Max 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Analysis Results */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                  <CircularProgress />
                </Box>
              )}

              {!loading && !analysis && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <BugReport sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Upload and analyze a plant image to see results
                  </Typography>
                </Box>
              )}

              {!loading && analysis && (
                <Box>
                  {/* Health Status */}
                  <Alert
                    severity={analysis.isHealthy ? 'success' : 'warning'}
                    icon={analysis.isHealthy ? <CheckCircle /> : <Warning />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {analysis.isHealthy ? 'Plant appears healthy!' : 'Disease detected'}
                    </Typography>
                  </Alert>

                  {/* Diseases */}
                  {analysis.diseases && analysis.diseases.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {analysis.diseases.map((disease, idx) => (
                        <Card key={idx} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6">{disease.name}</Typography>
                              <Chip
                                label={`${disease.probability}% confidence`}
                                color="primary"
                                size="small"
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph>
                              {disease.description}
                            </Typography>

                            {disease.treatment && (
                              <Box sx={{ mt: 2 }}>
                                <Chip
                                  label={disease.treatment.severity || 'moderate'}
                                  color={getSeverityColor(disease.treatment.severity)}
                                  size="small"
                                  sx={{ mb: 2 }}
                                />

                                <Accordion>
                                  <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Nature sx={{ mr: 1 }} />
                                    <Typography>Organic Treatment</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <List dense>
                                      {disease.treatment.organic?.map((treatment, i) => (
                                        <ListItem key={i}>
                                          <ListItemText primary={treatment} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                  <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Science sx={{ mr: 1 }} />
                                    <Typography>Chemical Treatment</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <List dense>
                                      {disease.treatment.chemical?.map((treatment, i) => (
                                        <ListItem key={i}>
                                          <ListItemText primary={treatment} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                  <AccordionSummary expandIcon={<ExpandMore />}>
                                    <LocalHospital sx={{ mr: 1 }} />
                                    <Typography>Prevention</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <List dense>
                                      {disease.treatment.prevention?.map((tip, i) => (
                                        <ListItem key={i}>
                                          <ListItemText primary={tip} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </AccordionDetails>
                                </Accordion>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {/* Suggestions */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Recommendations:
                      </Typography>
                      <List dense>
                        {analysis.suggestions.map((suggestion, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={suggestion} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Prevention Tips */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disease Prevention Tips
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {['general', 'fungal', 'bacterial', 'viral'].map((category) => (
              <Grid item key={category}>
                <Button
                  variant="outlined"
                  onClick={() => fetchPreventionTips(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              </Grid>
            ))}
          </Grid>

          <List>
            {preventionTips.map((tip, idx) => (
              <ListItem key={idx}>
                <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default DiseaseScreen;
