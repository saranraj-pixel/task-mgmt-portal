import { NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiList, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // ✅ clears state properly
    navigate("/admin/login"); // ✅ correct redirect
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* LEFT - LOGO */}
        <div className="font-bold text-lg text-gray-800">Admin Panel</div>

        {/* CENTER - NAV */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <FiGrid />
            Dashboard
          </NavLink>

          <NavLink to="/admin/tasks" className={linkClass}>
            <FiList />
            Task Board
          </NavLink>

          <NavLink to="/admin/invite-user" className={linkClass}>
            <FiList />
            Invite User
          </NavLink>
        </div>

        {/* RIGHT - LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <FiLogOut />
          Logout
        </button>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden flex justify-around py-2 border-t">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <FiGrid />
        </NavLink>

        <NavLink to="/admin/tasks" className={linkClass}>
          <FiList />
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center text-red-600"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
