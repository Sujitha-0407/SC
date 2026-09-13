import api from "./api";

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/api/auth/login", { username, password });
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await api.post("/api/auth/register", { username, email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateMe: async (data) => {
    const response = await api.put("/api/auth/me", data);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/api/users");
    return response.data;
  },

  testAdminAccess: async () => {
    const response = await api.get("/api/auth/admin-test");
    return response.data;
  },
};
