import axios from 'axios';

// Configure base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get roster preview for review/editing
export const getRosterPreview = async (sessionId, category = 'all', page = 1, pageSize = 50) => {
  const params = { category, page, page_size: pageSize };
  const response = await api.get(`/api/roster/preview/${sessionId}`, { params });
  return response.data;
};

// Edit existing member
export const editMember = async (sessionId, memberId, memberData) => {
  const response = await api.put(`/api/roster/member/${sessionId}/${memberId}`, memberData);
  return response.data;
};

// Add new member
export const addMember = async (sessionId, data) => {
  const response = await api.post(`/api/roster/member/${sessionId}`, data);
  return response.data;
};

// Delete member
export const deleteMember = async (sessionId, memberId, reason, hardDelete = false) => {
  const response = await api.delete(`/api/roster/member/${sessionId}/${memberId}`, {
    params: { hard_delete: hardDelete },
    data: { reason },
  });
  return response.data;
};

// Upload custom logo
export const uploadLogo = async (sessionId, file) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await api.post(`/api/roster/logo/${sessionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get custom logo
export const getLogo = async (sessionId) => {
  const response = await api.get(`/api/roster/logo/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Delete custom logo
export const deleteLogo = async (sessionId) => {
  const response = await api.delete(`/api/roster/logo/${sessionId}`);
  return response.data;
};

// Reprocess roster
export const reprocessRoster = async (sessionId, preserveManualEdits = true, categories = []) => {
  const response = await api.post(`/api/roster/reprocess/${sessionId}`, {
    preserve_manual_edits: preserveManualEdits,
    categories,
  });
  return response.data;
};

export default api;
