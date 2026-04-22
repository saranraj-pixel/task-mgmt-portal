import { Navigate } from "react-router-dom";

const AdminRegisterRoute = ({ children }) => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // Only allow if token exists
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRegisterRoute;