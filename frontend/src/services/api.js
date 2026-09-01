const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://omnisight-backend-4ina.onrender.com';
const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'https://omnisight-ml-service.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('omnisight_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth API
  async login(email, password) {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data.data;
  },

  async register(username, email, password, role = 'qa_manager') {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, username, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data.data;
  },

  async getMe() {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data.data?.user;
  },

  // Runs API
  async getRuns() {
    const res = await fetch(`${BACKEND_URL}/api/runs`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch runs');
    return data.data?.runs || [];
  },

  async getRunById(id) {
    const res = await fetch(`${BACKEND_URL}/api/runs/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to fetch run ${id}`);
    return data.data; // { run, fixAttempts, pullRequest }
  },

  async updateDecision(id, decision, reason = '') {
    const res = await fetch(`${BACKEND_URL}/api/runs/${id}/decision`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ decision, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to update decision`);
    return data.data;
  },

  // Trigger New Autonomous Run via ML Service Webhook
  async triggerNewRun() {
    const res = await fetch(`${ML_SERVICE_URL}/webhook/build-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: 'Harsh-Yadav029/OmniSight',
        branch: 'main',
        commitSha: Math.random().toString(36).substring(2, 9)
      })
    });
    const data = await res.json();
    return data;
  }
};
