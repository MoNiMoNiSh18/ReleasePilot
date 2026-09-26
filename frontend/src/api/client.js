const API_BASE = '/api';

/**
 * Start a new analysis session.
 * @param {{ projectPath: string, projectName?: string, branch?: string }} payload
 * @returns {Promise<{ id: string, status: string, createdAt: string }>}
 */
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

/**
 * Get a single analysis session by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getAnalysis(id) {
  const res = await fetch(`${API_BASE}/analysis/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

/**
 * List all analysis sessions.
 * @returns {Promise<object[]>}
 */
export async function listAnalyses() {
  const res = await fetch(`${API_BASE}/analysis`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

/**
 * Get a full report by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}
