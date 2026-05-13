<script setup>
</script>

<template>
  <footer>
    <div class="footer-top">

      <div class="footer-brand">
        <img src="../assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="footer-logo">

        <p>
          Die Plattform für Autoenthusiasten. Entdecke, vernetze dich und organisiere Autotreffen in deiner Nähe.
        </p>

        <div class="social-links">
          <a href="#" class="social-link" title="Instagram" aria-label="Instagram">
            <img src="../assets/picture/insta-icon.png" alt="Instagram Icon" class="social-icon" />
          </a>
          <a href="#" class="social-link" title="Twitter / X" aria-label="Twitter">
            <img src="../assets/picture/x-icon.jpg" alt="X Icon" class="social-icon" />
          </a>
          <a href="#" class="social-link" title="Facebook" aria-label="Facebook">
            <img src="../assets/picture/Facebook-icon.png" alt="Facebook Icon" class="social-icon" />
          </a>
          <a href="#" class="social-link" title="YouTube" aria-label="YouTube">
            <img src="../assets/picture/Yt-icon.png" alt="YouTube Icon" class="social-icon" />
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
</template>

<style scoped>
footer {
  background: #272736;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 48px 5% 32px;
  position: relative;
}
.footer-top {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.footer-brand p {
  font-size: 14.4px;
  color: white;
  margin-top: 16px;
  line-height: 1.7;
  max-width: 280px;
}
.footer-logo {
  display: block;
  width: min(180px, 100%);
  height: auto;
  max-height: 56px;
}
.footer-col h4 {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 19.2px;
}
.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9.6px;
}
.footer-col ul li a {
  color: white;
  text-decoration: none;
  font-size: 14.4px;
}

.social-links {
  display: flex;
  gap: 11.2px;
  margin-top: 24px;
}
.social-link {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.social-link:hover {
  background: rgba(0,221,255,0.1);
  border-color: rgba(0,221,255,0.3);
}
.social-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.footer-bottom {
  max-width: 1200px;
  margin: 32px auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-copy {
  font-size: 13.12px;
  color: grey;
}

@media (max-width: 900px) {
  .footer-top { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .footer-top { grid-template-columns: 1fr; gap: 32px; }
  .footer-bottom { flex-direction: column; text-align: center; }
}
</style>
