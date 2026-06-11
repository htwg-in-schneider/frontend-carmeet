<template>
  <div class="page-wrapper">
    <div class="page-inner">
      <router-link to="/" class="back-link">← Zurück zur Startseite</router-link>

      <div class="content-card">
        <div class="section-label">Rechtliches</div>
        <h1 class="page-title">Impressum</h1>

        <h2 class="card-heading">Angaben gemäß § 5 TMG</h2>
        <p class="card-text">
          CarMeet – Hochschule Konstanz (HTWG)<br>
          Alfred-Wachtel-Straße 8<br>
          78462 Konstanz
        </p>

        <h2 class="card-heading">Vertreten durch</h2>
        <p class="card-text">
          Leon Gipser &amp; Anil Korkmaz<br>
          Studierende der HTWG Konstanz
        </p>

        <h2 class="card-heading">Kontakt</h2>
        <p class="card-text">
          E-Mail:
          <a href="mailto:an871kor@htwg-konstanz.de" class="card-link">an871kor@htwg-konstanz.de</a><br>
          E-Mail:
          <a href="mailto:le871gip@htwg-konstanz.de" class="card-link">le871gip@htwg-konstanz.de</a>
        </p>

        <h2 class="card-heading">Haftungsausschluss</h2>
        <p class="card-text">
          Dies ist ein universitäres Studienprojekt im Rahmen des Moduls Web-Technologien an der HTWG Konstanz.
          Die Inhalte dienen ausschließlich Demonstrationszwecken. Es wird keine Haftung für die Richtigkeit,
          Vollständigkeit oder Aktualität der Inhalte übernommen.
        </p>

        <h2 class="card-heading">Urheberrecht</h2>
        <p class="card-text">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
          deutschen Urheberrecht. © 2026 CarMeet – Leon Gipser &amp; Anil Korkmaz.
        </p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 60vh;
  padding: 80px 5% 120px;
}

.page-inner {
  max-width: 800px;
  margin: 0 auto;
}

.section-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 16px;
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 700;
  color: #FA0BDB;
  margin-bottom: 32px;
  line-height: 1.2;
}

.content-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid #00DDFF;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.card-heading {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 8px;
}

.card-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15.5px;
  line-height: 1.75;
}

.card-link {
  color: #00DDFF;
  text-decoration: none;
  transition: color 0.2s;
}

.card-link:hover {
  color: #66eaff;
}

.back-link {
  display: inline-block;
  margin-bottom: 40px;
  color: #00DDFF;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.back-link:hover {
  color: #66eaff;
}

@media (max-width: 600px) {
  .content-card {
    padding: 24px 20px;
  }
}
</style>
