// In development the Create React App proxy (package.json "proxy") forwards /api to localhost:3001.
// In production REACT_APP_API_URL must be set to the full Render backend URL (no trailing slash).
// e.g. REACT_APP_API_URL=https://releasepilot-api.onrender.com
const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

export async function startAnalysis(payload) {
  const res = await fetch(`${API_BASE}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getAnalysis(id) {
  const res = await fetch(`${API_BASE}/analysis/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function listAnalyses() {
  const res = await fetch(`${API_BASE}/analysis`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function getReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function updateAnalysisStatus(id, status) {
  const res = await fetch(`${API_BASE}/analysis/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}
