import { useForm } from "react-hook-form";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import AuthLayout from "../layouts/AuthLayout";
import FormInput from "../components/FormInput";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const res = await registerUser(data);

      // store token
      localStorage.setItem("token", res.token);

      toast.success("Account created successfully");

      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again";

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      footerText="Already have an account?"
      footerLink="Login"
      footerPath="/login"
    >
      {serverError && (
        <p className="text-red-500 text-center text-md mb-3">{serverError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <FormInput
          label="Name"
          type="text"
          register={register("name", {
            required: "Name is required",
          })}
          error={errors.name}
        />

        {/* Email */}
        <FormInput
          label="Email"
          type="email"
          register={register("email", {
            required: "Email required",
            pattern: {
              value: /^\S+@\S+$/,
              message: "Invalid email",
            },
          })}
          error={errors.email}
        />

        {/* Password */}
        <FormInput
          label="Password"
          type="password"
          register={register("password", {
            required: "Password required",
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
              message:
                "Password must be 8+ characters with uppercase, lowercase, number, and symbol",
            },
          })}
          error={errors.password}
          isPassword
        />

        {/* Confirm Password */}
        <FormInput
          label="Confirm Password"
          type="password"
          register={register("confirmPassword", {
            required: "Confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          error={errors.confirmPassword}
          isPassword
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center cursor-pointer gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Spinner />}
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
