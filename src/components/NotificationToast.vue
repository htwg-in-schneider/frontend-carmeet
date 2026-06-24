<script setup>
import { useNotificationsStore } from '../stores/notificationsStore.js'
const ns = useNotificationsStore()
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="n in ns.items"
        :key="n.id"
        class="toast"
        :class="`toast-${n.type}`"
      >
        <div class="toast-body">
          <p class="toast-msg">{{ n.message }}</p>
          <div v-if="n.actions?.length" class="toast-actions">
            <router-link
              v-for="a in n.actions"
              :key="a.label"
              :to="a.to"
              class="toast-link"
              @click="ns.dismiss(n.id)"
            >{{ a.label }}</router-link>
          </div>
        </div>
        <button class="toast-close" @click="ns.dismiss(n.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid;
  backdrop-filter: blur(12px);
  pointer-events: all;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.toast-info {
  background: rgba(0,221,255,0.08);
  border-color: rgba(0,221,255,0.25);
  color: rgba(255,255,255,0.85);
}

.toast-warning {
  background: rgba(255,170,0,0.08);
  border-color: rgba(255,170,0,0.3);
  color: rgba(255,255,255,0.85);
}

.toast-danger {
  background: rgba(255,60,60,0.08);
  border-color: rgba(255,60,60,0.3);
  color: rgba(255,255,255,0.85);
}

.toast-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast-msg {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.toast-actions {
  display: flex;
  gap: 12px;
}

.toast-link {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #00DDFF;
  text-decoration: none;
  border-bottom: 1px solid rgba(0,221,255,0.3);
  padding-bottom: 1px;
  transition: color 0.15s;
}
.toast-link:hover { color: #66eaff; }

.toast-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
  transition: color 0.15s;
}
.toast-close:hover { color: rgba(255,255,255,0.7); }

/* Transition */
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to   { opacity: 0; transform: translateX(40px); }
</style>
