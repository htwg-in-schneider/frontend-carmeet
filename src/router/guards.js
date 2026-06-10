import { authGuard } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'

export async function adminGuard(to, from) {
  const isAuthenticated = await authGuard(to, from)
  if (!isAuthenticated) return false

  const userStore = useUserStore()
  if (!userStore.profile) {
    await userStore.fetchProfile()
  }

  if (!userStore.isAdmin) {
    return { path: '/', replace: true }
  }
}
