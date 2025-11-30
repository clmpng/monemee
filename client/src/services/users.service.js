import api from './api';

const usersService = {
  // Get current user
  getMe: () => api.get('/users/me'),
  
  // Update profile
  updateProfile: (data) => api.put('/users/me', data),
  
  // Update role
  updateRole: (role) => api.put('/users/me/role', { role }),
  
  // Get public store
  getPublicStore: (username) => api.get(`/users/${username}/store`)
};

export default usersService;