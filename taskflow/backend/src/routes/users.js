const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

router.get('/', authenticate, authorize('admin'), validatePagination, getUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
