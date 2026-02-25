import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

export const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_BASE}${path}`;
};

export default api;
