import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const fetchData = () => axios.get(`${API_BASE_URL}/data`).then(res => res.data);
export const fetchForecast = () => axios.get(`${API_BASE_URL}/forecast`).then(res => res.data);
export const fetchPatterns = () => axios.get(`${API_BASE_URL}/patterns`).then(res => res.data);
export const fetchAnomalies = () => axios.get(`${API_BASE_URL}/anomalies`).then(res => res.data);
export const fetchResults = () => axios.get(`${API_BASE_URL}/results`).then(res => res.data);
