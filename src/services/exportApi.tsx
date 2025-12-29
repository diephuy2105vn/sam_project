import axiosInstance from "./axios";

const exportApi = {
  // GET /api/export/projects/{project_id}/yolov8
  exportProject: (projectId: string, config = {}) => {
    return axiosInstance.get(`/api/export/projects/${projectId}/yolov8`, {
      ...config,
    });
  },
};

export default exportApi;
