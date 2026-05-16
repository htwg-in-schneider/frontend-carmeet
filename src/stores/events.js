import { ref } from 'vue'
import { defineStore } from 'pinia'

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const HOURS = ['14:00', '16:00', '18:00', '19:00', '20:00']
const STREETS = ['Hauptstraße', 'Seestraße', 'Bahnhofstraße', 'Marktstätte', 'Bodanstraße']

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchEvents() {
    if (events.value.length) return
    loading.value = true
    error.value = null
    try {
      const res = await fetch('https://dummyjson.com/products?limit=10')
      if (!res.ok) throw new Error()
      const data = await res.json()
      events.value = data.products.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        address: `${STREETS[p.id % STREETS.length]} ${p.id}, 78462 Konstanz`,
        date: `${DAYS[p.id % 7]}, ${HOURS[p.id % HOURS.length]} Uhr`,
        spots: `${p.stock}/(${p.stock + Math.floor(Math.random() * 20)})` 
      }))
    } catch {
      error.value = 'Events konnten nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }

  function getEventById(id) {
    return events.value.find(e => e.id === id)
  }

  return { events, loading, error, fetchEvents, getEventById }
})
