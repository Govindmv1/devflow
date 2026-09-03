# 🚀 DevFlow

### AI-Powered Project Management for Modern Teams

> **Plan smarter. Collaborate better. Ship faster.**

DevFlow is a modern, full-stack project management platform designed to help teams organize projects, manage tasks, collaborate in real time, track progress, and leverage AI to turn ideas into actionable work.

Built with **React, TypeScript, Node.js, Express, PostgreSQL/MySQL, and OpenAI**, DevFlow combines a powerful backend with a sleek, responsive interface.

---

## ✨ Why DevFlow?

Managing projects shouldn't mean jumping between multiple tools.

DevFlow brings **projects, tasks, teams, analytics, collaboration, and AI assistance** into one unified workspace.

### 🎯 Everything your team needs

* 📁 **Project Management** — Create, organize, and track multiple projects
* 📋 **Kanban Boards** — Manage tasks with intuitive drag-and-drop workflows
* 🤖 **AI Assistant** — Generate descriptions, subtasks, and project summaries
* 📊 **Analytics Dashboard** — Monitor KPIs, progress, activity, and overdue work
* 👥 **Team Collaboration** — Manage members, roles, comments, and notifications
* 🔐 **Secure Authentication** — JWT-based authentication with role-based access
* 🌙 **Modern Dark UI** — Clean, responsive, enterprise-inspired interface
* ⚡ **Fast & Scalable** — Modern frontend and structured backend architecture

---

## 🌟 Features

### 📌 Project & Task Management

* Multi-project workspace
* Project lifecycle tracking
* Drag-and-drop Kanban board
* Task assignment
* Priority management
* Due-date tracking
* Estimated hours
* Color-coded tags
* Task comments
* Task filtering

### 🤖 AI-Powered Assistant

Turn a simple task title into meaningful, actionable work.

**AI capabilities include:**

* ✨ Automatic task description generation
* 🧩 Smart subtask breakdown
* 📈 AI-generated project summaries
* 🟢 AI service status monitoring
* 🛡️ Graceful fallback when no API key is configured

> AI features are optional — DevFlow remains fully usable without an OpenAI API key.

### 📊 Analytics Dashboard

Get a quick overview of your team's productivity.

* Active projects
* Assigned tasks
* Pending tasks
* Overdue tasks
* Sprint completion percentage
* Team activity feed
* User session information

### 🔐 Authentication & Security

Security is built into the backend from the ground up.

* JWT access & refresh tokens
* HTTP-only cookie support
* bcrypt password hashing
* Role-based access control
* API rate limiting
* Helmet security headers
* Zod request validation
* Protected API routes

**Supported roles:**

`ADMIN` · `PROJECT_MANAGER` · `DEVELOPER` · `VIEWER`

### 👥 Team Collaboration

* Project member management
* Role-based project permissions
* User profiles
* Avatar support
* Task comments
* Activity tracking
* In-app notifications

### 🎨 Modern UI/UX

* 🌙 Dark-mode-first design
* 📱 Fully responsive layout
* 🎬 Smooth micro-animations
* 💀 Skeleton loading states
* 🔔 Toast notifications
* ✨ Modern typography
* 🧭 Responsive sidebar navigation

---

# 🛠️ Tech Stack

## Frontend

| Technology             | Purpose                         |
| ---------------------- | ------------------------------- |
| ⚛️ **React 19**        | UI framework                    |
| 🔷 **TypeScript**      | Type-safe development           |
| ⚡ **Vite 8**           | Build tool & development server |
| 🎨 **Tailwind CSS 4**  | Styling                         |
| 🧭 **React Router v7** | Client-side routing             |
| 🐻 **Zustand**         | State management                |
| 🖱️ **@dnd-kit**       | Drag-and-drop interactions      |
| 📊 **Recharts**        | Data visualization              |
| 🎯 **Lucide React**    | Icon library                    |
| 🌐 **Axios**           | HTTP client                     |
| 📅 **date-fns**        | Date utilities                  |

## Backend

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| 🟢 **Node.js**    | Runtime                        |
| 🚂 **Express 4**  | REST API framework             |
| 🔷 **TypeScript** | Type-safe server logic         |
| 🗄️ **Knex.js**   | SQL query builder & migrations |
| 🐘 **PostgreSQL** | Relational database            |
| 🐬 **MySQL**      | Alternative database support   |
| 🔑 **JWT**        | Authentication                 |
| 🔐 **bcryptjs**   | Password hashing               |
| ✅ **Zod**         | Runtime validation             |
| 🛡️ **Helmet**    | HTTP security                  |
| 📝 **Morgan**     | Request logging                |
| 🤖 **OpenAI API** | AI capabilities                |

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      BROWSER        │
                         │                     │
                         │ React 19            │
                         │ Zustand             │
                         │ React Router        │
                         │ Tailwind CSS        │
                         └──────────┬──────────┘
                                    │
                              REST API / HTTP
                                    │
                         ┌──────────▼──────────┐
                         │    EXPRESS API      │
                         │                     │
                         │ Authentication      │
                         │ Projects            │
                         │ Tasks               │
                         │ Comments            │
                         │ Notifications       │
                         │ Analytics           │
                         │ AI                  │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │ SERVICE / REPOSITORY│
                         │       LAYER         │
                         └──────────┬──────────┘
                                    │
                              Knex.js / SQL
                                    │
                    ┌───────────────▼───────────────┐
                    │          DATABASE             │
                    │                               │
                    │ PostgreSQL / MySQL             │
                    │ Users • Projects • Tasks       │
                    │ Comments • Activity • Tags     │
                    │ Notifications                  │
                    └───────────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    OpenAI API       │
                         │     (Optional)      │
                         └─────────────────────┘
```

---

# 📁 Project Structure

```text
devflow/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── integrations/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── migrate.ts
│   │   └── seed.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* **Node.js ≥ 18**
* **npm ≥ 9**
* **PostgreSQL ≥ 14** or **MySQL 8+**

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Govindmv1/devflow.git
cd devflow
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Configure your `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=devflow
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

OPENAI_API_KEY=

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE devflow;"
```

Run migrations:

```bash
npm run migrate
```

Optional sample data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 4️⃣ Verify the API

```bash
curl http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "DevFlow API is running"
}
```

---

# 📡 API Overview

### Authentication

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Register user        |
| POST   | `/auth/login`    | Login                |
| POST   | `/auth/refresh`  | Refresh access token |
| POST   | `/auth/logout`   | Logout               |

### Projects

| Method | Endpoint                        | Description    |
| ------ | ------------------------------- | -------------- |
| GET    | `/projects`                     | List projects  |
| POST   | `/projects`                     | Create project |
| GET    | `/projects/:id`                 | Get project    |
| PUT    | `/projects/:id`                 | Update project |
| DELETE | `/projects/:id`                 | Delete project |
| POST   | `/projects/:id/members`         | Add member     |
| DELETE | `/projects/:id/members/:userId` | Remove member  |

### Tasks

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | `/tasks`            | List tasks         |
| POST   | `/tasks`            | Create task        |
| GET    | `/tasks/:id`        | Get task           |
| PUT    | `/tasks/:id`        | Update task        |
| PATCH  | `/tasks/:id/status` | Change task status |
| DELETE | `/tasks/:id`        | Delete task        |

### AI

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| POST   | `/ai/generate-description` | Generate task description |
| POST   | `/ai/generate-subtasks`    | Generate subtasks         |
| POST   | `/ai/project-summary`      | Generate project summary  |
| GET    | `/ai/status`               | Check AI status           |

### Analytics

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/analytics/dashboard` | Dashboard statistics |

> 🔐 All endpoints except registration, login, and health check require JWT authentication.

---

# 🗄️ Database

DevFlow uses a relational database architecture supporting **PostgreSQL and MySQL**.

Core entities include:

```text
Users
  │
  ├── Projects
  │      │
  │      ├── Project Members
  │      ├── Tasks
  │      │     ├── Tags
  │      │     └── Comments
  │      │
  │      └── Activity Logs
  │
  └── Notifications
```

---

# 🧪 Available Scripts

## Backend

| Command                    | Description         |
| -------------------------- | ------------------- |
| `npm run dev`              | Development server  |
| `npm run build`            | Build TypeScript    |
| `npm start`                | Production server   |
| `npm run migrate`          | Run migrations      |
| `npm run migrate:rollback` | Rollback migrations |
| `npm run seed`             | Seed database       |
| `npm test`                 | Run tests           |
| `npm run lint`             | Run ESLint          |

## Frontend

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite server        |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |

---

# 🔧 Environment Variables

| Variable                  | Required | Default                 |
| ------------------------- | -------- | ----------------------- |
| `PORT`                    | ❌        | `5000`                  |
| `NODE_ENV`                | ❌        | `development`           |
| `DB_HOST`                 | ✅        | `localhost`             |
| `DB_PORT`                 | ✅        | `5432`                  |
| `DB_NAME`                 | ✅        | `devflow`               |
| `DB_USER`                 | ✅        | `postgres`              |
| `DB_PASSWORD`             | ✅        | —                       |
| `JWT_SECRET`              | ✅        | —                       |
| `JWT_REFRESH_SECRET`      | ✅        | —                       |
| `JWT_EXPIRES_IN`          | ❌        | `15m`                   |
| `JWT_REFRESH_EXPIRES_IN`  | ❌        | `7d`                    |
| `OPENAI_API_KEY`          | ❌        | —                       |
| `CORS_ORIGIN`             | ❌        | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS`    | ❌        | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS` | ❌        | `100`                   |

---

# 🛡️ Security

DevFlow follows several backend security practices:

* 🔐 JWT authentication
* 🔑 Secure password hashing
* 🍪 HTTP-only refresh-token cookies
* 👮 Role-based authorization
* 🛡️ Helmet security headers
* 🚦 Rate limiting
* ✅ Request validation with Zod
* 🚫 Protected API routes

> Never commit your `.env` file or production secrets to GitHub.

---

# 🤝 Contributing

Contributions are welcome!

### 1. Fork the repository

### 2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

### 4. Push your branch

```bash
git push origin feature/amazing-feature
```

### 5. Open a Pull Request

---

# 📄 License

This project is licensed under the **ISC License**.

See the `LICENSE` file for details.

---

## 👨‍💻 Built with ❤️

**DevFlow Team**

> Enterprise Project Management • AI-Powered Workflows • Built for Scale

⭐ **If you find DevFlow useful, consider giving the repository a star!**
