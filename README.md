# Task Management Portal 🚀

Task Management Portal is a sophisticated full-stack application designed to streamline task organization and productivity. It provides a premium user experience with drag-and-drop functionality, real-time statistics, and a responsive design that works seamlessly across all devices.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **State Management & Routing:** React Router DOM
- **Data Fetching:** Axios
- **Form Handling:** React Hook Form
- **Icons & UI:** React Icons, React Toastify
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit
- **Utilities:** Date-fns, React Helmet Async
- **Monitoring:** Sentry

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), BcryptJS
- **Validation:** Express-Validator
- **Logging:** Winston
- **Security:** CORS, Dotenv

## ✨ Features

- **Secure Authentication:** Robust sign-up and login system with JWT-based sessions.
- **User Profiles:** Manage personal information and update security settings.
- **Task Management:** Full CRUD operations for tasks with priority and status tracking.
- **Drag & Drop Organization:** Intuitive interface for rearranging tasks using dnd-kit.
- **Advanced Filtering:** Powerful search and filter capabilities by status, priority, and date ranges.
- **Dynamic Dashboard:** Visual representation of task distributions and completion statistics.
- **Responsive UI:** Modern, clean, and mobile-friendly design built with Tailwind CSS.
- **Reliability:** Built-in error handling, logging, and error tracking via Sentry.

## 📋 Prerequisites

- **Node.js:** v18.x or higher
- **npm:** v9.x or higher
- **MongoDB:** v6.x+ (Local instance or MongoDB Atlas)

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
git clone <repository-url>
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the following:
```env
PORT=6000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=YOUR_TOKEN_EXPIRATION
CLIENT_URL=http://localhost:5173
PRODUCTION_CLIENT_URL=https://your-production-app.com
```
Run the backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory and add the following:
```env
VITE_API_URL=http://localhost:5000
VITE_SENTRY_DSN_KEY=https://sentry_dsn_key_url
DEV_PRODUCTION_URL=https://your-production-app.com
```
Run the frontend:
```bash
npm run dev
```

## 🔐 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | The port the server runs on | `6000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/taskmgmt` |
| `JWT_SECRET` | Secret key for JWT encryption | `supersecretkey` |
| `JWT_EXPIRES_IN` | JWT token expiry time out | `1d` |
| `CLIENT_URL` | Frontend URL for CORS (Dev) | `http://localhost:5173` |
| `PRODUCTION_CLIENT_URL` | Frontend URL for CORS (Prod) | `https://tasks.myapp.com` |

### Frontend (`/frontend/.env`)
| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL for backend API calls | `http://localhost:5000` |
| `VITE_SENTRY_DSN_KEY` | Sentry error monitoring url | `https://sentry_dsn_key_url` |
| `DEV_PRODUCTION_URL` | Base URL for backend API calls | `http://hosted_url.com` |

## 📡 API Reference

### Auth Endpoints
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create a new account |
| `POST` | `/api/auth/login` | No | Authenticate user and return token |
| `POST` | `/api/auth/logout` | Yes | Invalidate session |
| `GET` | `/api/auth/me` | Yes | Get current user details |
| `PUT` | `/api/auth/profile` | Yes | Update user profile |
| `PUT` | `/api/auth/change-password` | Yes | Change account password |

### Task Endpoints
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/tasks/` | Yes | Retrieve all tasks for user |
| `POST` | `/api/tasks/` | Yes | Create a new task |
| `GET` | `/api/tasks/stats` | Yes | Get task analytical data |
| `GET` | `/api/tasks/:id` | Yes | Get a single task by ID |
| `PUT` | `/api/tasks/:id` | Yes | Update task details |
| `DELETE` | `/api/tasks/:id` | Yes | Remove a task |

## 📸 Screenshots

### 🖥️ Dashboard
<img width="100%" height="784" alt="Dashboard" src="https://github.com/user-attachments/assets/21c3593b-bda0-4f6b-94e7-2bf01393f300" />


### 📋 Task List
<img width="100%" height="1098" alt="Task List" src="https://github.com/user-attachments/assets/3cf54b4e-9680-4794-af62-2cfb155fb909" />


### 🗂️ Task Board
<img width="100%" height="1029" alt="Task Board" src="https://github.com/user-attachments/assets/68efe261-4f16-4faf-89fb-2a44c7ab7890" />


### 👤 Profile Page
<img width="100%" height="649" alt="Profile" src="https://github.com/user-attachments/assets/bd7c13dc-b584-48aa-ad23-609306b4c9e5" />



## 🔮 Future Enhancements

- **Real-time Updates:** WebSocket integration for instant task updates.
- **Collaborative Workspaces:** Share task lists and boards with team members.
- **Push Notifications:** Reminders for upcoming task deadlines.
- **Theme Support:** Native Dark/Light mode customization.
- **Exporting:** Download task reports in PDF/Excel formats.

## 👤 Author

  Saran Raj.R
