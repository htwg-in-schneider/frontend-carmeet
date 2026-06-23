<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import ProductFilter from '../components/ProductFilter.vue'
import { getProducts } from '../services/productService.js'

const route = useRoute()

const products = ref([])
const loading = ref(true)
const error = ref(null)

async function loadProducts(filter = {}) {
  loading.value = true
  error.value = null
  try {
    products.value = await getProducts(filter)
    console.log(`[ProductCatalog] Loaded ${products.value.length} products`, filter)
  } catch (e) {
    console.error('[ProductCatalog] Laden fehlgeschlagen:', e)
    error.value = `Produkte konnten nicht geladen werden: ${e.message}`
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query,
  (query) => {
    loadProducts({
      name: query.name || undefined,
      category: query.category || undefined,
    })
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="catalog-wrapper">
    <div class="catalog-header">
      <div>
        <div class="catalog-label">Backend API</div>
        <h1 class="catalog-title">Autokatalog</h1>
      </div>
    </div>

    <ProductFilter />

    <div v-if="loading" class="state-msg">Produkte werden geladen…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="state-msg">
      Keine Produkte gefunden.
    </div>

    <div v-else class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @deleted="id => products = products.filter(p => p.id !== id)"
      />
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
  margin-bottom: 32px;
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.state-msg {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #8b8fa8;
}
.state-msg.error { color: #FA0BDB; }
</style>
