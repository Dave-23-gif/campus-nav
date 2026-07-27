/**
 * api.js — Campus Navigation System
 * Handles all REST API calls to the Spring Boot backend.
 */

const API_BASE = 'http://localhost:8080/api';
//const API_BASE = 'https://campus-nav-backend-suuy.onrender.com/api';
let authToken = localStorage.getItem('campus_token') || null;

const Api = {
  // ── Headers ─────────────────────────────────────────────
  _headers(auth = false) {
    const h = { 'Content-Type': 'application/json' };
    if (auth && authToken) h['Authorization'] = `Bearer ${authToken}`;
    return h;
  },

  async _fetch(url, opts = {}) {
    try {
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('API error:', e);
      throw e;
    }
  },

  // ── Auth ─────────────────────────────────────────────────
  async login(username, password) {
    try {
      const data = await this._fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({ username, password }),
      });
      if (data.token) {
        authToken = data.token;
        localStorage.setItem('campus_token', authToken);
      }
      return data;
    } catch (e) {
      // Backend unreachable — allow a safe local-dev fallback credential
      console.warn('Login failed, attempting local fallback:', e);
      if (username === 'DAOCC' && password === 'DAOCC@30') {
        authToken = 'local-dev-token';
        localStorage.setItem('campus_token', authToken);
        return { token: authToken, fallback: true };
      }
      throw e;
    }
  },


  logout() {
    authToken = null;
    localStorage.removeItem('campus_token');
  },

  isLoggedIn() { return !!authToken; },

  // ── Buildings ─────────────────────────────────────────────
  getBuildings()          { return this._fetch(`${API_BASE}/buildings`); },
  getBuilding(id)         { return this._fetch(`${API_BASE}/buildings/${id}`); },
  searchBuildings(q)      { return this._fetch(`${API_BASE}/buildings/search?q=${encodeURIComponent(q)}`); },

  createBuilding(data)    {
    return this._fetch(`${API_BASE}/buildings`, {
      method: 'POST', headers: this._headers(true), body: JSON.stringify(data),
    });
  },
  updateBuilding(id, data) {
    return this._fetch(`${API_BASE}/buildings/${id}`, {
      method: 'PUT', headers: this._headers(true), body: JSON.stringify(data),
    });
  },
  deleteBuilding(id) {
    return this._fetch(`${API_BASE}/buildings/${id}`, {
      method: 'DELETE', headers: this._headers(true),
    });
  },

  // ── Routing ───────────────────────────────────────────────
  getRoute(fromId, toId) {
    return this._fetch(`${API_BASE}/route?from=${fromId}&to=${toId}`);
  },

  // ── Paths (Admin) ─────────────────────────────────────────
  getPaths()            { return this._fetch(`${API_BASE}/paths`); },
  createPath(data)      {
    return this._fetch(`${API_BASE}/paths`, {
      method: 'POST', headers: this._headers(true), body: JSON.stringify(data),
    });
  },
  deletePath(id) {
    return this._fetch(`${API_BASE}/paths/${id}`, {
      method: 'DELETE', headers: this._headers(true),
    });
  },
};
