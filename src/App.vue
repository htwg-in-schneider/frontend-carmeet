<script>
import { steps, events } from './data.js'

export default {
  data() {
    return {
      steps,
      events
    }
  },
  methods: {
    showStep(step) {
      alert(step.text)
    },
    showDetails(event) {
      alert(event.description)
    }
  }
}
</script>

<template>
  <div>

    <!-- Navigation -->
    <input type="checkbox" id="navBurger" class="nav-burger" />

    <nav id="navbar">
      <a href="#" class="nav-logo">
        <img src="./assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="nav-logo-image">
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

    <!-- Burger Menu -->
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

    <!-- TOP -->
    <section id="top">
      <div class="top-grid"></div>
      <div class="top-glow top-glow-1"></div>
      <div class="top-glow top-glow-2"></div>
      <div class="top-glow top-glow-3"></div>

      <div class="top-badge">Die Plattform für Autoenthusiasten</div>

      <h1 class="top-title">
         <img src="./assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="top-logo">
      </h1>

      <p class="top-sub">
        Entdecke Autotreffen in deiner Nähe, verbinde dich mit Gleichgesinnten und organisiere deine eigenen Events.
      </p>

      <div class="top-btn">
        <a href="#" class="btn-primary btn-primary-grad">Jetzt kostenlos starten</a>
        <a href="#how" class="btn-primary btn-outline-cyan">Wie es funktioniert</a>
      </div>
    </section>

    <div class="divider"></div>

    <!-- ─── WHAT IS CARMEET ─── -->
<section id="what">
  <div class="section-inner">
    <div class="what-grid">
      <div>
        <div class="section-label">Was ist CarMeet</div>
        <h2 class="section-title">Die zentrale Plattform für Autofans</h2>
        <p class="section-text">
          CarMeet ist eine Webanwendung, die es dir ermöglicht, standortbasierte Autotreffen 
          zu finden, beizutreten und selbst zu organisieren. Schluss mit unübersichtlichen 
          WhatsApp-Gruppen und verstreuten Instagram-Posts.
        </p><br>
        <p class="section-text">
          Egal ob Muscle Cars, Youngtimer, SUVs oder Elektrofahrzeuge, CarMeet verbindet 
          dich mit Gleichgesinnten, die dieselbe Leidenschaft teilen wie du.
        </p>
      </div>
      <div class="what-visual">
        <img src="./assets/picture/bmw-gruppenfoto.jpg" alt="BMW Gruppenfoto" class="what-image">
      </div>
    </div>
  </div>
</section>

    <div class="divider"></div>

    <!-- ─── HOW IT WORKS ─── -->
<section id="how">
  <div class="section-inner">
    <div class="section-label">Schritt für Schritt</div>
    <h2 class="section-title">So funktioniert CarMeet</h2>
    <p class="section-text">
      In wenigen Schritten bist du dabei, von der Registrierung bis zum ersten Autotreffen.
    </p>

    <div class="steps-container">

      <div class="step-card" v-for="step in steps" :key="step.id">
        <div class="step-heading">
          {{ step.id }} - {{ step.title }}
        </div>

        <button class="details-btn" @click="showStep(step)">
          Details
        </button>

      </div>
    </div>
  </div>
</section>

    <div class="divider"></div>

    <!-- EVENTS -->
    <section id="events">
  <div class="section-inner">

    <div class="section-label">Events in deiner Nähe</div>
    <h2 class="section-title">Alle Treffen</h2>

    <p class="section-text">
      Die verfügbaren Events auf einen Blick.
    </p>

    <div class="event-cards-list">

      <div class="event-mini-card" v-for="event in events" :key="event.id">
        <div>
          <div class="event-mini-title">{{ event.title }}</div>
          <div class="event-mini-info">
            {{ event.location }} • {{ event.time }} • {{ event.spots }}
          </div>
        </div>
        <div class="event-bottom">

        <div 
          class="event-mini-badge"
          :class="event.category + '-badge'"
        >
          {{ event.category }}
        </div>

        <button class="details-btn" @click="showDetails(event)">
          Details
        </button>

</div>
      </div>

    </div>

  </div>
</section>

    <div class="divider"></div>

    <!-- ─── How to Manager ─── -->
<section id="how-to-manager">
  <div class="section-inner">
    <div class="upgrade-layout">
      <div>
        <div class="section-label">Eventmanager werden</div>
        <h2 class="section-title">Eigene Events organisieren</h2>
        <p class="section-text">
          Du möchtest selbst Autotreffen veranstalten? Mit dem Eventmanager-Abo 
          schaltest du mächtige Werkzeuge frei: einmalig bezahlen, dauerhaft nutzen.
        </p>

        <div class="upgrade-perks">
          <div class="perk">
            <div class="perk-icon">01</div>
            <div>
              <div class="perk-title">Treffpunkt setzen</div>
              <div class="perk-desc">Definiere den genauen Startpunkt deines Events.</div>
            </div>
          </div>
          <div class="perk">
            <div class="perk-icon">02</div>
            <div>
              <div class="perk-title">Zeit & Teilnehmerlimit festlegen</div>
              <div class="perk-desc">Bestimme Uhrzeit, maximale Teilnehmerzahl und Fahrzeugkategorie deines Events.</div>
            </div>
          </div>
          <div class="perk">
            <div class="perk-icon">03</div>
            <div>
              <div class="perk-title">Teilnehmerliste verwalten</div>
              <div class="perk-desc">Behalte den Überblick! Sieh jederzeit wer dabei ist und verwalte deine Events.</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="eventmanager-box">
          <div class="eventmanager-box-title">Eventmanager-Abo</div>
          <p class="eventmanager-box-price">19,99€ – einmalige Kosten</p>
          <p class="eventmanager-box-text">Erhalte direkten Zugriff auf das Eventmanager-Dashboard und organisiere deine eigenen Treffen mit flexiblen Optionen.</p>
          <a href="#" class="btn-upgrade">Jetzt Eventmanager werden</a>
        </div>
      </div>
    </div>
  </div>
</section>

    <!-- FOOTER -->
<footer>
  <div class="footer-top">

    <div class="footer-brand">
      <img src="./assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="footer-logo">

      <p>
        Die Plattform für Autoenthusiasten. Entdecke, vernetze dich und organisiere Autotreffen in deiner Nähe.
      </p>

      <div class="social-links">

        <a href="#" class="social-link" title="Instagram" aria-label="Instagram">
          <img src="./assets/picture/insta-icon.png" alt="Instagram Icon" class="social-icon" />
        </a>

        <a href="#" class="social-link" title="Twitter / X" aria-label="Twitter">
          <img src="./assets/picture/x-icon.jpg" alt="X Icon" class="social-icon" />
        </a>

        <a href="#" class="social-link" title="Facebook" aria-label="Facebook">
          <img src="./assets/picture/Facebook-icon.png" alt="Facebook Icon" class="social-icon" />
        </a>

        <a href="#" class="social-link" title="YouTube" aria-label="YouTube">
          <img src="./assets/picture/Yt-icon.png" alt="YouTube Icon" class="social-icon" />
        </a>

      </div>
    </div>

    <div class="footer-col">
      <h4>Plattform</h4>
      <ul>
        <li><a href="#what">Was ist CarMeet</a></li>
        <li><a href="#how">Wie es funktioniert</a></li>
        <li><a href="#events">Events entdecken</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Account</h4>
      <ul>
        <li><a href="#">Registrieren</a></li>
        <li><a href="#">Anmelden</a></li>
        <li><a href="#how-to-manager">Eventmanager</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Unternehmen</h4>
      <ul>
        <li><a href="#">Über uns</a></li>
        <li><a href="#">Impressum</a></li>
      </ul>
    </div>

  </div>

  <div class="footer-bottom">
    <div class="footer-copy">
      © 2026 CarMeet – Leon Gipser & Anil Korkmaz. Alle Rechte vorbehalten.
    </div>
  </div>
</footer>

  </div>
</template>



