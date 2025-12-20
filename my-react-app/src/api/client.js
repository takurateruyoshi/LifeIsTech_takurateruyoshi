import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';


export const fetchUser = async () => {
    const response = await axios.get(`${API_URL}/api/user`);
    return response.data;
};


export const fetchHistory = async () => {
    const response = await axios.get(`${API_URL}/api/history`);
    return response.data;
};

export const runAnalysis = async (text) => {
    const response = await axios.post(`${API_URL}/api/analyze`, { text });
    return response.data;
};

export const generateES = async (episodeIds) => {
    const response = await axios.post(`${API_URL}/api/generate-es`, { ids: episodeIds });
    return response.data;
};