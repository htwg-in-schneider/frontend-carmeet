<template>
  <div class="page-wrapper">
    <div class="page-inner">
      <router-link to="/" class="back-link">← Zurück zur Startseite</router-link>

      <div class="content-card">
        <div class="section-label">Rechtliches</div>
        <h1 class="page-title">Datenschutzerklärung</h1>

        <h2 class="card-heading">1. Allgemeines</h2>
        <p class="card-text">
          Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert dich
          darüber, wie wir mit deinen Daten umgehen. CarMeet ist ein universitäres Studienprojekt der HTWG
          Konstanz und erhebt keine personenbezogenen Daten zu kommerziellen Zwecken.
        </p>

        <h2 class="card-heading">2. Verantwortliche Stelle</h2>
        <p class="card-text">
          Leon Gipser &amp; Anil Korkmaz<br>
          HTWG Konstanz – Alfred-Wachtel-Straße 8, 78462 Konstanz<br>
          E-Mail:
          <a href="mailto:an871kor@htwg-konstanz.de" class="card-link">an871kor@htwg-konstanz.de</a>
        </p>

        <h2 class="card-heading">3. Erhobene Daten</h2>
        <p class="card-text">
          Beim Besuch dieser Website werden serverseitig technische Zugriffsdaten (IP-Adresse, Browsertyp,
          Uhrzeit) temporär erfasst. Diese Daten werden nicht dauerhaft gespeichert und nicht an Dritte
          weitergegeben.
        </p>

        <h2 class="card-heading">4. Authentifizierung (Auth0)</h2>
        <p class="card-text">
          Für die Nutzeranmeldung verwenden wir den Dienst Auth0 (Okta, Inc.). Bei der Registrierung und
          Anmeldung werden deine Anmeldedaten (E-Mail, Passwort) an Auth0 übertragen und dort verarbeitet.
          Weitere Informationen findest du in der
          <a href="https://auth0.com/privacy" target="_blank" rel="noopener noreferrer" class="card-link">
            Datenschutzerklärung von Auth0
          </a>.
        </p>

        <h2 class="card-heading">5. Feedback-Formular</h2>
        <p class="card-text">
          Das Feedback-Formular auf der Startseite nutzt einen mailto-Link. Die eingegebenen Daten
          (Name, E-Mail, Nachricht) werden ausschließlich in deinem lokalen E-Mail-Programm vorausgefüllt
          und nicht durch uns serverseitig verarbeitet.
        </p>

        <h2 class="card-heading">6. Deine Rechte</h2>
        <p class="card-text">
          Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
          Verarbeitung deiner gespeicherten personenbezogenen Daten. Wende dich dazu an die
          oben genannte E-Mail-Adresse.
        </p>

        <h2 class="card-heading">7. Hinweis</h2>
        <p class="card-text">
          Dieses Projekt dient ausschließlich Studienzwecken. Der Betrieb erfolgt ohne kommerzielle
          Absicht im Rahmen des Moduls Web-Technologien an der HTWG Konstanz (SoSe 2026).
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
  border-left: 3px solid #9955FF;
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
  color: #9955FF;
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
