import api from "./api";

export const getTaskStats = async () => {
  const response = await api.get("/api/tasks/stats");
  return response.data;
};

export const getTasks = async (
  page = 1,
  limit = 10,
  search = "",
  priority = "",
  status = "",
) => {
  const response = await api.get("/api/tasks", {
    params: {
      page,
      limit,
      search,
      priority,
      status,
    },
  });

  return response.data;
};
