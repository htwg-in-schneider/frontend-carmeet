import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([])
  let _id = 1

  function push(message, type = 'info', actions = []) {
    const id = _id++
    items.value.push({ id, message, type, actions })
    setTimeout(() => dismiss(id), 9000)
    return id
  }

  function dismiss(id) {
    items.value = items.value.filter(n => n.id !== id)
  }

  return { items, push, dismiss }
})
