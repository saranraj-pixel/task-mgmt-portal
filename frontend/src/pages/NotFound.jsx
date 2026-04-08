import React from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4 text-blue-600">
          <FiAlertTriangle size={60} />
        </div>

        <h1 className="text-6xl font-bold text-blue-600 mb-2">404</h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-6">
          Sorry, the page you are looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
