<script setup>
defineProps({
  href: { type: String, default: '#' },
  to:   { type: [String, Object], default: null },
})
</script>

<template>
  <router-link v-if="to" :to="to" class="footer-link"><slot /></router-link>
  <a v-else :href="href" class="footer-link"><slot /></a>
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
