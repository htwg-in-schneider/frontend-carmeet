const BASE_URL = '/api/product'

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

export async function getProducts() {
  console.log('[productService] GET', BASE_URL)
  const res = await fetch(BASE_URL)
  const data = await handleResponse(res)
  if (Array.isArray(data)) return data
  if (data?.content) return data.content
  return data
}

export async function getProductById(id) {
  console.log(`[productService] GET ${BASE_URL}/${id}`)
  const res = await fetch(`${BASE_URL}/${id}`)
  return handleResponse(res)
}

export async function createProduct(data) {
  console.log('[productService] POST', BASE_URL, JSON.stringify(data))
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateProduct(id, data) {
  console.log(`[productService] PUT ${BASE_URL}/${id}`, JSON.stringify(data))
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteProduct(id) {
  console.log(`[productService] DELETE ${BASE_URL}/${id}`)
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}
