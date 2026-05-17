const express = require('express');
const router = express.Router();
const {
  getTasks, getTaskById, createTask, updateTask, deleteTask,
  deleteDocument, downloadDocument,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validateTask, validatePagination } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.get('/', authenticate, validatePagination, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, upload.array('documents', 3), validateTask, createTask);
router.put('/:id', authenticate, upload.array('documents', 3), updateTask);
router.delete('/:id', authenticate, deleteTask);

router.get('/:id/documents/:docId/download', authenticate, downloadDocument);
router.delete('/:id/documents/:docId', authenticate, deleteDocument);

module.exports = router;
