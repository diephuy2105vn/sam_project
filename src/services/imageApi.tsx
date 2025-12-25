import axiosInstance from "./axios";

const imageApi = {
  // GET /api/projects/{project_id}/images
  getProjectImages: (projectId: string, params = {}, config = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== null && v !== undefined && v !== ""
      )
    );

    return axiosInstance.get(`/api/projects/${projectId}/images`, {
      ...config,
      params: filteredParams,
    });
  },

  // POST /api/projects/{project_id}/upload-images
  uploadImages: (projectId: string, data: FormData, config = {}) => {
    return axiosInstance.post(
      `/api/projects/${projectId}/upload-images`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        ...config,
      }
    );
  },

  // POST /api/projects/{project_id}/upload-videos
  uploadVideos: (projectId: string, data: FormData, config = {}) => {
    return axiosInstance.post(
      `/api/projects/${projectId}/upload-videos`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        ...config,
      }
    );
  },

  // GET /api/images/{image_id}
  getImageFile: (imageId: string, config = {}) => {
    return axiosInstance.get(`/api/images/${imageId}`, {
      ...config,
      responseType: "blob",
    });
  },

  // GET /api/images/{image_id}/info
  getImageInfo: (imageId: string, config = {}) => {
    return axiosInstance.get(`/api/images/${imageId}/info`, {
      ...config,
    });
  },

  // DELETE /api/images/{image_id}
  deleteImage: (imageId: string, config = {}) => {
    return axiosInstance.delete(`/api/images/${imageId}`, {
      ...config,
    });
  },
};

export default imageApi;
