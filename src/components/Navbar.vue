<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from './Button.vue'
import { getCategories } from '../services/categoryService.js'

const router = useRouter()
const route = useRoute()

const categories = ref([])
const dropdownOpen = ref(false)

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
  router.push({ path: '/products', query: {} })
}

function goToCategory(id) {
  dropdownOpen.value = false
  router.push({ path: '/products', query: { category: id } })
}

function isActiveCategory(id) {
  return String(route.query.category) === String(id)
}
</script>

<template>
  <div>
    <input type="checkbox" id="navBurger" class="nav-burger" />

    <nav id="navbar">
      <a href="#" class="nav-logo">
        <img src="../assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="nav-logo-image">
      </a>

      <ul class="nav-links">
        <li><a href="#what">Was ist CarMeet</a></li>
        <li><a href="#how">Wie es funktioniert</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#how-to-manager">Eventmanager</a></li>
        <li><a href="#">Über uns</a></li>

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
        <Button href="#" variant="secondary" size="sm">Anmelden</Button>
        <Button href="#" variant="accent" size="sm">Registrieren</Button>
      </div>

      <label for="navBurger" class="burger" aria-label="Menü öffnen">
        <span></span><span></span><span></span>
      </label>
    </nav>

    <div class="burger-open" id="burgerOpen">
      <a href="#what">Was ist CarMeet</a>
      <a href="#how">Wie es funktioniert</a>
      <a href="#events">Events</a>
      <a href="#how-to-manager">Eventmanager werden</a>
      <a href="#">Über uns</a>

      <div class="mob-categories">
        <div class="mob-cat-label">Angemeldete Autos</div>
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

      <div class="mob-btns">
        <Button href="#" variant="secondary" size="sm">Anmelden</Button>
        <Button href="#" variant="accent" size="sm">Registrieren</Button>
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
  background: #272736;
  z-index: 999;
  flex-direction: column;
  padding: 24px 5% 32px;
  gap: 0;
  border-bottom: 1px solid rgba(0,221,255,0.12);
}
.burger-open a,
.burger-open .mob-cat-item {
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
.burger-open .mob-btns {
  display: flex;
  gap: 12.8px;
  margin-top: 16px;
}
.burger-open .mob-btns a {
  border: none;
  padding: 11.2px 19.2px;
  border-radius: 30px;
}

.mob-categories {
  display: flex;
  flex-direction: column;
}
.mob-cat-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #00DDFF;
  padding: 14px 0 6px;
}
.mob-cat-item {
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  text-align: left;
  cursor: pointer;
  padding-left: 12px !important;
}
.mob-cat-item.active {
  color: #00DDFF !important;
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
