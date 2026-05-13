import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBannerStore = defineStore('banner', () => {
  const isVisible = ref(true)

  function hideBanner() {
    isVisible.value = false
  }

  return { isVisible, hideBanner }
})
