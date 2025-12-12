// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Create error utility function
const createError = (message, statusCode = 500, code = null, details = null) => {
  return new AppError(message, statusCode, code, details);
};

// Handle different types of errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return createError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists. Please use a different value.`;
  return createError(message, 400, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return createError(message, 400, 'VALIDATION_ERROR', errors);
};

const handleJWTError = () =>
  createError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  createError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return createError('File too large. Maximum size allowed is 5MB.', 400, 'FILE_TOO_LARGE');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return createError('Too many files. Maximum 5 files allowed.', 400, 'TOO_MANY_FILES');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return createError('Invalid file field name.', 400, 'INVALID_FILE_FIELD');
  }
  return createError('File upload error.', 400, 'FILE_UPLOAD_ERROR');
};

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      details: err.details,
      stack: err.stack
    },
    timestamp: new Date().toISOString()
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', err);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong!'
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ ${error.statusCode} ${error.message} - ${req.method} ${req.originalUrl}`);
  }

  // MongoDB cast error
  if (err.name === 'CastError') error = handleCastErrorDB(error);
  
  // MongoDB duplicate key error
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);
  
  // MongoDB validation error
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  
  // Multer errors
  if (err.name === 'MulterError') error = handleMulterError(error);

  // Send response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 handler
const notFound = (req, res, next) => {
  const error = createError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Async error handler wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation error handler
const validationError = (errors) => {
  const formattedErrors = errors.map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));
  
  return createError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    formattedErrors
  );
};

// Success response helper
const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Pagination helper
const getPaginationData = (req, totalCount) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    skip,
    limit
  };
};

module.exports = {
  AppError,
  createError,
  errorHandler,
  notFound,
  catchAsync,
  validationError,
  sendResponse,
  getPaginationData
};