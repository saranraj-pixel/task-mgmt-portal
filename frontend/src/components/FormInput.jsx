import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function FormInput({ label, type, register, error, isPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">{label}</label>

      <div className="relative">
        <input
          type={inputType}
          {...register}
          className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

export default FormInput;
