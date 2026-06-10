const BASE_URL = '/api/admin/users'

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

export async function getAllUsers(token) {
  const res = await fetch(BASE_URL, { headers: authHeaders(token) })
  return handleResponse(res)
}

export async function getUserById(token, id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders(token) })
  return handleResponse(res)
}

export async function updateUser(token, id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteUser(token, id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse(res)
}

export async function updateUserRole(token, id, role) {
  const res = await fetch(`${BASE_URL}/${id}/role`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ role }),
  })
  return handleResponse(res)
}

export async function setUserLocked(token, id, locked) {
  const res = await fetch(`${BASE_URL}/${id}/lock`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ locked }),
  })
  return handleResponse(res)
}
