<script setup>
defineProps({
  href: { type: String, default: '#' },
  variant: { type: String, default: 'accent' },
  size: { type: String, default: 'md' }
})
</script>

<template>
  <a :href="href" class="btn" :class="[variant, size]">
    <slot />
  </a>
</template>

<style scoped>
.btn {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  border-radius: 50px;
  border: none;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.md {
  font-size: 12px;
  padding: 14.4px 35.2px;
}
.sm {
  font-size: 10.4px;
  padding: 8px 19.2px;
  border-radius: 30px;
}

.accent {
  background: linear-gradient(90deg, #FA0BDB, #00DDFF);
  color: #FFFFFF;
  box-shadow: 0 0 30px rgba(250,11,219,0.3), 0 0 60px rgba(0,221,255,0.15);
}
.accent:hover {
  box-shadow: 0 0 40px rgba(250,11,219,0.5), 0 0 80px rgba(0,221,255,0.25);
  transform: translateY(-2px);
}

.secondary {
  background: transparent;
  color: #00DDFF;
  border: 1.5px solid #00DDFF;
}
.secondary:hover {
  background: rgba(0,221,255,0.08);
  transform: translateY(-2px);
}
</style>
