import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { getProfile, updateProfile } from '../services/profileService.js'

export const useUserStore = defineStore('user', () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()

  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAdmin = computed(() => profile.value?.role === 'ADMIN')
  const isEventManager = computed(() => profile.value?.eventManager === true)

  async function fetchProfile() {
    if (!isAuthenticated.value) return
    loading.value = true
    error.value = null
    try {
      const token = await getAccessTokenSilently()
      profile.value = await getProfile(token)
    } catch (e) {
      error.value = e.message
      console.error('[userStore] fetchProfile failed:', e)
    } finally {
      loading.value = false
    }
  }

  async function saveProfile(data) {
    loading.value = true
    error.value = null
    try {
      const token = await getAccessTokenSilently()
      profile.value = await updateProfile(token, data)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  function clear() {
    profile.value = null
    error.value = null
  }

  return { profile, loading, error, isAdmin, isEventManager, fetchProfile, saveProfile, clear }
})
