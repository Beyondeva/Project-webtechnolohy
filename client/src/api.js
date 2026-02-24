import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

export const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_BASE}${path}`;
};

export default api;
