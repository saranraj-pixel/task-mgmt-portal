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
