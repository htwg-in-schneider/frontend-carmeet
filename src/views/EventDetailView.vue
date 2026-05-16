<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '../stores/events.js'

const route = useRoute()
const store = useEventsStore()

onMounted(() => store.fetchEvents())

const event = computed(() => store.getEventById(Number(route.params.id)))
</script>

<template>
  <div class="detail-wrapper">

    <router-link to="/" class="back-link">← Zurück zur Übersicht</router-link>

    <div v-if="event" class="detail-card">
      <div class="detail-badge" :class="event.category + '-badge'">
        {{ event.category }}
      </div>

      <h1 class="detail-title">{{ event.title }}</h1>

      <div class="detail-meta">
        <span>📍 {{ event.address }}</span>
        <span>🕐 {{ event.date }}</span>
        <span>👥 {{ event.spots }} Teilnehmer</span>
      </div>

      <p class="detail-description">{{ event.description }}</p>
    </div>

    <div v-else class="not-found">
      <p>Event nicht gefunden.</p>
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

.detail-badge {
  display: inline-block;
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  background: rgba(0,221,255,0.1);
  color: #00DDFF;
  border: 1px solid rgba(0,221,255,0.2);
  margin-bottom: 24px;
}
.oldtimer-badge {
  color: #FA0BDB;
  border-color: rgba(250,11,219,0.2);
  background: rgba(250,11,219,0.08);
}

.detail-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(24px, 4vw, 42px);
  font-weight: 700;
  color: #FA0BDB;
  margin-bottom: 24px;
  line-height: 1.2;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
  font-size: 15px;
  color: #8b8fa8;
}

.detail-description {
  font-size: 17px;
  line-height: 1.8;
  color: white;
  margin-bottom: 40px;
}

.not-found {
  text-align: center;
  padding: 80px 0;
  color: #8b8fa8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
</style>
