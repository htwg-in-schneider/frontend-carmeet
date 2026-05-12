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

      <div class="step-card">
        <div class="step-heading">01 - Registrierung</div>
        <p class="step-desc">
          Erstelle deinen kostenlosen Account mit Benutzername, Name, E-Mail-Adresse 
          und Passwort. Die Registrierung dauert weniger als eine Minute.
        </p>
      </div>

      <div class="step-card">
        <div class="step-heading">02 - Anmelden</div>
        <p class="step-desc">
          Melde dich mit deiner E-Mail und deinem Passwort an.
        </p>
      </div>

      <div class="step-card">
        <div class="step-heading">03 - Fahrzeug anlegen</div>
        <p class="step-desc">
          Hinterlege dein Fahrzeug im Profil: Marke, Modell, Baujahr und Kategorie. 
          Dein Auto wird für die Teilnahme an kategorisierten Events benötigt.
        </p>
      </div>

      <div class="step-card">
        <div class="step-heading">04 - Events entdecken</div>
        <p class="step-desc">
          Dursuche die Liste der verfügbaren Events um Treffen in deiner Nähe zu finden.
        </p>
      </div>

      <div class="step-card">
        <div class="step-heading">05 - Event beitreten</div>
        <p class="step-desc">
          Wähle ein passendes Event aus und bestätige deine Teilnahme. Du wirst 
          sofort in die Teilnehmerliste eingetragen. Stornieren ist jederzeit möglich.
        </p>
      </div>

      <div class="step-card">
        <div class="step-heading">06 - Meet Up</div>
        <p class="step-desc">
          Erscheine zum Event, treffe Gleichgesinnte, tausche Erfahrungen aus und 
          entdecke faszinierende Fahrzeuge, ganz nach deinen Interessen.
        </p>
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

      <div class="event-mini-card">
        <div>
          <div class="event-mini-title">Coupe Night</div>
          <div class="event-mini-info">
            Alfred-Wachtel-Straße, 78462 Konstanz • Sa, 19:00 Uhr • 8/20 Plätze
          </div>
        </div>
        <div class="event-mini-badge">Coupes</div>
      </div>

      <div class="event-mini-card">
        <div>
          <div class="event-mini-title">Oldtimer Treffen</div>
          <div class="event-mini-info">
            Seestraße 21, 78464 Konstanz • So, 14:00 Uhr • 12/30 Plätze
          </div>
        </div>
        <div class="event-mini-badge oldtimer-badge">Oldtimer</div>
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



