<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import NotificationToast from './components/NotificationToast.vue'

const route = useRoute()
const showGlobalNav = computed(() => !route.meta?.hideGlobalNav)
</script>

<template>
  <Navbar v-if="showGlobalNav" />
  <router-view />
  <Footer v-if="showGlobalNav" />
  <NotificationToast />
</template>
