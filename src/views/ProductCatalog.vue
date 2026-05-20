<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { getProducts } from '../services/productService.js'

const products = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (e) {
    console.log(e)
    error.value = 'Produkte konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="catalog-wrapper">
    <div class="catalog-header">
      <div>
        <div class="catalog-label">Backend API</div>
        <h1 class="catalog-title">Produktkatalog</h1>
      </div>
      <router-link to="/products/create" class="btn-create">+ Neues Produkt</router-link>
    </div>

    <div v-if="loading" class="state-msg">Produkte werden geladen…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="state-msg">Keine Produkte vorhanden.</div>

    <div v-else class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<style scoped>
.catalog-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 110px 5% 80px;
}

.catalog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 48px;
  gap: 16px;
  flex-wrap: wrap;
}

.catalog-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 10px;
}

.catalog-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(26px, 4vw, 44px);
  font-weight: 700;
  color: #FA0BDB;
  margin: 0;
}

.btn-create {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 12px 24px;
  border-radius: 30px;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
  text-decoration: none;
  white-space: nowrap;
  align-self: center;
  box-shadow: 0 0 24px rgba(153,85,255,0.3);
  transition: box-shadow 0.3s;
}
.btn-create:hover {
  box-shadow: 0 0 40px rgba(153,85,255,0.5);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.state-msg {
  text-align: center;
  padding: 80px 0;
  font-size: 16px;
  color: #8b8fa8;
}
.state-msg.error { color: #FA0BDB; }
</style>
