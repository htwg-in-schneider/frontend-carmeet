<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { steps } from '../data.js'

const route = useRoute()

const step = computed(() => steps.find(s => s.id === Number(route.params.id)))
</script>

<template>
  <div class="detail-wrapper">

    <router-link to="/" class="back-link">← Zurück zur Übersicht</router-link>

    <div v-if="step" class="detail-card">
      <div class="step-number">{{ step.id }}</div>

      <h1 class="detail-title">{{ step.title }}</h1>

      <p class="detail-description">{{ step.text }}</p>
    </div>

    <div v-else class="not-found">
      <p>Schritt nicht gefunden.</p>
    </div>

  </div>
</template>

<style scoped>
.detail-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 120px 5% 80px;
}

.back-link {
  display: inline-block;
  color: #00DDFF;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 40px;
}
.back-link:hover {
  color: #66eaff;
}

.detail-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 48px;
}

.step-number {
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 800;
  color: rgba(0,221,255,0.15);
  margin-bottom: 16px;
  line-height: 1;
}

.detail-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(24px, 4vw, 42px);
  font-weight: 700;
  color: #FA0BDB;
  margin-bottom: 24px;
  line-height: 1.2;
}

.detail-description {
  font-size: 17px;
  line-height: 1.8;
  color: white;
}

.not-found {
  text-align: center;
  padding: 80px 0;
  color: #8b8fa8;
}
</style>
