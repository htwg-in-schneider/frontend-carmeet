<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'

const products = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('https://dummyjson.com/products')
    const data = await res.json()
    products.value = data.products
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load products'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dummy-wrapper">
    <div class="dummy-header">
      <div class="dummy-label">DummyJSON API</div>
      <h1 class="dummy-title">Dummy Products</h1>
      <p class="dummy-subtitle">Dynamisch geladen von dummyjson.com</p>
    </div>

    <div v-if="loading" class="state-msg">Produkte werden geladen…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <div v-else class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<style scoped>
.dummy-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 110px 5% 80px;
}

.dummy-header {
  margin-bottom: 48px;
}

.dummy-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #FA0BDB;
  margin-bottom: 12px;
}

.dummy-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.dummy-subtitle {
  font-size: 15px;
  color: #8b8fa8;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.state-msg {
  text-align: center;
  padding: 80px 0;
  font-size: 16px;
  color: #8b8fa8;
}
.state-msg.error {
  color: #FA0BDB;
}
</style>
