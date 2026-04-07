import { Link } from "react-router-dom";

function AuthLayout({ title, children, footerText, footerLink, footerPath }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>

        {children}

        <div className="text-center mt-6 text-sm">
          {footerText}
          <Link to={footerPath} className="text-blue-600 ml-1 hover:underline">
            {footerLink}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
