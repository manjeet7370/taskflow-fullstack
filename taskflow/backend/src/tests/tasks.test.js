const request = require('supertest');
const { app } = require('../server');
const { User, Task, sequelize } = require('../models');

let userToken, adminToken, userId, adminId, taskId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create regular user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@example.com', password: 'User@123' });
  userToken = userRes.body.data.token;
  userId = userRes.body.data.user.id;

  // Create admin user directly
  const admin = await User.create({ email: 'admin@example.com', password: 'Admin@123', role: 'admin' });
  adminId = admin.id;
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Admin@123' });
  adminToken = adminLogin.body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Tasks API', () => {
  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Task', priority: 'high', status: 'todo' });

      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe('Test Task');
      taskId = res.body.data.task.id;
    });

    it('should reject task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 'high' });

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauth Task' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return user tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      res.body.data.tasks.forEach((t) => expect(t.status).toBe('todo'));
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by id', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.task.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .get('/api/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Task', status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('in_progress');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
