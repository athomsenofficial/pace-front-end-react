import axios from 'axios';

// Configure base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload Initial MEL roster
export const uploadInitialMEL = async (file, cycle, year) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cycle', cycle);
  formData.append('year', year);

  const response = await api.post('/api/upload/initial-mel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload Final MEL roster
export const uploadFinalMEL = async (file, cycle, year) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cycle', cycle);
  formData.append('year', year);

  const response = await api.post('/api/upload/final-mel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Submit PASCODE info and generate Initial MEL PDF
export const submitInitialMELPascodes = async (sessionId, pascodeInfo) => {
  const response = await api.post(
    '/api/initial-mel/submit/pascode-info',
    {
      session_id: sessionId,
      pascode_info: pascodeInfo,
    },
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

// Submit PASCODE info and generate Final MEL PDF
export const submitFinalMELPascodes = async (sessionId, pascodeInfo) => {
  const response = await api.post(
    '/api/final-mel/submit/pascode-info',
    {
      session_id: sessionId,
      pascode_info: pascodeInfo,
    },
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

// Download Initial MEL PDF
export const downloadInitialMEL = async (sessionId) => {
  const response = await api.get(`/api/download/initial-mel/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Download Final MEL PDF
export const downloadFinalMEL = async (sessionId) => {
  const response = await api.get(`/api/download/final-mel/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Helper function to download blob as file
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
