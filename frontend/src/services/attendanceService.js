import api from "./api";

export const attendanceService = {
  getAll: async (studentId = null) => {
    const url = studentId ? `/api/attendance?student_id=${studentId}` : "/api/attendance";
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/attendance/${id}`);
    return response.data;
  },

  create: async (attendanceData) => {
    const response = await api.post("/api/attendance", attendanceData);
    return response.data;
  },

  update: async (id, attendanceData) => {
    const response = await api.put(`/api/attendance/${id}`, attendanceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/attendance/${id}`);
    return response.data;
  },
};
