import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskBoard from "./pages/TaskBoard";
import Profile from "./pages/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <ToastContainer theme="colored" />

      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* User Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/board" element={<TaskBoard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
