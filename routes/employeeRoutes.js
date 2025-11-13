const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const validateEmployee = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .trim(),
  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom((value) => value >= 0)
    .withMessage('Salary cannot be negative'),
  body('date_of_joining')
    .notEmpty()
    .withMessage('Date of joining is required')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .trim(),
];

const validateEmployeeUpdate = [
  body('first_name')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .trim(),
  body('last_name')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('position')
    .optional()
    .notEmpty()
    .withMessage('Position cannot be empty')
    .trim(),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom((value) => value >= 0)
    .withMessage('Salary cannot be negative'),
  body('date_of_joining')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('department')
    .optional()
    .notEmpty()
    .withMessage('Department cannot be empty')
    .trim(),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: false,
        message: 'File size too large. Maximum size is 5MB',
      });
    }
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }
  next();
};

// Routes - All routes are protected with JWT
// Search must come before /:id to avoid route conflict
router.get('/search', protect, searchEmployees);
router.get('/', protect, getAllEmployees);
router.post(
  '/',
  protect,
  upload.single('profile_picture'),
  handleMulterError,
  createEmployee
);
router.get('/:id', protect, getEmployeeById);
router.put(
  '/:id',
  protect,
  upload.single('profile_picture'),
  handleMulterError,
  updateEmployee
);
router.delete('/:id', protect, deleteEmployee);

module.exports = router;
