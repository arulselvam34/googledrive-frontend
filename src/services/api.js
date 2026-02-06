import apiClient from './apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  
  verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
  
  login: (data) => apiClient.post('/auth/login', data),
  
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  
  resetPassword: (data) => apiClient.post('/auth/reset-password', data)
};

export const fileService = {
  getFiles: (folderId, view = 'home') => {
    const params = {};
    if (folderId) params.folderId = folderId;
    if (view) params.view = view;
    return apiClient.get('/files', { params });
  },
  
  createFolder: (data) => apiClient.post('/files/folder', data),
  
  uploadFile: (formData) => 
    apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  downloadFile: (fileId) => apiClient.get(`/files/${fileId}/download`),
  
  downloadFolder: (folderId) => 
    apiClient.get(`/files/${folderId}/download-folder`, {
      responseType: 'blob'
    }),
  
  deleteFile: (fileId, permanent = false) => {
    const params = permanent ? { permanent: true } : {};
    return apiClient.delete(`/files/${fileId}`, { params });
  },
  
  restoreFile: (fileId) => apiClient.patch(`/files/${fileId}/restore`),
  
  toggleStar: (fileId) => apiClient.patch(`/files/${fileId}/star`),
  
  emptyTrash: () => apiClient.delete('/files/trash/empty')
};
