const BASE_URL = '/api/product'

export async function getProducts() {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data.content) return data.content
  return data
}

export async function getProductById(id) {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
