<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import { useRouter, useRoute } from 'vue-router'

const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const dropdownOpen = ref(false)

const LANDING_PATHS = ['/callback']

watch(
  isAuthenticated,
  async (loggedIn) => {
    if (loggedIn) {
      await userStore.fetchProfile()
      if (LANDING_PATHS.includes(route.path)) {
        if (userStore.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/user/events')
        }
      }
    } else {
      userStore.clear()
    }
  },
  { immediate: true }
)

function handleLogin() {
  loginWithRedirect()
}

function handleLogout() {
  userStore.clear()
  logout({ logoutParams: { returnTo: window.location.origin } })
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleOutsideClick(e) {
  if (!e.target.closest('.usermenu')) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div v-if="!isLoading" class="usermenu">
    <button v-if="!isAuthenticated" class="btn-login" @click="handleLogin">
      Anmelden
    </button>

    <div v-else class="usermenu-trigger" :class="{ open: dropdownOpen }">
      <button class="avatar-btn" @click.stop="toggleDropdown">
        <img
          v-if="user?.picture"
          :src="user.picture"
          :alt="user.name"
          class="avatar"
        />
        <span v-else class="avatar-fallback">{{ user?.name?.[0] ?? '?' }}</span>
        <span class="dropdown-arrow">▾</span>
      </button>

      <ul v-if="dropdownOpen" class="dropdown-menu" @click="closeDropdown">
        <li class="dropdown-username">{{ user?.name }}</li>
        <li class="dropdown-divider"></li>
        <li v-if="userStore.isAdmin">
          <router-link class="dropdown-item" to="/admin">Admin-Bereich</router-link>
        </li>
        <li v-else>
          <router-link class="dropdown-item" to="/user/events">Mein Bereich</router-link>
        </li>
        <li>
          <router-link class="dropdown-item" to="/user/profile">Profil</router-link>
        </li>
        <li class="dropdown-divider"></li>
        <li>
          <button class="dropdown-item" @click="handleLogout">Abmelden</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.usermenu {
  position: relative;
}

.btn-login {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 9px 20px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.btn-login:hover {
  box-shadow: 0 0 24px rgba(153, 85, 255, 0.5);
}

.avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #00DDFF;
  object-fit: cover;
}

.avatar-fallback {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #00DDFF;
  background: #272736;
  color: #00DDFF;
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-arrow {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.2s;
}
.usermenu-trigger.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 190px;
  background: #1e1e2e;
  border: 1px solid rgba(0, 221, 255, 0.15);
  border-radius: 12px;
  padding: 8px 0;
  list-style: none;
  margin: 0;
  z-index: 1100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.dropdown-username {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #00DDFF;
  padding: 8px 18px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 4px 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  font-family: 'Orbitron', sans-serif;
  font-size: 9.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 18px;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
  box-sizing: border-box;
}
.dropdown-item:hover {
  color: #00DDFF;
  background: rgba(0, 221, 255, 0.06);
}
</style>
