import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mnabil_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Auth
export async function loginAdmin(username, password) {
  const res = await api.post('/auth/login', { username, password });
  if (res.data && res.data.success) {
    const { accessToken, user } = res.data.data;
    localStorage.setItem('mnabil_admin_token', accessToken);
    localStorage.setItem('mnabil_admin_user', JSON.stringify(user));
    return user;
  }
  throw new Error(res.data?.message || 'فشل تسجيل الدخول');
}

export function getCurrentAdmin() {
  try {
    const raw = localStorage.getItem('mnabil_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAdminToken() {
  return localStorage.getItem('mnabil_admin_token');
}

export async function logoutAdmin() {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore
  } finally {
    localStorage.removeItem('mnabil_admin_token');
    localStorage.removeItem('mnabil_admin_user');
  }
}

// CRM & Analytics
export async function fetchAnalyticsOverview() {
  const res = await api.get('/analytics/overview');
  return res.data?.data || null;
}

// Inquiries / Leads
export async function fetchAdminInquiries(params = { limit: 100 }) {
  const res = await api.get('/inquiries', { params });
  return res.data || { data: [], pagination: {} };
}

export async function createManualInquiry(inquiryData) {
  const res = await api.post('/inquiries', inquiryData);
  return res.data?.data;
}

export async function updateInquiryStatus(id, updateData) {
  const res = await api.patch(`/inquiries/${id}/status`, updateData);
  return res.data?.data;
}

export async function verifyAdminInquiryRef(code) {
  const res = await api.post('/inquiries/verify-ref', { code });
  return res.data?.data;
}

// Cars Management
export async function fetchAdminCars(params = { limit: 100 }) {
  const res = await api.get('/cars/admin/all', { params });
  return res.data || { data: [], pagination: {} };
}

export async function createAdminCar(carData) {
  const res = await api.post('/cars/admin', carData);
  return res.data?.data;
}

export async function updateAdminCar(id, carData) {
  const res = await api.put(`/cars/admin/${id}`, carData);
  return res.data?.data;
}

export async function deleteAdminCar(id) {
  const res = await api.delete(`/cars/admin/${id}`);
  return res.data;
}

export async function toggleCarPublish(id) {
  const res = await api.patch(`/cars/admin/${id}/publish`);
  return res.data?.data;
}

export async function toggleCarFeature(id) {
  const res = await api.patch(`/cars/admin/${id}/feature`);
  return res.data?.data;
}
