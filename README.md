# Task Management Portal Setup Guide

Build a full-stack Task Management Portal where users can register/login, create and manage tasks with priorities and deadlines, and view a dashboard with analytics. This project is designed to evaluate both backend API design and frontend UI skills.

## 🚀 Tech Stack / Packages Used

### Core Dependencies

* **express** → Web framework for building APIs
* **mongoose** → MongoDB object modeling
* **dotenv** → Load environment variables from `.env`
* **cors** → Enable cross-origin requests
* **bcryptjs** → Hash passwords securely
* **jsonwebtoken** → Authentication using JWT

---

## 📥 Clone The Repositiory

```bash
git clone https://github.com/your-username/your-repo-name.git cd your-repo-name
```

---

## 📥 Installation

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=YOUR_PORT
MONGO_URI=YOUR_MONGODB_CONNECTION_URL
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN=YOUR_TOKEN_EXPIRATION
```

---

## 🔑 Environment Variables Explained

### `PORT`

* The port where your server will run
* Example:

  ```
  PORT=5000
  ```

---

### `MONGO_URI`

* Your MongoDB connection string
* Example:

  ```
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
  ```

---

### `JWT_SECRET`

* Secret key used to sign JWT tokens
* Must be **long, random, and secure**
* Example:

  ```
  JWT_SECRET=your_super_secure_random_string
  ```

👉 Generate securely:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### `JWT_EXPIRES_IN`

* Token expiration time
* Examples:

  ```
  JWT_EXPIRES_IN=7d
  JWT_EXPIRES_IN=1h
  JWT_EXPIRES_IN=30m
  ```

---

## ▶️ Run the Server

```bash
npm start
```

or

```bash
node server.js
```

---

## 🛡️ Security Notes

* Never commit `.env` file to GitHub
* Add `.env` to `.gitignore`
* Keep `JWT_SECRET` private
* Use different environment variables for development and production

---

## 📁 Recommended Project Structure

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

## 🔐 Auth API Endpoints

### 📌 Base Route

```
/api/auth
```

---

### 🚀 1. Login

**Endpoint**

```
POST /api/auth/login
```

**Request Body**

```json
{
  "email": "john@gmail.com",
  "password": "hksnEU38N8#(#2KE1234*$"
}
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "YOUR_JWT_TOKEN",
  "data": {
    "_id": "69c9300111c93955f92744a7",
    "name": "John",
    "email": "john@gmail.com",
    "role": "admin",
    "createdAt": "2026-03-29T13:58:25.942Z"
  }
}
```

**Error Responses**

* **404 - User Not Found**

```json
{
  "success": false,
  "message": "User not found"
}
```

* **401 - Invalid Password**

```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

### 📝 2. Register

**Endpoint**

```
POST /api/auth/register
```

**Request Body**

```json
{
  "name": "John",
  "email": "john@gmail.com",
  "password": "hksnEU38N8#(#2KE1234*$",
  "role": "admin"
}
```

**Success Response (201)**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "69c9345b11c93955f92744b3",
    "name": "John",
    "email": "john@gmail.com",
    "role": "admin"
  }
}
```

**Error Response**

* **409 - Email Already Exists**

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 🚪 3. Logout

**Endpoint**

```
POST /api/auth/logout
```

**Headers**

```
Authorization: Bearer <token>
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "note": "Client should remove the token (JWT is stateless)"
}
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

## 💡 Notes

* Make sure MongoDB is running or use MongoDB Atlas
* Use tools like Postman or Thunder Client for testing APIs
* Always validate environment variables before starting the server
* JWT is stateless → logout must be handled on client side

---

## 🧑‍💻 Author

Saran Raj.R

---
