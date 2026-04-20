import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/authService";
import { toast } from "react-toastify";
import { FiEdit2, FiLock } from "react-icons/fi";
import FormInput from "../components/FormInput";
import Skeleton from "../components/Skeleton";
import { Helmet } from "react-helmet-async";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      setUser(res.data);

      reset({
        name: res.data.name,
      });
    } catch (error) {
      toast.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile
  const onProfileUpdate = async (data) => {
    try {
      const res = await updateProfile({ name: data.name });

      setUser(res.data);
      setEditMode(false);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  // Change password
  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword(data);

      toast.success("Password updated successfully");

      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="bg-gray-200 rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-gray-300" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/3 bg-gray-300" />
            <Skeleton className="h-4 w-1/2 bg-gray-300" />
            <Skeleton className="h-3 w-1/4 bg-gray-300" />
          </div>
        </div>

        {/* Security Section Skeleton */}
        <div className="bg-white shadow rounded-xl p-6 mt-10 space-y-6">
          <Skeleton className="h-6 w-40 bg-gray-200" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-100" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
        <title> Profile | Task Manager</title>
        <meta
          name="description"
          content="Overview of your profile page you can edit name and change password none editable email "
        />
      </Helmet>
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
      {/* Profile Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white flex items-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
        {/* Avatar */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-white text-blue-600 flex items-center justify-center text-lg sm:text-2xl font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl mb-3 font-semibold flex items-center gap-2 sm:gap-3 flex-wrap">
            {user?.name}

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 cursor-pointer px-2 sm:px-3 py-1 rounded-md flex items-center gap-1"
              >
                <FiEdit2 size={14} /> Edit
              </button>
            )}
          </h2>

          <p className="text-xs sm:text-sm opacity-90 flex items-center gap-1 break-all">
            {user?.email} <FiLock size={14} />
          </p>

          <p className="text-xs opacity-80 mt-1 flex gap-1 flex-wrap">
            Member since
            <span>
              {new Date(user?.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </span>
          </p>
        </div>
      </div>

      {/* Edit Profile */}
      {editMode && (
        <div>
          <form
            onSubmit={handleSubmit(onProfileUpdate)}
            className="flex flex-col gap-3"
          >
            <div className="flex-1 mt-5">
              <FormInput
                label="Name"
                type="text"
                register={register("name", {
                  required: "Name is required",
                })}
                error={errors.name}
              />
            </div>

            <div className="flex gap-2 justify-end items-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer px-5 py-2 rounded-md">
                Save
              </button>

              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="border px-5 py-2 rounded-md cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-6">Security Settings</h3>

        <form
          onSubmit={handlePasswordSubmit(onPasswordChange)}
          className="grid md:grid-cols-2 gap-4"
        >
          <FormInput
            label="Old Password"
            type="password"
            isPassword
            register={registerPassword("oldPassword", {
              required: "Old password is required",
            })}
            error={passwordErrors.oldPassword}
          />

          <FormInput
            label="New Password"
            type="password"
            isPassword
            register={registerPassword("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={passwordErrors.newPassword}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            isPassword
            register={registerPassword("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === watch("newPassword") || "Passwords do not match",
            })}
            error={passwordErrors.confirmPassword}
          />

          <div className="md:col-span-2 flex justify-end pt-3">
            <button
              disabled={passwordLoading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold cursor-pointer px-4 py-3 rounded-md shadow"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>

  );
};

export default Profile;
