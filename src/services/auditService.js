import { BASE_URL as API_BASE } from './api.js'
const BASE_URL = `${API_BASE}/api/admin/audit`

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return null
  return res.json()
}

/** Build query string from a filter object, omitting null/empty values. */
function buildQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') q.set(k, v)
  })
  return q.toString() ? '?' + q.toString() : ''
}

export async function getAuditLogs(token, { page = 0, size = 20, userId, action, entityType, search, from, to } = {}) {
  const qs = buildQuery({ page, size, userId, action, entityType, search, from, to })
  const res = await fetch(`${BASE_URL}${qs}`, { headers: authHeaders(token) })
  return handleResponse(res)
}

export async function getAuditLogById(token, id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders(token) })
  return handleResponse(res)
}

export async function getAuditLogsByTransaction(token, transactionId) {
  const res = await fetch(`${BASE_URL}/transaction/${encodeURIComponent(transactionId)}`, {
    headers: authHeaders(token),
  })
  return handleResponse(res)
}

export async function getDistinctActions(token) {
  const res = await fetch(`${BASE_URL}/meta/actions`, { headers: authHeaders(token) })
  return handleResponse(res)
}

export async function getDistinctEntityTypes(token) {
  const res = await fetch(`${BASE_URL}/meta/entity-types`, { headers: authHeaders(token) })
  return handleResponse(res)
}

export async function deleteAuditLog(token, id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse(res)
}

export async function deleteAllAuditLogs(token) {
  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse(res)
}


/**
 * Generate a transaction ID on the frontend for grouping multi-step operations.
 * Pass the returned ID as the X-Transaction-Id header in each related API call.
 */
export function generateTransactionId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TX-${date}-${suffix}`
}
