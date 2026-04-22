import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  registerWithInvite,
  verifyInvite,
} from "../../services/authService";

import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/FormInput";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

function AdminRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  // ✅ Get token from URL
  const token = new URLSearchParams(location.search).get("token");

  // ✅ Load invite details
  useEffect(() => {
    const loadInvite = async () => {
      if (!token) return;

      try {
        const data = await verifyInvite(token);

        setInviteEmail(data.email);
        setValue("email", data.email);
      } catch (err) {
        setServerError("Invalid or expired invitation link", err);
      }
    };

    loadInvite();
  }, [token, setValue]);

  // ❌ Block if no token
  if (!token) {
    return (
      <AuthLayout title="Invalid Link">
        <p className="text-center text-red-500">
          This registration link is invalid or missing invite token.
        </p>
      </AuthLayout>
    );
  }

  // ✅ Submit handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const payload = {
        ...data,
        token,
      };

      const res = await registerWithInvite(payload);

      toast.success(res.message || "Account created successfully");

      // optional: auto-login redirect
      navigate("/admin/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Registration failed. Please try again";

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
      footerPath="/admin/login"
    >
      {serverError && (
        <p className="text-red-500 text-center mb-3">{serverError}</p>
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

        {/* Email (from invite, locked) */}
        <FormInput
          label="Email"
          type="email"
          value={inviteEmail}
          register={register("email", {
            required: "Email is required",
          })}
          error={errors.email}
          disabled={true}
        />

        {/* Password */}
        <FormInput
          label="Password"
          type="password"
          register={register("password", {
            required: "Password required",
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
              message:
                "Password must be 8+ chars with uppercase, lowercase, number & symbol",
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
            required: "Confirm password required",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
          error={errors.confirmPassword}
          isPassword
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default AdminRegister;
