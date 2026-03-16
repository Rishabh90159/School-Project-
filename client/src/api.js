const API_BASE = '/api';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken, refreshToken) {
  if (accessToken != null) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken != null) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event('auth:logout'));
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Refresh failed');
        return data;
      })
      .then((data) => {
        setTokens(data.accessToken, null);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(endpoint, options = {}, retried = false) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401 && !retried && getRefreshToken()) {
    try {
      await refreshAccessToken();
      return request(endpoint, options, true);
    } catch {
      clearTokens();
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
  return data;
}

async function uploadFile(endpoint, formData, retried = false) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (res.status === 401 && !retried && getRefreshToken()) {
    try {
      await refreshAccessToken();
      return uploadFile(endpoint, formData, true);
    } catch {
      clearTokens();
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || 'Upload failed');
  return data;
}

async function fetchWithAuth(endpoint, retried = false) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (res.status === 401 && !retried && getRefreshToken()) {
    try {
      await refreshAccessToken();
      return fetchWithAuth(endpoint, true);
    } catch {
      clearTokens();
    }
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || res.statusText || 'Request failed');
  }
  return res;
}

export { getToken, getRefreshToken, setTokens, clearTokens };

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    registerTeacher: (body) => request('/auth/register-teacher', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  students: {
    list: () => request('/students'),
    add: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  },
  materials: {
    list: () => request('/materials'),
    getFile: (id) => fetchWithAuth(`/materials/${id}/file`).then((r) => r.blob()),
    add: (data) => {
      const form = new FormData();
      if (data.file) form.append('file', data.file);
      if (data.title != null) form.append('title', data.title);
      if (data.description != null) form.append('description', data.description);
      if (data.type != null) form.append('type', data.type);
      if (data.subject != null) form.append('subject', data.subject);
      if (data.topic != null) form.append('topic', data.topic);
      if (data.linkUrl != null) form.append('linkUrl', data.linkUrl);
      return uploadFile('/materials', form);
    },
    delete: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
  },
  quizzes: {
    list: () => request('/quizzes'),
    get: (id) => request(`/quizzes/${id}`),
    create: (body) => request('/quizzes', { method: 'POST', body: JSON.stringify(body) }),
    publish: (id, isPublished) => request(`/quizzes/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished }) }),
    submit: (id, body) => request(`/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/quizzes/${id}`, { method: 'DELETE' }),
  },
  assignments: {
    list: () => request('/assignments'),
    get: (id) => request(`/assignments/${id}`),
    create: (data) => {
      const form = new FormData();
      if (data.file) form.append('file', data.file);
      if (data.title != null) form.append('title', data.title);
      if (data.description != null) form.append('description', data.description);
      if (data.subject != null) form.append('subject', data.subject);
      if (data.dueDate != null) form.append('dueDate', data.dueDate);
      if (data.totalMarks != null) form.append('totalMarks', data.totalMarks);
      return uploadFile('/assignments', form);
    },
    submit: (id, file) => {
      const form = new FormData();
      form.append('file', file);
      return uploadFile(`/assignments/${id}/submit`, form);
    },
    submissions: (id) => request(`/assignments/${id}/submissions`),
    grade: (id, body) => request(`/assignments/${id}/grade`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id) => request(`/assignments/${id}`, { method: 'DELETE' }),
  },
  announcements: {
    list: () => request('/announcements'),
    create: (body) => request('/announcements', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),
  },
  doubts: {
    list: () => request('/doubts'),
    create: (body) => request('/doubts', { method: 'POST', body: JSON.stringify(body) }),
    answer: (id, answer) => request(`/doubts/${id}/answer`, { method: 'PATCH', body: JSON.stringify({ answer }) }),
  },
  results: {
    my: () => request('/results/my'),
    leaderboard: () => request('/results/leaderboard'),
    byQuiz: (quizId) => request(`/results/quiz/${quizId}`),
  },
};

export default api;
