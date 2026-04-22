import api from "./api";

export const registerUser = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/api/auth/profile", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put("/api/auth/change-password", data);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/api/auth/users");
  return response.data;
};

export const adminLogin = async (data) => {
  const response = await api.post("/api/admin/login", data);
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get("/api/admin/dashboard");
  return response.data;
};

export const registerWithInvite = async (data) => {
  const response = await api.post("/api/admin/register-invite", data);
  return response.data;
};

export const verifyInvite = async (token) => {
  const response = await api.get(`/api/admin/verify-invite/${token}`);
  return response.data;
};

export const inviteUser = async (data) => {
  const response = await api.post("/api/admin/invite", data);
  return response.data;
};