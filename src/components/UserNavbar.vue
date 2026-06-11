<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import { useRouter } from 'vue-router'

const { logout, user } = useAuth0()
const userStore = useUserStore()
const router = useRouter()

const mobileOpen = ref(false)

function handleLogout() {
  userStore.clear()
  logout({ logoutParams: { returnTo: window.location.origin } })
}

// Redirect immediately when role is upgraded to ADMIN
watch(
  () => userStore.profile?.role,
  (newRole, oldRole) => {
    if (oldRole === 'USER' && newRole === 'ADMIN') {
      router.replace('/admin')
    }
  }
)

// Poll profile every 10s to detect role changes
let pollTimer = null
onMounted(() => {
  pollTimer = setInterval(() => userStore.fetchProfile(), 1000)
})
onUnmounted(() => clearInterval(pollTimer))
</script>

<template>
  <nav class="user-nav">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo">
        <img src="../assets/picture/CarMeet_Logo.png" alt="CarMeet" class="logo-img" />
      </router-link>

      <ul class="nav-links">
        <li>
          <router-link to="/user/events" :class="{ active: $route.path === '/user/events' }">
            Events
          </router-link>
        </li>
        <li>
          <router-link to="/user/vehicles" :class="{ active: $route.path.startsWith('/user/vehicles') }">
            Meine Fahrzeuge
          </router-link>
        </li>
        <li>
          <router-link to="/user/profile" :class="{ active: $route.path === '/user/profile' }">
            Profil
          </router-link>
        </li>
      </ul>

      <div class="nav-end">
        <span class="user-name">{{ user?.name }}</span>
        <button class="btn-logout" @click="handleLogout">Abmelden</button>
        <button class="burger" @click="mobileOpen = !mobileOpen" aria-label="Menü">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="mobile-menu">
      <router-link to="/user/events" @click="mobileOpen = false">Events</router-link>
      <router-link to="/user/vehicles" @click="mobileOpen = false">Meine Fahrzeuge</router-link>
      <router-link to="/user/profile" @click="mobileOpen = false">Profil</router-link>
      <button class="mobile-logout" @click="handleLogout">Abmelden</button>
    </div>
  </nav>
</template>

<style scoped>
.user-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  background: #272736;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  height: 80px;
}

.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  max-height: 25px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 11.2px;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 8px 12.8px;
  transition: color 0.5s;
}
.nav-links a:hover,
.nav-links a.active {
  color: #00DDFF;
}

.nav-end {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.4);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: none;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-logout:hover {
  border-color: rgba(0, 221, 255, 0.5);
  color: #00DDFF;
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #00DDFF;
  border-radius: 2px;
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: 12px 5% 20px;
  background: #272736;
  border-top: 1px solid rgba(0, 221, 255, 0.08);
  gap: 2px;
}
.mobile-menu a,
.mobile-logout {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: left;
  cursor: pointer;
  transition: color 0.2s;
}
.mobile-menu a:hover,
.mobile-logout:hover { color: #00DDFF; }

@media (max-width: 900px) {
  .nav-links { display: none; }
  .user-name { display: none; }
  .btn-logout { display: none; }
  .burger { display: flex; }
}
</style>
