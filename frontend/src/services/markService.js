import api from "./api";

export const markService = {
  getAll: async (studentId = null) => {
    const url = studentId ? `/api/marks?student_id=${studentId}` : "/api/marks";
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/marks/${id}`);
    return response.data;
  },

  create: async (markData) => {
    const response = await api.post("/api/marks", markData);
    return response.data;
  },

  update: async (id, markData) => {
    const response = await api.put(`/api/marks/${id}`, markData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/marks/${id}`);
    return response.data;
  },
};
