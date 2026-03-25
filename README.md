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

## 💡 Notes

* Make sure MongoDB is running or use MongoDB Atlas
* Use tools like Postman or Thunder Client for testing APIs
* Always validate environment variables before starting the server

---

## 🧑‍💻 Author

Saran Raj.R

---

