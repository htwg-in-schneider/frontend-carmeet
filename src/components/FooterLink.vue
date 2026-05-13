<script setup>
defineProps({
  href: { type: String, default: '#' }
})
</script>

<template>
  <a :href="href" class="footer-link">
    <slot />
  </a>
</template>

<style scoped>
.footer-link {
  color: white;
  text-decoration: none;
  font-size: 14.4px;
}
.footer-link:hover {
  color: #00DDFF;
  transition: color 0.3s;
}
</style>
