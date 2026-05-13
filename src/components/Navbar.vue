<script setup>
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
      </ul>

      <div class="nav-actions">
        <a href="#" class="btn-nav btn-login">Anmelden</a>
        <a href="#" class="btn-nav btn-register">Registrieren</a>
      </div>

      <label for="navBurger" class="burger" aria-label="Menü öffnen">
        <span></span><span></span><span></span>
      </label>
    </nav>

    <div class="burger-open" id="burgerOpen">
      <a href="#what">Was ist CarMeet</a>
      <a href="#how">Wie es funktioniert</a>
      <a href="#events">Events auf der Karte</a>
      <a href="#how-to-manager">Eventmanager werden</a>
      <a href="#">Über uns</a>

      <div class="mob-btns">
        <a href="#" class="btn-nav btn-login">Anmelden</a>
        <a href="#" class="btn-nav btn-register">Registrieren</a>
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

.btn-nav {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 8px 19.2px;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.3s;
}
.btn-login {
  background: transparent;
  color: #00DDFF;
  border: 1.5px solid #00DDFF;
}
.btn-login:hover {
  background: rgba(0,221,255,0.1);
}
.btn-register {
  background: linear-gradient(90deg, #FA0BDB, #00DDFF);
  color: white;
  border: none;
}
.btn-register:hover { opacity: 0.85; }

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
