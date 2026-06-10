<script setup>
// Auth0 SDK processes the ?code=...&state=... query params automatically.
// This view is just a visual placeholder while that happens.
// The UserMenu watcher fires once isAuthenticated becomes true and redirects.
</script>

<template>
  <div class="callback-page">
    <div class="spinner"></div>
    <p class="callback-text">Anmeldung wird verarbeitet…</p>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  background: #080818;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 221, 255, 0.15);
  border-top-color: #00DDFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.callback-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}
</style>
