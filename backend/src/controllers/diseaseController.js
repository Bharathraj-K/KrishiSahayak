const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const diseaseService = require('../services/diseaseService');
const { catchAsync, sendResponse, createError } = require('../middleware/errorHandler');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/diseases');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'disease-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

class DiseaseController {
  /**
   * Upload middleware
   */
  static uploadImage = upload.single('image');

  /**
   * Analyze plant disease from uploaded image
   */
  static analyzeDisease = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(createError('No image file uploaded', 400, 'NO_IMAGE'));
    }

    const imagePath = req.file.path;

    try {
      // Analyze the disease
      const analysis = await diseaseService.analyzePlantDisease(imagePath);

      // Save to user history if user is authenticated
      if (req.user) {
        await diseaseService.saveDiseaseAnalysis(req.user._id, analysis, imagePath);
      }

      // Return analysis
      sendResponse(res, 200, {
        analysis,
        image: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        }
      }, 'Disease analysis completed successfully');
    } catch (error) {
      // Clean up uploaded file on error
      try {
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
      throw error;
    }
  });

  /**
   * Get disease detection history for user
   */
  static getHistory = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { limit = 20 } = req.query;

    const history = await diseaseService.getDiseaseHistory(user._id);

    sendResponse(res, 200, {
      history: history.slice(0, parseInt(limit)),
      count: history.length
    }, 'Disease history fetched successfully');
  });

  /**
   * Get disease prevention tips
   */
  static getPreventionTips = catchAsync(async (req, res, next) => {
    const { category = 'general' } = req.query;

    const tips = diseaseService.getPreventionTips(category);

    sendResponse(res, 200, {
      category,
      tips,
      count: tips.length
    }, 'Prevention tips fetched successfully');
  });

  /**
   * Get treatment details for a specific disease
   */
  static getTreatmentDetails = catchAsync(async (req, res, next) => {
    const { disease } = req.query;

    if (!disease) {
      return next(createError('Disease name is required', 400, 'DISEASE_REQUIRED'));
    }

    const treatment = diseaseService.getTreatmentFromDatabase(disease);

    sendResponse(res, 200, {
      disease,
      treatment
    }, 'Treatment details fetched successfully');
  });

  /**
   * Get all supported disease categories
   */
  static getCategories = catchAsync(async (req, res, next) => {
    const categories = [
      {
        id: 'general',
        name: 'General Prevention',
        description: 'Common prevention tips for all plant diseases'
      },
      {
        id: 'fungal',
        name: 'Fungal Diseases',
        description: 'Prevention and treatment for fungal infections'
      },
      {
        id: 'bacterial',
        name: 'Bacterial Diseases',
        description: 'Prevention and treatment for bacterial infections'
      },
      {
        id: 'viral',
        name: 'Viral Diseases',
        description: 'Prevention and treatment for viral infections'
      }
    ];

    sendResponse(res, 200, {
      categories,
      count: categories.length
    }, 'Categories fetched successfully');
  });

  /**
   * Provide feedback on disease detection
   */
  static provideFeedback = catchAsync(async (req, res, next) => {
    const { analysisId, isCorrect, actualDisease, comments } = req.body;

    if (!analysisId) {
      return next(createError('Analysis ID is required', 400, 'ANALYSIS_ID_REQUIRED'));
    }

    // In production, save feedback to database for model improvement
    const feedback = {
      analysisId,
      isCorrect,
      actualDisease,
      comments,
      userId: req.user._id,
      timestamp: new Date()
    };

    sendResponse(res, 200, {
      feedback
    }, 'Thank you for your feedback!');
  });

  /**
   * Delete disease detection record
   */
  static deleteRecord = catchAsync(async (req, res, next) => {
    const { recordId } = req.params;
    const user = req.user;

    // In production, delete from database and remove image file
    // For now, just return success

    sendResponse(res, 200, {
      message: 'Record deleted successfully'
    }, 'Disease record deleted successfully');
  });
}

module.exports = DiseaseController;
