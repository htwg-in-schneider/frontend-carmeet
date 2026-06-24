const BASE = '/api/events'

function h(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getEvents(token) {
  const res = await fetch(BASE, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  return handle(res)
}

export async function createEvent(token, data) {
  const res = await fetch(BASE, { method: 'POST', headers: h(token), body: JSON.stringify(data) })
  return handle(res)
}

export async function updateEvent(token, id, data) {
  const res = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: h(token), body: JSON.stringify(data) })
  return handle(res)
}

export async function deleteEvent(token, id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  return handle(res)
}

export async function joinEvent(token, id, vehicleId) {
  const res = await fetch(`${BASE}/${id}/join`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify(vehicleId != null ? { vehicleId } : {}),
  })
  return handle(res)
}

export async function leaveEvent(token, id) {
  const res = await fetch(`${BASE}/${id}/join`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  return handle(res)
}

export async function getMyJoins(token) {
  const res = await fetch(`${BASE}/my-joins`, { headers: { Authorization: `Bearer ${token}` } })
  return handle(res)
}

export async function getParticipants(token, id) {
  const res = await fetch(`${BASE}/${id}/participants`, { headers: { Authorization: `Bearer ${token}` } })
  return handle(res)
}

export async function getMessages(token, id) {
  const res = await fetch(`${BASE}/${id}/messages`, { headers: { Authorization: `Bearer ${token}` } })
  return handle(res)
}

export async function sendMessage(token, id, content) {
  const res = await fetch(`${BASE}/${id}/messages`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify({ content }),
  })
  return handle(res)
}
