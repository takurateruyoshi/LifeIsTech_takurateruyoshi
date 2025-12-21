import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeader = () => {
    const session = JSON.parse(localStorage.getItem('session'));
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
};

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/signin`, { email, password });
    if (response.data.session) {
        localStorage.setItem('session', JSON.stringify(response.data.session));
        localStorage.setItem('user_info', JSON.stringify({ username: response.data.username, email: response.data.email }));
    }
    return response.data;
};

export const signup = async (email, password, username) => {
    return await axios.post(`${API_URL}/api/auth/signup`, { email, password, username });
};

export const fetchUser = async () => {
    const response = await axios.get(`${API_URL}/api/user`, { headers: getAuthHeader() });
    return response.data;
};

export const fetchHistory = async () => {
    const response = await axios.get(`${API_URL}/api/history`, { headers: getAuthHeader() });
    return response.data;
};

export const runAnalysis = async (text) => {
    const response = await axios.post(`${API_URL}/api/analyze`, { text }, { headers: getAuthHeader() });
    return response.data;
};