const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Document = require('./Document');

// Associations
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

Task.hasMany(Document, { foreignKey: 'taskId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(Task, { foreignKey: 'taskId' });

const syncDatabase = async () => {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('✅ Database synchronized');

  // Create default admin if not exists
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    await User.create({
      email: 'admin@taskflow.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Default admin created: admin@taskflow.com / Admin@123');
  }
};

module.exports = { sequelize, User, Task, Document, syncDatabase };
