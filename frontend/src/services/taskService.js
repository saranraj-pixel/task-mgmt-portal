import api from "./api";

export const getTaskStats = async () => {
  const response = await api.get("/api/tasks/stats");
  return response.data;
};
