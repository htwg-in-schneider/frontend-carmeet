import { BASE_URL as API_BASE } from './api.js'
const BASE_URL = `${API_BASE}/api/review`

export async function getReviewsByProductId(productId) {
  console.log(`[reviewService] GET ${BASE_URL}/product/${productId}`)
  const res = await fetch(`${BASE_URL}/product/${productId}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[reviewService] HTTP ${res.status}`, text)
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data?.content) return data.content
  return data
}
