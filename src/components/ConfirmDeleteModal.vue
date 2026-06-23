<script setup>
defineProps({
  title:   { type: String, default: 'Löschen bestätigen' },
  message: { type: String, default: 'Diese Aktion kann nicht rückgängig gemacht werden.' },
  loading: { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('cancel')">
      <div class="modal">
        <div class="modal-icon">⚠</div>
        <div class="modal-title">{{ title }}</div>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" :disabled="loading" @click="$emit('cancel')">
            Abbrechen
          </button>
          <button class="btn-delete" :disabled="loading" @click="$emit('confirm')">
            {{ loading ? 'Wird gelöscht…' : 'Endgültig löschen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal {
  background: #1e1e2e;
  border: 1px solid rgba(255, 60, 60, 0.35);
  border-radius: 20px;
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 40px rgba(255, 60, 60, 0.12), 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slide-up 0.18s ease;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-icon {
  font-size: 28px;
  margin-bottom: 14px;
  color: #ff5555;
  filter: drop-shadow(0 0 8px rgba(255, 60, 60, 0.5));
}

.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
  margin-bottom: 10px;
}

.modal-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
  margin: 0 0 28px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-cancel {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 11px 22px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.btn-cancel:hover:not(:disabled) {
  color: white;
  border-color: rgba(255, 255, 255, 0.35);
}
.btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-delete {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 11px 22px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ff3333, #cc0000);
  color: white;
  cursor: pointer;
  transition: box-shadow 0.2s, opacity 0.2s;
}
.btn-delete:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(255, 60, 60, 0.45);
}
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
