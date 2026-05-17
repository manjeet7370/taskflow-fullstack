# ⚡ TaskFlow — Full-Stack Task Management System

A production-ready task management application built with **React**, **Node.js/Express**, **PostgreSQL**, and **Docker**.

---

## 🚀 Quick Start (Single Command)

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
docker-compose up --build
```

Then open:
- **Frontend:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:5000/api/docs
- **Backend API:** http://localhost:5000/api

**Default Admin Credentials:**
```
Email:    admin@taskflow.com
Password: Admin@123
```

---

## 📋 Features

- ✅ **JWT Authentication** — Register, login, role-based access
- ✅ **CRUD for Users** — Admin can manage all users; users manage themselves
- ✅ **CRUD for Tasks** — Create, update, delete, view tasks with full details
- ✅ **Task Assignment** — Assign tasks to any registered user
- ✅ **Document Uploads** — Attach up to 3 PDF files per task; view/download inline
- ✅ **Filtering & Sorting** — Filter by status, priority; sort by any field
- ✅ **Pagination** — Server-side pagination for both users and tasks
- ✅ **Real-time Updates** — WebSocket-based live task updates
- ✅ **Admin Panel** — Full user management, role assignment
- ✅ **API Documentation** — Swagger UI at `/api/docs`
- ✅ **Automated Tests** — Unit + integration tests with ≥80% coverage
- ✅ **Dockerized** — One-command setup with Docker Compose

---

## 🛠️ Tech Stack

| Layer        | Technology                                      |
|-------------|------------------------------------------------|
| Frontend     | React 18, Redux Toolkit, React Router v6, React Hook Form |
| Backend      | Node.js, Express, Sequelize ORM                 |
| Database     | PostgreSQL 16                                   |
| Auth         | JWT (jsonwebtoken), bcryptjs                    |
| File Upload  | Multer (local storage; swap for S3 easily)      |
| Real-time    | WebSocket (ws library)                          |
| API Docs     | Swagger (swagger-jsdoc + swagger-ui-express)    |
| Testing      | Jest + Supertest (backend), React Testing Library (frontend) |
| Containers   | Docker + Docker Compose                         |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & Swagger config
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # Auth, upload, validation
│   │   ├── models/         # Sequelize models + associations
│   │   ├── routes/         # Express routers
│   │   └── tests/          # Jest + Supertest tests
│   ├── uploads/            # PDF file storage
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks (WebSocket)
│   │   ├── pages/          # Route-level page components
│   │   ├── services/       # Axios API service layer
│   │   ├── store/          # Redux store + slices
│   │   └── tests/          # Unit tests for slices
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your local DB credentials
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

---

## 🔌 API Endpoints

Full interactive docs available at **http://localhost:5000/api/docs**

### Authentication
| Method | Endpoint              | Description        | Auth |
|--------|-----------------------|--------------------|------|
| POST   | /api/auth/register    | Register new user  | ❌   |
| POST   | /api/auth/login       | Login              | ❌   |
| GET    | /api/auth/me          | Get current user   | ✅   |

### Users (Admin Only for list/delete)
| Method | Endpoint        | Description      | Auth  |
|--------|-----------------|------------------|-------|
| GET    | /api/users      | List all users   | Admin |
| GET    | /api/users/:id  | Get user by ID   | ✅    |
| PUT    | /api/users/:id  | Update user      | ✅    |
| DELETE | /api/users/:id  | Delete user      | Admin |

### Tasks
| Method | Endpoint                                   | Description             | Auth |
|--------|--------------------------------------------|-------------------------|------|
| GET    | /api/tasks                                 | List tasks (filtered)   | ✅   |
| POST   | /api/tasks                                 | Create task (+ PDF)     | ✅   |
| GET    | /api/tasks/:id                             | Get task details        | ✅   |
| PUT    | /api/tasks/:id                             | Update task             | ✅   |
| DELETE | /api/tasks/:id                             | Delete task             | ✅   |
| GET    | /api/tasks/:id/documents/:docId/download   | View/download PDF       | ✅   |
| DELETE | /api/tasks/:id/documents/:docId            | Remove document         | ✅   |

### Query Parameters (GET /api/tasks)
```
?status=todo|in_progress|completed|cancelled
&priority=low|medium|high|urgent
&assignedTo=<userId>
&sortBy=createdAt|dueDate|priority|title
&sortOrder=ASC|DESC
&page=1&limit=10
&search=keyword
```

---

## 🗄️ Database Schema

### Users
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       VARCHAR UNIQUE NOT NULL
password    VARCHAR NOT NULL (bcrypt hashed)
role        ENUM('user', 'admin') DEFAULT 'user'
isActive    BOOLEAN DEFAULT true
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### Tasks
```sql
id          UUID PRIMARY KEY
title       VARCHAR(255) NOT NULL
description TEXT
status      ENUM('todo','in_progress','completed','cancelled') DEFAULT 'todo'
priority    ENUM('low','medium','high','urgent') DEFAULT 'medium'
dueDate     DATE
assignedTo  UUID REFERENCES users(id)
createdBy   UUID REFERENCES users(id) NOT NULL
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### Documents
```sql
id           UUID PRIMARY KEY
taskId       UUID REFERENCES tasks(id) ON DELETE CASCADE
filename     VARCHAR (stored name on disk)
originalName VARCHAR (user's original filename)
mimeType     VARCHAR
size         INTEGER (bytes)
path         VARCHAR (local path / S3 key)
uploadedBy   UUID REFERENCES users(id)
createdAt    TIMESTAMP
```

---

## 🧪 Running Tests

### Backend
```bash
cd backend
npm test
# With coverage report:
npm test -- --coverage
```

### Frontend
```bash
cd frontend
npm test
```

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens expire in **7 days** (configurable)
- **Helmet.js** sets secure HTTP headers
- **Rate limiting** — 100 requests per 15 minutes per IP
- CORS restricted to frontend origin
- Only **PDF files** accepted for uploads (MIME type validated)
- File size limit: **10MB** per file, max **3 files** per task
- Users can only access their own tasks (unless admin)

---

## 🌐 Real-time WebSocket

The app connects to a WebSocket server on the same port as the REST API. When tasks are updated, all connected clients receive a `task:updated` event and the UI refreshes automatically — no polling needed.

---

## 🐳 Docker Details

```yaml
Services:
  postgres   → Port 5432 (PostgreSQL 16)
  backend    → Port 5000 (Node.js Express)
  frontend   → Port 3000 (Nginx serving React build)
```

### Useful commands
```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
NODE_ENV=development
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=taskflow
DB_USER=taskflow_user
DB_PASSWORD=taskflow_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760    # 10MB in bytes
UPLOAD_DIR=uploads
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

---

## 🚀 Deployment

### Cloud Deployment Options

#### Heroku
```bash
heroku create taskflow-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your_secret NODE_ENV=production
git push heroku main
```

#### Render / Railway
- Connect your GitHub repo
- Set environment variables in dashboard
- Both services auto-detect Docker Compose

#### AWS / DigitalOcean
- Push images to ECR / Container Registry
- Deploy with ECS / App Platform
- Use RDS / Managed PostgreSQL for database

---

## 📝 Design Decisions

1. **Sequelize ORM** — Chosen for its mature PostgreSQL support, easy migration system, and readable associations. Switching to raw SQL or another ORM is straightforward.

2. **Redux Toolkit** — Reduces boilerplate vs vanilla Redux. `createAsyncThunk` handles loading/error states cleanly.

3. **Local file storage** — Files are stored on disk for simplicity. To switch to S3, replace Multer's `diskStorage` with `multer-s3`, update the `path` field in Document model to store S3 keys, and update the download endpoint to generate signed URLs.

4. **WebSocket on same port** — The WS server shares the HTTP server port to avoid CORS complexity and reduce infrastructure requirements.

5. **JWT in localStorage** — Used for simplicity in this assignment context. For production, consider `httpOnly` cookies to prevent XSS.

---

## 👨‍💻 Author

Built for PanScience Innovations FSD Intern Assignment.
