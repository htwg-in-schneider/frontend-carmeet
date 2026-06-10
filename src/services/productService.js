const BASE_URL = '/api/product'

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[productService] HTTP ${res.status} ${res.statusText}`, text)
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null
  }
  return res.json()
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams()
  if (params.name?.trim()) query.append('name', params.name.trim())
  if (params.category != null && params.category !== '') {
    query.append('category', params.category)
  }
  const url = query.toString() ? `${BASE_URL}?${query}` : BASE_URL
  console.log('[productService] GET', url)
  const res = await fetch(url)
  const data = await handleResponse(res)
  if (Array.isArray(data)) return data
  if (data?.content) return data.content
  return data
}

export async function getMyProducts(token) {
  const res = await fetch(`${BASE_URL}/my`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await handleResponse(res)
  if (Array.isArray(data)) return data
  return data ?? []
}

export async function getProductById(id) {
  console.log(`[productService] GET ${BASE_URL}/${id}`)
  const res = await fetch(`${BASE_URL}/${id}`)
  return handleResponse(res)
}

export async function createProduct(data, token) {
  console.log('[productService] POST', BASE_URL, JSON.stringify(data))
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateProduct(id, data, token) {
  console.log(`[productService] PUT ${BASE_URL}/${id}`, JSON.stringify(data))
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteProduct(id, token) {
  console.log(`[productService] DELETE ${BASE_URL}/${id}`)
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return handleResponse(res)
}
