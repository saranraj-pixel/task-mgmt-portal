import { useForm } from "react-hook-form";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import AuthLayout from "../layouts/AuthLayout";
import FormInput from "../components/FormInput";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const res = await loginUser(data);

      login(res.token, res.data);

      toast.success("Login successful. Welcome back");

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      footerText="Don't have an account?"
      footerLink="Register"
      footerPath="/register"
    >
      {serverError && (
        <p className="text-red-500 text-center text-md mb-3">{serverError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Email"
          type="email"
          register={register("email", { required: "Email required" })}
          error={errors.email}
        />

        <FormInput
          isPassword
          label="Password"
          type="password"
          register={register("password", { required: "Password required" })}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center cursor-pointer gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader />}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
