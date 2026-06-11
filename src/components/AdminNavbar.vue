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

// Redirect immediately when role is downgraded to USER
watch(
  () => userStore.profile?.role,
  (newRole, oldRole) => {
    if (oldRole === 'ADMIN' && newRole && newRole !== 'ADMIN') {
      router.replace('/user/events')
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
  <nav class="admin-nav">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo">
        <img src="../assets/picture/CarMeet_Logo.png" alt="CarMeet" class="logo-img" />
        <span class="admin-badge">Admin</span>
      </router-link>

      <ul class="nav-links">
        <li>
          <router-link to="/admin" :class="{ active: $route.path === '/admin' }">
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/admin/events" :class="{ active: $route.path === '/admin/events' }">
            Events
          </router-link>
        </li>
        <li>
          <router-link to="/admin/categories" :class="{ active: $route.path === '/admin/categories' }">
            Fahrzeugkategorien
          </router-link>
        </li>
        <li>
          <router-link to="/admin/users" :class="{ active: $route.path === '/admin/users' }">
            Nutzer
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
      <router-link to="/admin" @click="mobileOpen = false">Dashboard</router-link>
      <router-link to="/admin/events" @click="mobileOpen = false">Events</router-link>
      <router-link to="/admin/categories" @click="mobileOpen = false">Fahrzeugkategorien</router-link>
      <router-link to="/admin/users" @click="mobileOpen = false">Nutzer</router-link>
      <router-link to="/user/profile" @click="mobileOpen = false">Profil</router-link>
      <button class="mobile-logout" @click="handleLogout">Abmelden</button>
    </div>
  </nav>
</template>

<style scoped>
.admin-nav {
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
  gap: 10px;
  text-decoration: none;
}

.logo-img {
  max-height: 25px;
  width: auto;
}

.admin-badge {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: rgba(250, 11, 219, 0.15);
  border: 1px solid rgba(250, 11, 219, 0.4);
  color: #FA0BDB;
  padding: 3px 8px;
  border-radius: 20px;
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
  border-color: rgba(250, 11, 219, 0.5);
  color: #FA0BDB;
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
  background: #FA0BDB;
  border-radius: 2px;
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: 12px 5% 20px;
  background: #272736;
  border-top: 1px solid rgba(250, 11, 219, 0.1);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: left;
  cursor: pointer;
  transition: color 0.2s;
}
.mobile-menu a:hover,
.mobile-logout:hover { color: #FA0BDB; }

@media (max-width: 900px) {
  .nav-links { display: none; }
  .user-name { display: none; }
  .btn-logout { display: none; }
  .burger { display: flex; }
}
</style>
