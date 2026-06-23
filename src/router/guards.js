import { authGuard } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'

async function ensureProfile(userStore) {
  if (!userStore.profile && !userStore.loading) {
    await userStore.fetchProfile()
  }
  // If still loading (concurrent call), wait a tick for it to complete
  if (userStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

// Allows only authenticated admins. Non-admin users → redirected to /.
export async function adminGuard(to, from) {
  const isAuthenticated = await authGuard(to, from)
  if (!isAuthenticated) return false

  const userStore = useUserStore()
  await ensureProfile(userStore)

  if (!userStore.isAdmin) {
    return { path: '/', replace: true }
  }
}

// Allows only authenticated non-admin users.
// Admins → redirected to /admin. Unauthenticated → Auth0 login.
// /user/profile is intentionally covered by plain authGuard — admins share that page.
export async function userOnlyGuard(to, from) {
  const isAuthenticated = await authGuard(to, from)
  if (!isAuthenticated) return false

  const userStore = useUserStore()
  await ensureProfile(userStore)

  if (userStore.isAdmin) {
    return { path: '/admin', replace: true }
  }
}
