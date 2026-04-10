# Task Management Portal Setup Guide

Build a full-stack **Task Management Portal** where users can register/login, create and manage tasks with priorities and deadlines, and view a dashboard with analytics. This project demonstrates backend API design, authentication, and task management features.

---

# 🚀 Tech Stack / Packages Used

### Core Dependencies

* **express** → Web framework for building APIs
* **mongoose** → MongoDB object modeling
* **dotenv** → Load environment variables from `.env`
* **cors** → Enable cross-origin requests
* **bcryptjs** → Hash passwords securely
* **jsonwebtoken** → Authentication using JWT

---

# 📥 Clone The Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

# 📥 Installation

```bash
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=YOUR_PORT
MONGO_URI=YOUR_MONGODB_CONNECTION_URL
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN=YOUR_TOKEN_EXPIRATION
```

---

# 🔑 Environment Variables Explained

### PORT

The port where your server will run.

Example:

```
PORT=5000
```

---

### MONGO_URI

Your MongoDB connection string.

Example:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

---

### JWT_SECRET

Secret key used to sign JWT tokens.

Example:

```
JWT_SECRET=your_super_secure_random_string
```


---

### JWT_EXPIRES_IN


Token expiration time.


Examples:

```
JWT_EXPIRES_IN=7d
JWT_EXPIRES_IN=1h
JWT_EXPIRES_IN=30m
```

---

# ▶️ Run the Server

```bash
npm start
```

or

```bash
node server.js
```

---

# 🛡️ Security Notes

* Never commit `.env` file to GitHub
* Add `.env` to `.gitignore`
* Keep `JWT_SECRET` private
* Use different environment variables for development and production

---

# 📁 Recommended Project Structure

```
/controllers
/models
/routes
/middleware
/config
/utils
server.js
```

---

# 🔐 Auth API Endpoints

## Base Route

```
/api/auth
```

---

## 1. Login

### Endpoint

```
POST /api/auth/login
```

### Request Body

```json
{
  "email": "johndoe@gmail.com",
  "password": "hksnEU38N8#(#2KE1234*$"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "YOUR_JWT_TOKEN",
  "data": {
    "_id": "69c9300111c93955f92744a7",
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "role": "admin",
    "createdAt": "2026-03-29T13:58:25.942Z"
  }
}
```

---

## 2. Register

### Endpoint

```
POST /api/auth/register
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "johndoe@gmail.com",
  "password": "hksnEU38N8#(#2KE1234*$",
  "role": "admin"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "69c9345b11c93955f92744b3",
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "role": "admin"
  }
}
```

---

## 3. Logout

### Endpoint

```
POST /api/auth/logout
```

### Headers

```
Authorization: Bearer <token>
```

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully",
  "note": "Client should remove the token (JWT is stateless)"
}
```

---

# 📋 Task API Endpoints

## Base Route

```
/api/tasks
```

All task APIs require authentication.

```
Authorization: Bearer <token>
```

---

# 📥 Get All Tasks

### Endpoint

```
GET /api/tasks
```

### Description

Fetch all tasks created by the logged-in user with **pagination support**.

### Success Response

```json
{
  "success": true,
  "tasks": [
    {
      "_id": "69cb6d5f4001c5ce41173aca",
      "title": "Database Storing Issue",
      "description": "database storing issue",
      "priority": "medium",
      "status": "in-progress",
      "deadline": "2026-04-23T00:00:00.000Z",
      "createdBy": "69ca5bed91111142085c0bc3",
      "createdAt": "2026-03-31T06:44:47.797Z",
      "updatedAt": "2026-03-31T06:44:47.797Z",
      "isOverdue": false
    }
  ],
  "totalCount": 26,
  "currentPage": 1,
  "totalPages": 3
}
```

---

# ➕ Create Task

### Endpoint

```
POST /api/tasks
```

### Request Body

```json
{
  "title": "Database API Connection Issue URI",
  "description": "database api connection issue uri environments",
  "priority": "medium",
  "status": "todo",
  "deadline": "2026-04-26"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "title": "Database API Connection Issue URI",
    "description": "database api connection issue uri environments",
    "priority": "medium",
    "status": "todo",
    "deadline": "2026-04-26T00:00:00.000Z",
    "createdBy": "69ca71a144b1951011cc3289",
    "createdAt": "2026-03-31T06:54:28.806Z",
    "updatedAt": "2026-03-31T06:54:28.806Z",
    "isOverdue": false
  }
}
```

---

# 📊 Get Task Statistics

### Endpoint

```
GET /api/tasks/stats
```

### Headers

```
Authorization: Bearer <token>
```

### Success Response

```json
{
  "success": true,
  "stats": {
    "totalTasks": 15,
    "completedTasks": 6,
    "inProgressTasks": 4,
    "todoTasks": 5,
    "overdueTasks": 0,
    "completionPercentage": 40,
    "tasksByPriority": {
      "low": 3,
      "medium": 7,
      "high": 5
    }
  }
}
```

---

# 🔎 Get Task By ID

### Endpoint

```
GET /api/tasks/:id
```

Example

```
GET /api/tasks/69d899272266d05ccc94f358
```

### Success Response

```json
{
  "success": true,
  "task": {
    "_id": "69d899272266d05ccc94f358",
    "title": "Web Design",
    "description": "web design improving",
    "priority": "medium",
    "status": "todo",
    "deadline": "2026-04-11T00:00:00.000Z",
    "createdBy": {
      "_id": "69d5e2cb5484e7a38b76ae5a",
      "name": "John Doe",
      "email": "johndoe@gmail.com"
    },
    "createdAt": "2026-04-10T06:31:03.982Z",
    "updatedAt": "2026-04-10T06:35:31.492Z",
    "isOverdue": false,
    "id": "69d899272266d05ccc94f358"
  }
}
```

---

# ✏️ Update Task

### Endpoint

```
PUT /api/tasks/:id
```

Example

```
PUT /api/tasks/69d899272266d05ccc94f358
```

### Request Body

```json
{
  "title": "Web Design",
  "description": "web design improving",
  "priority": "medium",
  "status": "todo",
  "deadline": "2026-04-11T00:00:00.000Z"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "_id": "69d899272266d05ccc94f358",
    "title": "Web Design",
    "description": "web design improving",
    "priority": "medium",
    "status": "todo",
    "deadline": "2026-04-11T00:00:00.000Z"
  }
}
```

---

# ❌ Delete Task

### Endpoint

```
DELETE /api/tasks/:id
```

Example

```
DELETE /api/tasks/69d38b0adf9df9dc8e20fb39
```

### Success Response

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

# 💡 Notes

* All APIs include **validation and proper error handling**
* JWT authentication is required for all task routes
* Use **Postman or Thunder Client** to test APIs
* MongoDB Atlas recommended for production

---

# 🧑‍💻 Author

Saran Raj.R
