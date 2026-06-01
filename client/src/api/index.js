import api from './client';

// auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/password', data),
};

// workspaces
export const workspaceApi = {
  getAll: () => api.get('/workspaces'),
  getOne: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.patch(`/workspaces/${id}`, data),
  join: (inviteCode) => api.post('/workspaces/join', { inviteCode }),
  leave: (id) => api.post(`/workspaces/${id}/leave`),
  regenerateInvite: (id) => api.post(`/workspaces/${id}/invite/regenerate`),
};

// tasks
export const taskApi = {
  getAll: (workspaceId, params) => api.get(`/workspaces/${workspaceId}/tasks`, { params }),
  getOne: (workspaceId, taskId) => api.get(`/workspaces/${workspaceId}/tasks/${taskId}`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/tasks`, data),
  update: (workspaceId, taskId, data) =>
    api.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, data),
  delete: (workspaceId, taskId) => api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`),
  reorder: (workspaceId, tasks) => api.post(`/workspaces/${workspaceId}/tasks/reorder`, { tasks }),
};

// activity
export const activityApi = {
  getWorkspaceActivity: (workspaceId, params) =>
    api.get(`/activity/${workspaceId}`, { params }),
};

// users
export const userApi = {
  search: (q) => api.get('/users/search', { params: { q } }),
  getStats: () => api.get('/users/stats'),
};
