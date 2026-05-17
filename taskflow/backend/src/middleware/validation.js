const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
];

const validateTask = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title required (max 255 chars)'),
  body('description').optional().isString(),
  body('status').optional().isIn(['todo', 'in_progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isDate().withMessage('Invalid date format'),
  body('assignedTo').optional().isUUID().withMessage('Invalid user ID'),
  handleValidationErrors,
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin, validateTask, validatePagination };
