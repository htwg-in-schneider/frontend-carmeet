import { BASE_URL as API_BASE } from './api.js'
const BASE_URL = `${API_BASE}/api/category`

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

export async function getCategories() {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data?.content) return data.content
  return data
}

export async function createCategory(token, data) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateCategory(token, id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteCategory(token, id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse(res)
}
