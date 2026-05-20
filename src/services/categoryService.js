const BASE_URL = '/api/category'

export async function getCategories() {
  console.log('[categoryService] GET', BASE_URL)
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[categoryService] HTTP ${res.status}`, text)
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data?.content) return data.content
  return data
}
