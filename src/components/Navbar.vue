<script setup>
import Button from './Button.vue'
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
        <li><router-link :to="{ path: '/', hash: '#dummy-products' }">Dummy Products</router-link></li>
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
      <router-link :to="{ path: '/', hash: '#dummy-products' }">Dummy Products</router-link>

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


.nav-burger {
  display: none;
}
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
  gap: 16px;
  border-bottom: 1px solid rgba(0,221,255,0.12);
}
.burger-open.open {
  display: flex;
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
}
.burger-open .mob-btns {
  display: flex;
  gap: 12.8px;
  margin-top: 8px;
}
.burger-open .mob-btns a {
  border: none;
  padding: 11.2px 19.2px;
  border-radius: 30px;
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
