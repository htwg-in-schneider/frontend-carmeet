<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import UserMenu from './UserMenu.vue'
import { getCategories } from '../services/categoryService.js'

const router = useRouter()
const route = useRoute()

const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0()
const userStore = useUserStore()

const categories = ref([])
const dropdownOpen = ref(false)
const mobCatsOpen = ref(false)

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (e) {
    console.error('[Navbar] Kategorien laden fehlgeschlagen:', e)
  }
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

function handleOutsideClick(e) {
  if (!e.target.closest('.nav-dropdown')) {
    dropdownOpen.value = false
  }
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function goToAll() {
  dropdownOpen.value = false
  mobCatsOpen.value = false
  router.push({ path: '/products', query: {} })
}

function goToCategory(id) {
  dropdownOpen.value = false
  mobCatsOpen.value = false
  router.push({ path: '/products', query: { category: id } })
}

function isActiveCategory(id) {
  return String(route.query.category) === String(id)
}

function handleMobLogin() {
  loginWithRedirect()
}

function handleMobLogout() {
  userStore.clear()
  logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}
</script>

<template>
  <div>
    <input type="checkbox" id="navBurger" class="nav-burger" />

    <nav id="navbar">
      <router-link to="/" class="nav-logo">
        <img src="../assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="nav-logo-image">
      </router-link>

      <ul class="nav-links">
        <li><router-link :to="{ path: '/', hash: '#what' }">Was ist CarMeet</router-link></li>
        <li><router-link :to="{ path: '/', hash: '#how' }">Wie es funktioniert</router-link></li>
        <li><router-link :to="{ path: '/', hash: '#events' }">Events</router-link></li>
        <li><router-link :to="{ path: '/', hash: '#how-to-manager' }">Eventmanager</router-link></li>
        <li><router-link to="/impressum">Über uns</router-link></li>

        <li class="nav-dropdown" :class="{ open: dropdownOpen }">
          <button class="dropdown-toggle" @click.stop="toggleDropdown">
            Angemeldete Autos <span class="dropdown-arrow">▾</span>
          </button>
          <ul class="dropdown-menu">
            <li>
              <button
                class="dropdown-item"
                :class="{ active: !route.query.category }"
                @click="goToAll"
              >
                Alle Autos
              </button>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <button
                class="dropdown-item"
                :class="{ active: isActiveCategory(cat.id) }"
                @click="goToCategory(cat.id)"
              >
                {{ cat.nameDe || cat.name }}
              </button>
            </li>
          </ul>
        </li>
      </ul>

      <div class="nav-actions">
        <UserMenu />
      </div>

      <label for="navBurger" class="burger" aria-label="Menü öffnen">
        <span></span><span></span><span></span>
      </label>
    </nav>

    <div class="burger-open" id="burgerOpen">
      <router-link :to="{ path: '/', hash: '#what' }">Was ist CarMeet</router-link>
      <router-link :to="{ path: '/', hash: '#how' }">Wie es funktioniert</router-link>
      <router-link :to="{ path: '/', hash: '#events' }">Events</router-link>
      <router-link :to="{ path: '/', hash: '#how-to-manager' }">Eventmanager werden</router-link>
      <router-link to="/impressum">Über uns</router-link>

      <div class="mob-categories">
        <button class="mob-cat-toggle" @click="mobCatsOpen = !mobCatsOpen">
          Angemeldete Autos
          <span class="mob-cat-arrow" :class="{ open: mobCatsOpen }">▾</span>
        </button>
        <div v-show="mobCatsOpen" class="mob-cat-items">
          <button
            class="mob-cat-item"
            :class="{ active: !route.query.category }"
            @click="goToAll"
          >
            Alle Autos
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="mob-cat-item"
            :class="{ active: isActiveCategory(cat.id) }"
            @click="goToCategory(cat.id)"
          >
            {{ cat.nameDe || cat.name }}
          </button>
        </div>
      </div>

      <div v-if="!isLoading" class="mob-user">
        <template v-if="!isAuthenticated">
          <button class="mob-login-btn" @click="handleMobLogin">Anmelden</button>
        </template>
        <template v-else>
          <div class="mob-user-name">{{ user?.name }}</div>
          <router-link v-if="userStore.isAdmin" class="mob-user-link" to="/admin">Admin-Bereich</router-link>
          <router-link v-else class="mob-user-link" to="/user/events">Mein Bereich</router-link>
          <router-link class="mob-user-link" to="/user/profile">Profil</router-link>
          <button class="mob-logout-btn" @click="handleMobLogout">Abmelden</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 0 5%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #272736;
}

.nav-logo {
  display: inline-flex;
  align-items: center;
}
.nav-logo img {
  display: block;
  max-height: 25px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 16px;
  align-items: center;
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
}
.nav-links a:hover {
  transition: 0.5s;
  color: #00DDFF;
}

/* ─── DROPDOWN ─── */
.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: white;
  font-family: 'Orbitron', sans-serif;
  font-size: 11.2px;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 8px 12.8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}
.dropdown-toggle:hover,
.nav-dropdown.open .dropdown-toggle {
  color: #00DDFF;
}

.dropdown-arrow {
  font-size: 9px;
  transition: transform 0.2s;
}
.nav-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: #1e1e2e;
  border: 1px solid rgba(0,221,255,0.15);
  border-radius: 12px;
  padding: 8px 0;
  list-style: none;
  margin: 0;
  z-index: 1100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.nav-dropdown.open .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: rgba(255,255,255,0.75);
  font-family: 'Orbitron', sans-serif;
  font-size: 9.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 18px;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.dropdown-item:hover {
  color: #00DDFF;
  background: rgba(0,221,255,0.06);
}
.dropdown-item.active {
  color: #00DDFF;
  background: rgba(0,221,255,0.08);
}

/* ─── MOBILE ─── */
.nav-burger { display: none; }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 13.6px;
}
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  padding: 4px;
}
.burger span {
  display: block;
  width: 26px;
  height: 2px;
  background: #00DDFF;
  border-radius: 2px;
  transition: all 0.3s;
}

.nav-burger:checked + nav + .burger-open {
  display: flex;
}

.burger-open {
  display: none;
  position: fixed;
  top: 70px; left: 0; right: 0;
  bottom: 0;
  background: #272736;
  z-index: 999;
  flex-direction: column;
  padding: 24px 5% 32px;
  gap: 0;
  border-bottom: 1px solid rgba(0,221,255,0.12);
  overflow-y: auto;
}
.burger-open a {
  color: white;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 11.2px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: block;
  width: 100%;
}

/* ─── MOBILE CATEGORIES ACCORDION ─── */
.mob-categories {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.mob-cat-toggle {
  background: none;
  border: none;
  color: white;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 11.2px 0;
  text-align: left;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mob-cat-toggle:hover {
  color: #00DDFF;
}

.mob-cat-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  color: #00DDFF;
}
.mob-cat-arrow.open {
  transform: rotate(180deg);
}

.mob-cat-items {
  display: flex;
  flex-direction: column;
  padding-bottom: 4px;
}

.mob-cat-item {
  background: none;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.75);
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  text-align: left;
  padding: 10px 0 10px 14px;
  cursor: pointer;
  width: 100%;
}
.mob-cat-item:hover {
  color: #00DDFF;
}
.mob-cat-item.active {
  color: #00DDFF;
}

/* ─── MOBILE USER SECTION ─── */
.mob-user {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  gap: 0;
}

.mob-user-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #00DDFF;
  padding: 10px 0 6px;
}

.mob-user-link {
  color: white;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 11.2px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: block;
  width: 100%;
}
.mob-user-link:hover {
  color: #00DDFF;
}

.mob-login-btn {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 12px 28px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
  cursor: pointer;
  transition: box-shadow 0.3s;
  align-self: flex-start;
  margin-top: 4px;
}
.mob-login-btn:hover {
  box-shadow: 0 0 24px rgba(153, 85, 255, 0.5);
}

.mob-logout-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 11.2px 0;
  text-align: left;
  cursor: pointer;
  width: 100%;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.mob-logout-btn:hover {
  color: #FA0BDB;
}

@media (max-width: 1500px) {
  .nav-links { display: none; }
  .nav-actions { display: none; }
  .burger { display: flex; }
}
@media (min-width: 1501px) {
  .burger-open { display: none !important; }
}
</style>
