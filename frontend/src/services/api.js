import axios from 'axios';
import config from '../config';
import { authService } from './auth';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/users/me'),
};

export const userAPI = {
    getLeaderboard: () => api.get('/users/leaderboard'),
    getProfile: (id) => api.get(`/users/${id}`),
    updateRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
    createUser: (data) => api.post('/users', data),
    updateUser: (userId, data) => api.put(`/users/${userId}`, data),
    deleteUser: (userId) => api.delete(`/users/${userId}`),
};
export const gameAPI = {
    getAll: () => api.get('/games'),
    getById: (id) => api.get(`/games/${id}`),
    uploadFile: (formData) => api.post('/games/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    approve: (id) => api.patch(`/games/${id}/approve`),
    reject: (id) => api.patch(`/games/${id}/reject`),
};

export const tournamentAPI = {
    getAll: () => api.get('/tournaments'),
    getById: (id) => api.get(`/tournaments/${id}`),
    create: (data) => api.post('/tournaments', data),
    register: (id) => api.post(`/tournaments/${id}/register`),
    delete: (id) => api.delete(`/tournaments/${id}`),
};

export const roomAPI = {
    getAll: () => api.get('/rooms'),
    create: (data) => api.post('/rooms', data),
};

export const auditAPI = {
    getLogs: () => api.get('/audit'),
};

export const puzzleAPI = {
    getDaily: () => api.get('/puzzles/daily'),
    getAll: () => api.get('/puzzles'),
    create: (data) => api.post('/puzzles', data),
    update: (id, data) => api.put(`/puzzles/${id}`, data),
    delete: (id) => api.delete(`/puzzles/${id}`),
};

export const postAPI = {
    getAll: () => api.get('/posts'),
    getById: (id) => api.get(`/posts/${id}`),
    create: (data) => api.post('/posts', data),
    update: (id, data) => api.put(`/posts/${id}`, data),
    delete: (id) => api.delete(`/posts/${id}`),
    togglePin: (id) => api.patch(`/posts/${id}/pin`),
    toggleLock: (id) => api.patch(`/posts/${id}/lock`),
    getComments: (postId) => api.get(`/posts/${postId}/comments`),
    addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
    deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export default api;