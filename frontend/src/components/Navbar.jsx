import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-md">
      <div className="flex justify-between items-center p-4 mx-auto">
        {/* Logo */}
        <Link to="/dashboard">
          <h1 className="text-lg font-semibold tracking-wide">Task Portal</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 font-medium">
          <Link to="/dashboard" className="hover:text-indigo-200 transition">
            Dashboard
          </Link>

          <Link to="/tasks" className="hover:text-indigo-200 transition">
            Tasks
          </Link>

          <Link to="/board" className="hover:text-indigo-200 transition">
            Board
          </Link>

          <Link to="/profile" className="hover:text-indigo-200 transition">
            Profile
          </Link>
        </div>

        {/* User Section */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4">
            <span className="font-medium">{user?.name}</span>

            <button
              onClick={logout}
              className="bg-white text-indigo-600 cursor-pointer px-3 py-1 rounded hover:bg-indigo-50 transition"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setMenuOpen(true)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white text-slate-700 shadow-lg transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-400">
          <h2 className="font-semibold pl-2 text-indigo-600">Menu</h2>

          <button
            className="text-2xl cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            <FiX />
          </button>
        </div>

        {/* Menu Links */}
        <div className="flex flex-col gap-6 p-6 font-medium border-b border-gray-400">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-600"
          >
            Dashboard
          </Link>

          <Link
            to="/tasks"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-600"
          >
            Tasks
          </Link>

          <Link
            to="/board"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-600"
          >
            Board
          </Link>

          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-600"
          >
            Profile
          </Link>
        </div>

        {/* User Section */}
        {isAuthenticated && (
          <div className="p-6 ">
            <p className="mb-3 text-slate-600 font-medium">{user?.name}</p>

            <button
              onClick={logout}
              className="w-full bg-indigo-600 text-white cursor-pointer py-2 rounded hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
