import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const boardAPI = {
  getBoards: (params) => api.get('/boards', { params }),
  getBoard: (id) => api.get(`/boards/${id}`),
  createBoard: (data) => api.post('/boards', data),
  updateBoard: (id, data) => api.put(`/boards/${id}`, data),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
  addMember: (id, data) => api.post(`/boards/${id}/members`, data),
  removeMember: (boardId, userId) => api.delete(`/boards/${boardId}/members/${userId}`),
};

export const listAPI = {
  getLists: (boardId) => api.get(`/lists/${boardId}/lists`),
  createList: (boardId, data) => api.post(`/lists/${boardId}/lists`, data),
  updateList: (id, data) => api.put(`/lists/${id}`, data),
  deleteList: (id) => api.delete(`/lists/${id}`),
};

export const taskAPI = {
  getTask: (id) => api.get(`/tasks/${id}`),
  getTasksByList: (listId) => api.get(`/tasks/list/${listId}`),
  createTask: (listId, data) => api.post(`/tasks/${listId}/tasks`, data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignUser: (taskId, data) => api.post(`/tasks/${taskId}/assign`, data),
  unassignUser: (taskId, userId) => api.delete(`/tasks/${taskId}/assign/${userId}`),
  searchTasks: (boardId, params) => api.get(`/tasks/search/${boardId}`, { params }),
};

export const activityAPI = {
  getActivities: (boardId, params) => api.get(`/activities/${boardId}`, { params }),
};

export default api;
