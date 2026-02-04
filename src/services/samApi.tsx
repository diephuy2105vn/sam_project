import axiosInstance from "./axios";

const samApi = {
  // POST /api/sam/text-prompt
  labelWithTextPrompt: (data = {}, config = {}) => {
    return axiosInstance.post("/api/sam/text-prompt", data, {
      ...config,
    });
  },

  // POST /api/sam/point-prompt
  labelWithPointPrompt: (data = {}, config = {}) => {
    return axiosInstance.post("/api/sam/point-prompt", data, {
      ...config,
    });
  },

  // GET /api/sam/images/{image_id}/annotations
  getImageAnnotations: (imageId: string, config = {}) => {
    return axiosInstance.get(`/api/sam/images/${imageId}/annotations`, {
      ...config,
    });
  },

  // GET /api/sam/projects/{project_id}/annotations
  getProjectAnnotations: (projectId: string, config = {}) => {
    return axiosInstance.get(`/api/sam/projects/${projectId}/annotations`, {
      ...config,
    });
  },

  // DELETE /api/sam/annotations/{annotation_id}
  deleteAnnotation: (annotationId: string, config = {}) => {
    return axiosInstance.delete(`/api/sam/annotations/${annotationId}`, {
      ...config,
    });
  },

  createAnnotation: (data = {}, config = {}) => {
    return axiosInstance.post("/api/sam/annotation", data, {
      ...config,
    });
  },

  updateAnnotation: (annotationId: string, data = {}, config = {}) => {
    return axiosInstance.put(`/api/sam/annotation/${annotationId}`, data, {
      ...config,
    });
  },
};

export default samApi;
