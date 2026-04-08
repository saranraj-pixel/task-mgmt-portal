import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
