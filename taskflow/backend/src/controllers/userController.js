const { User, Task } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: List of users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.email = { [Op.iLike]: `%${search}%` };
    if (role) where.role = role;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['password'] },
    });

    res.json({
      success: true,
      data: {
        users: rows,
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin or self)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can update any user; regular users can only update themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { email, password, role, isActive } = req.body;
    const updates = {};

    if (email) updates.email = email;
    if (password) updates.password = password;
    if (role && req.user.role === 'admin') updates.role = role;
    if (isActive !== undefined && req.user.role === 'admin') updates.isActive = isActive;

    await user.update(updates);
    res.json({ success: true, message: 'User updated', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
