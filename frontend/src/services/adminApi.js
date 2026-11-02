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

// Response interceptor to catch 401 Unauthorized / Token Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('mnabil_admin_token');
      localStorage.removeItem('mnabil_admin_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mnabil_auth_expired', {
          detail: { message: error.response?.data?.message || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً' }
        }));
      }
    }
    return Promise.reject(error);
  }
);

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

// Staff User Management
export async function fetchStaffUsers() {
  try {
    const res = await api.get('/auth/users');
    return res.data?.data || [];
  } catch {
    return [];
  }
}

export async function createStaffUser(userData) {
  const res = await api.post('/auth/users', userData);
  return res.data?.data;
}

export async function toggleStaffUserStatus(id, is_active) {
  const res = await api.patch(`/auth/users/${id}`, { is_active });
  return res.data?.data;
}

// Audit Logs
export async function fetchAuditLogs(limit = 200) {
  try {
    const res = await api.get('/audit-logs', { params: { limit } });
    return res.data?.data || [];
  } catch {
    return [];
  }
}

export async function postAuditLog(action, entity_type = 'admin_action') {
  try {
    await api.post('/audit-logs', { action, entity_type });
  } catch {
    // fail silently — log is best-effort
  }
}

// Showroom Settings & Integration (Announcement, Webhook, Google Sheets, Maintenance)
export async function fetchShowroomSettings() {
  try {
    const res = await api.get('/settings');
    return res.data?.data || null;
  } catch {
    return null;
  }
}

export async function updateShowroomSettings(settingsPayload) {
  const res = await api.put('/settings', settingsPayload);
  return res.data?.data;
}

export async function syncAllToGoogleSheets(url) {
  const res = await api.post('/settings/sheets/sync-all', { url });
  return res.data;
}
