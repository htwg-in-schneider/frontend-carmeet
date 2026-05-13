<script setup>
defineProps({
  event: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['show-details'])
</script>

<template>
  <div class="event-mini-card">
    <div>
      <div class="event-mini-title">{{ event.title }}</div>
      <div class="event-mini-info">
        {{ event.location }} • {{ event.time }} • {{ event.spots }}
      </div>
    </div>
    <div class="event-bottom">
      <div class="event-mini-badge" :class="event.category + '-badge'">
        {{ event.category }}
      </div>
      <button class="details-btn" @click="emit('show-details', event)">
        Details
      </button>
    </div>
  </div>
</template>

<style scoped>
.event-mini-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid #00DDFF;
  border-radius: 10px;
  padding: 16px 19.2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14.4px;
}
.event-mini-card:nth-child(2) {
  border-left-color: #FA0BDB;
}
.event-mini-card:nth-child(3) {
  border-left-color: #9955FF;
}
.event-mini-card:hover {
  background: rgba(255,255,255,0.05);
}
.event-mini-title {
  font-weight: 600;
  margin-bottom: 3.2px;
}
.event-mini-info {
  font-size: 12.8px;
  color: #8b8fa8;
}
.event-mini-badge {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.8px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 4.8px 11.2px;
  border-radius: 20px;
  background: rgba(0,221,255,0.1);
  color: #00DDFF;
  border: 1px solid rgba(0,221,255,0.2);
}
.oldtimer-badge {
  color: #FA0BDB;
  border-color: rgba(250,11,219,0.2);
  background: rgba(250,11,219,0.08);
}

.event-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
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
</style>
