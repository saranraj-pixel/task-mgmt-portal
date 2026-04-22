import { NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiList, FiLogOut, FiUserPlus, FiMenu } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Logo from "../assets/Logo.png";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* LEFT - LOGO */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center text-white font-bold">
            <img src={Logo} alt="" className="w-10" />
          </div>
          <span className="text-gray-800 text-lg font-bold hidden sm:block">
            Admin Panel
          </span>
        </div>

        {/* CENTER - NAV (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <FiGrid size={16} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/tasks" className={linkClass}>
            <FiList size={16} />
            Tasks
          </NavLink>

          <NavLink to="/admin/invite-user" className={linkClass}>
            <FiUserPlus size={16} />
            Invite
          </NavLink>
        </nav>

        {/* RIGHT - ACTIONS */}
        <div className="flex items-center gap-2">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-300 transition"
          >
            <FiLogOut size={16} />
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div className="pt-3 md:hidden px-4 pb-4 space-y-2 border-t bg-white">
          <NavLink
            to="/admin/dashboard"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            <FiGrid />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/tasks"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            <FiList />
            Tasks
          </NavLink>

          <NavLink
            to="/admin/invite-user"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            <FiUserPlus />
            Invite User
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-300"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
