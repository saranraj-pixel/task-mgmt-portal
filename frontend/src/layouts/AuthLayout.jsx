import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png";

function AuthLayout({ title, children, footerText, footerLink, footerPath }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={Logo}
            alt="Logo"
            className="w-16 h-16 object-contain mb-3"
          />
          <h2 className="text-2xl cursor-default font-semibold text-gray-800 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Form Content */}
        {children}

        {/* Footer */}
        <div className="text-center mt-6 text-sm cursor-default text-gray-600">
          {footerText}
          <Link
            to={footerPath}
            className="text-blue-600 ml-1 font-medium hover:underline"
          >
            {footerLink}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
