<script setup>
import AdminNavbar from '../components/AdminNavbar.vue'
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />
    <main class="admin-main">
      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Events</h1>
        <p class="page-sub">Veranstaltungen verwalten — wird zukünftig implementiert.</p>
      </div>
      <div class="placeholder-box">
        <div class="placeholder-icon"></div>
        <div class="placeholder-text">Diese Funktion ist noch in Entwicklung.</div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout { min-height: 100vh; background:
  radial-gradient(ellipse 80% 60% at top left, rgba(250,11,219,0.08) 0%, transparent 55%),
  radial-gradient(ellipse 60% 40% at bottom right, rgba(0,221,255,0.06) 0%, transparent 55%),
  #272736; }

.admin-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 112px 5% 80px;
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

.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  border: 1px dashed rgba(250, 11, 219, 0.12);
  border-radius: 20px;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(250, 11, 219, 0.05);
  border: 1px solid rgba(250, 11, 219, 0.15);
}

.placeholder-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}
</style>
