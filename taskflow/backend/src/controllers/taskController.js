const { Task, User, Document } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const taskIncludes = [
  { model: User, as: 'creator', attributes: ['id', 'email', 'role'] },
  { model: User, as: 'assignee', attributes: ['id', 'email', 'role'] },
  { model: Document, as: 'documents' },
];

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks (filtered, sorted, paginated)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in_progress, completed, cancelled] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: dueDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of tasks
 */
const getTasks = async (req, res) => {
  try {
    const {
      page = 1, limit = 10,
      status, priority, dueDate, assignedTo,
      sortBy = 'createdAt', sortOrder = 'DESC',
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Non-admin users see only their tasks
    if (req.user.role !== 'admin') {
      where[Op.or] = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    if (dueDate) where.dueDate = { [Op.lte]: new Date(dueDate) };

    const validSortFields = ['title', 'status', 'priority', 'dueDate', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: taskIncludes,
      limit: parseInt(limit),
      offset,
      order: [[orderField, sortOrder.toUpperCase()]],
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        tasks: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: taskIncludes });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Check access
    if (req.user.role !== 'admin' && task.createdBy !== req.user.id && task.assignedTo !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               priority: { type: string }
 *               dueDate: { type: string, format: date }
 *               assignedTo: { type: string, format: uuid }
 *               documents:
 *                 type: array
 *                 items: { type: string, format: binary }
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const docs = req.files.map((file) => ({
        taskId: task.id,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedBy: req.user.id,
      }));
      await Document.bulkCreate(docs);
    }

    const fullTask = await Task.findByPk(task.id, { include: taskIncludes });
    res.status(201).json({ success: true, message: 'Task created', data: { task: fullTask } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only task creator or admin can update' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    await task.update({ title, description, status, priority, dueDate, assignedTo });

    // Handle new file uploads (check total <= 3)
    if (req.files && req.files.length > 0) {
      const existingDocs = await Document.count({ where: { taskId: task.id } });
      if (existingDocs + req.files.length > 3) {
        // Clean up uploaded files
        req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
        return res.status(400).json({ success: false, message: 'Maximum 3 documents per task' });
      }

      const docs = req.files.map((file) => ({
        taskId: task.id,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedBy: req.user.id,
      }));
      await Document.bulkCreate(docs);
    }

    const fullTask = await Task.findByPk(task.id, { include: taskIncludes });
    res.json({ success: true, message: 'Task updated', data: { task: fullTask } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Document, as: 'documents' }],
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Delete associated files
    task.documents.forEach((doc) => {
      if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
    });

    await task.destroy();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/documents/{docId}:
 *   delete:
 *     summary: Delete a document from a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      where: { id: req.params.docId, taskId: req.params.id },
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
    await doc.destroy();
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/documents/{docId}/download:
 *   get:
 *     summary: Download a document
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      where: { id: req.params.docId, taskId: req.params.id },
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (!fs.existsSync(doc.path)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    res.sendFile(path.resolve(doc.path));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, deleteDocument, downloadDocument };
