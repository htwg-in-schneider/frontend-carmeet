<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { getProducts } from '../services/productService.js'

const products = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load products'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="products-wrapper">
    <div class="products-header">
      <div class="products-label">Backend API</div>
      <h1 class="products-title">Products</h1>
      <p class="products-subtitle">Geladen von localhost:8081/api/product</p>
    </div>

    <div v-if="loading" class="state-msg">Produkte werden geladen…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="state-msg">Keine Produkte gefunden.</div>

    <div v-else class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<style scoped>
.products-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 110px 5% 80px;
}

.products-header {
  margin-bottom: 48px;
}

.products-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 12px;
}

.products-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 700;
  color: #FA0BDB;
  margin-bottom: 12px;
}

.products-subtitle {
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
