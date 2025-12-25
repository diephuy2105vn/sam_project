import axiosInstance from "./axios";

const projectApi = {
  getProject: (params = {}, config = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== null && v !== undefined && v !== ""
      )
    );

    return axiosInstance.get("/api/projects/", {
      ...config,
      params: filteredParams,
    });
  },

  createProject: (data = {}, config = {}) => {
    return axiosInstance.post("/api/projects/", data, {
      ...config,
    });
  },

  updateProject: (id: string, data = {}, config = {}) => {
    return axiosInstance.put(`/api/projects/${id}`, data, {
      ...config,
    });
  },

  deleteProject: (id: string, config = {}) => {
    return axiosInstance.delete(`/api/projects/${id}`, {
      ...config,
    });
  },
};

export default projectApi;
