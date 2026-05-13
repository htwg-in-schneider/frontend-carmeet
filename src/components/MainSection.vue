<script setup>
import { steps, events } from '../data.js'
import EventCard from './EventCard.vue'

function showStep(step) {
  alert(step.text)
}

function showDetails(event) {
  alert(event.description)
}
</script>

<template>
  <div>

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
            <img src="../assets/picture/bmw-gruppenfoto.jpg" alt="BMW Gruppenfoto" class="what-image">
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

    <!-- ─── EVENTS ─── -->
    <section id="events">
      <div class="section-inner">
        <div class="section-label">Events in deiner Nähe</div>
        <h2 class="section-title">Alle Treffen</h2>
        <p class="section-text">
          Die verfügbaren Events auf einen Blick.
        </p>

        <div class="event-cards-list">
          <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
            @show-details="showDetails"
          />
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- ─── HOW TO MANAGER ─── -->
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

  </div>
</template>

<style scoped>
/* ─── DIVIDER ─── */
.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #FA0BDB, #00DDFF, transparent);
  opacity: 0.4;
}

/* ─── SECTIONS ─── */
section {
  position: relative;
  z-index: 1;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 5%;
}

.section-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12.8px;
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(28.8px, 4vw, 48px);
  font-weight: 600;
  color: #FA0BDB;
  line-height: 1.15;
  margin-bottom: 19.2px;
}

.section-text {
  color: white;
  font-size: 16.8px;
  line-height: 1.75;
  max-width: 600px;
}

/* ─── WHAT IS CARMEET ─── */
.what-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.what-visual {
  position: relative;
}
.what-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  object-fit: cover;
}

/* ─── HOW IT WORKS ─── */
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 64px;
}

@media (min-width: 1000px) {
  .steps-container {
    grid-template-columns: repeat(3, minmax(240px, 1fr));
  }
}

.step-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 28.8px;
  min-height: 260px;
  position: relative;
  overflow: hidden;
}
.step-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 18px 40px rgba(0,0,0,0.25);
}

.step-heading {
  font-family: 'Orbitron', sans-serif;
  font-size: 15.2px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 16px;
  color: #00DDFF;
  text-transform: uppercase;
}

.details-btn {
  background: none;
  border: none;
  color: #00DDFF;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.details-btn:hover {
  color: #66eaff;
}

/* ─── EVENTS LIST ─── */
.event-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
}

/* ─── UPGRADE SECTION ─── */
.upgrade-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}
.btn-upgrade {
  display: inline-block;
  width: 100%;
  text-align: center;
  font-family: 'Orbitron', sans-serif;
  font-size: 11.2px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 14.4px 32px;
  border-radius: 50px;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
  border: none;
  text-decoration: none;
  box-shadow: 0 0 30px rgba(153,85,255,0.3);
  transition: box-shadow 0.3s;
}
.btn-upgrade:hover {
  box-shadow: 0 0 50px rgba(153,85,255,0.5);
}

.eventmanager-box {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(153,85,255,0.2);
  border-radius: 24px;
  padding: 32px;
  margin-top: 24px;
  max-width: 520px;
}
.eventmanager-box-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 19.2px;
  font-weight: 700;
  color: #00DDFF;
  margin-bottom: 8px;
}
.eventmanager-box-price {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 16px;
}
.eventmanager-box-text {
  color: #dcdce5;
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 24px;
}

.upgrade-perks {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 40px;
}
.perk {
  display: flex;
  gap: 19.2px;
  align-items: flex-start;
}
.perk-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: rgba(153,85,255,0.12);
  border: 1px solid rgba(153,85,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20.8px;
  flex-shrink: 0;
}
.perk-title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4.8px;
  color: #00DDFF;
}
.perk-desc {
  font-size: 14.4px;
  color: #FFFFFF;
  line-height: 1.6;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 900px) {
  .upgrade-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .eventmanager-box {
    max-width: 100%;
  }
  .what-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .section-inner { padding: 70px 5%; }
}
</style>
