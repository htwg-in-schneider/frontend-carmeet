<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import AdminNavbar from '../components/AdminNavbar.vue'

const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.profile) {
    await userStore.fetchProfile()
  }
  if (!userStore.isAdmin) {
    router.replace('/')
  }
})
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />

    <main class="admin-main">
      <div v-if="userStore.loading" class="state-msg">Wird geladen…</div>

      <template v-else-if="userStore.isAdmin">
        <div class="page-header">
        <div class="page-label">Eingeschränkter Bereich</div>
          <h1 class="page-title">Admin-Dashboard</h1>
          <p class="page-sub">Verwalte Nutzer, Events und Fahrzeugkategorien.</p>
        </div>

        <div class="cards-grid">
          <router-link to="/admin/users" class="dash-card">
            <div class="card-accent"></div>
            <div class="card-body">
              <div class="card-title">Nutzerverwaltung</div>
              <div class="card-desc">Benutzer anzeigen, bearbeiten, Rollen vergeben und Konten sperren.</div>
              <span class="card-link">Nutzer verwalten →</span>
            </div>
          </router-link>

          <router-link to="/admin/events" class="dash-card">
            <div class="card-accent"></div>
            <div class="card-body">
              <div class="card-title">Events</div>
              <div class="card-desc">Veranstaltungen erstellen, bearbeiten und verwalten.</div>
              <span class="card-link">Events verwalten →</span>
            </div>
          </router-link>

          <router-link to="/admin/categories" class="dash-card">
            <div class="card-accent"></div>
            <div class="card-body">
              <div class="card-title">Fahrzeugkategorien</div>
              <div class="card-desc">Kategorien anlegen, umbenennen und löschen.</div>
              <span class="card-link">Kategorien verwalten →</span>
            </div>
          </router-link>

          <router-link to="/products" class="dash-card dash-card-secondary">
            <div class="card-accent card-accent-secondary"></div>
            <div class="card-body">
              <div class="card-title">Fahrzeugkatalog</div>
              <div class="card-desc">Den öffentlichen Fahrzeugkatalog anzeigen und Fahrzeuge direkt verwalten.</div>
              <span class="card-link card-link-secondary">Zum Katalog →</span>
            </div>
          </router-link>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background:
  radial-gradient(ellipse 80% 60% at top left, rgba(250,11,219,0.08) 0%, transparent 55%),
  radial-gradient(ellipse 60% 40% at bottom right, rgba(0,221,255,0.06) 0%, transparent 55%),
  #272736;
}

.admin-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 112px 5% 80px;
}

.state-msg {
  text-align: center;
  padding: 60px 0;
  color: #8b8fa8;
}


.page-header { margin-bottom: 48px; }

.page-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 12px;
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(24px, 4vw, 40px);
  font-weight: 700;
  color: #FA0BDB;
  margin: 0 0 10px;
}

.page-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.dash-card {
  display: flex;
  gap: 0;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(250, 11, 219, 0.15);
  border-radius: 16px;
  text-decoration: none;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
}
.dash-card:hover {
  border-color: rgba(250, 11, 219, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(250, 11, 219, 0.1);
}

.dash-card-secondary {
  border-color: rgba(0, 221, 255, 0.12);
}
.dash-card-secondary:hover {
  border-color: rgba(0, 221, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 221, 255, 0.08);
}

.card-accent {
  width: 4px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #FA0BDB, #9955FF);
}

.card-accent-secondary {
  background: linear-gradient(180deg, #00DDFF, #0088cc);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 26px 24px;
}

.card-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

.card-link {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #FA0BDB;
  margin-top: 4px;
}

.card-link-secondary {
  color: #00DDFF;
}
</style>
