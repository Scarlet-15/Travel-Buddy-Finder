import api from './api';

export const tripService = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  cancel: (id) => api.delete(`/trips/${id}`),
  getMyOrganized: () => api.get('/trips/my/organized'),
  getMyJoined: () => api.get('/trips/my/joined'),
  createChatRoom: (id) => api.post(`/trips/${id}/chat`),
};

export const joinRequestService = {
  create: (data) => api.post('/join-requests', data),
  getMy: () => api.get('/join-requests/my'),
  getForTrip: (tripId) => api.get(`/join-requests/trip/${tripId}`),
  updateStatus: (id, status) => api.put(`/join-requests/${id}/status`, { status }),
  withdraw: (id) => api.delete(`/join-requests/${id}`),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getHistory: () => api.get('/users/history'),
};
