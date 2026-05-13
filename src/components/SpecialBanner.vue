<script setup>
import Button from './Button.vue'
</script>

<template>
  <section id="top">
    <div class="top-grid"></div>
    <div class="top-glow top-glow-1"></div>
    <div class="top-glow top-glow-2"></div>
    <div class="top-glow top-glow-3"></div>

    <div class="top-badge">Die Plattform für Autoenthusiasten</div>

    <h1 class="top-title">
      <img src="../assets/picture/CarMeet_Logo.png" alt="CarMeet Logo" class="top-logo">
    </h1>

    <p class="top-sub">
      Entdecke Autotreffen in deiner Nähe, verbinde dich mit Gleichgesinnten und organisiere deine eigenen Events.
    </p>

    <div class="top-btn">
      <Button href="#" variant="accent">Jetzt kostenlos starten</Button>
      <Button href="#how" variant="secondary">Wie es funktioniert</Button>
    </div>
  </section>
</template>

<style scoped>
#top {
  background: #272736;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 5% 80px;
}

.top-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}
.top-glow-1 {
  width: 600px; height: 400px;
  background: rgba(250, 11, 219, 0.18);
  top: -100px; left: -150px;
}
.top-glow-2 {
  width: 500px; height: 400px;
  background: rgba(0, 221, 255, 0.15);
  bottom: -50px; right: -100px;
}
.top-glow-3 {
  width: 300px; height: 300px;
  background: rgba(153, 85, 255, 0.2);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

.top-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 221, 255, 0.12);
  border: 1px solid rgba(0, 221, 255, 0.35);
  border-radius: 30px;
  padding: 6.4px 19.2px;
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  letter-spacing: 1.2px;
  color: #00DDFF;
  text-transform: uppercase;
  margin-bottom: 32px;
  position: relative;
}

.top-title {
  position: relative;
  margin-bottom: 24px;
}
.top-logo {
  width: min(80vw, 420px);
  height: auto;
  display: block;
}
.top-sub {
  font-size: 18px;
  color: white;
  font-weight: 500;
  max-width: 600px;
  line-height: 1.7;
  position: relative;
  margin-bottom: 40px;
}

.top-btn {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
}


@media (max-width: 600px) {
  .top-btn { flex-direction: column; align-items: center; }
  .btn-primary { width: 100%; text-align: center; max-width: 320px; }
}
</style>
