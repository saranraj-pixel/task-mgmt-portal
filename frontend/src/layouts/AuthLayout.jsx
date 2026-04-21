import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png";

function AuthLayout({ title, children, footerText, footerLink, footerPath }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4 py-6 sm:py-8">
      <div
        className="w-full max-w-md bg-white shadow-xl rounded-2xl 
                      p-5 sm:p-6 md:p-8 
                      max-h-[95vh] overflow-y-auto"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <img
            src={Logo}
            alt="Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-2 sm:mb-3"
          />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight text-center">
            {title}
          </h2>
        </div>

        {/* Form Content */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        <div className="text-center mt-5 sm:mt-6 text-xs sm:text-sm text-gray-600">
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
