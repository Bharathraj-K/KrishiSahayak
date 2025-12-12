const express = require('express');
const DiseaseController = require('../controllers/diseaseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All disease routes require authentication
router.use(protect);

// Analyze plant disease from image
router.post('/analyze', 
  DiseaseController.uploadImage,
  DiseaseController.analyzeDisease
);

// Get disease detection history
router.get('/history', DiseaseController.getHistory);

// Get prevention tips
router.get('/prevention-tips', DiseaseController.getPreventionTips);

// Get treatment details for a disease
router.get('/treatment', DiseaseController.getTreatmentDetails);

// Get disease categories
router.get('/categories', DiseaseController.getCategories);

// Provide feedback on analysis
router.post('/feedback', DiseaseController.provideFeedback);

// Delete disease record
router.delete('/records/:recordId', DiseaseController.deleteRecord);

module.exports = router;
