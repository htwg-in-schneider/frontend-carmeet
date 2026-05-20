<script setup>
import { ref, onMounted } from 'vue'
import SpecialBanner from '../components/SpecialBanner.vue'
import MainSection from '../components/MainSection.vue'
import ProductCard from '../components/ProductCard.vue'
import { getProducts } from '../services/productService.js'

const products = ref([])
const productsError = ref(null)
const productsLoading = ref(true)

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (e) {
    console.log(e)
    productsError.value = 'Failed to load products'
  } finally {
    productsLoading.value = false
  }
})
</script>

<template>
  <SpecialBanner />
  <MainSection />

  <div class="divider"></div>

  <section id="products">
    <div class="section-inner">
      <div class="section-label">Backend API</div>
      <h2 class="section-title">Products</h2>
      <p class="section-text">Geladen von localhost:8081/api/product</p>

      <div v-if="productsLoading" class="state-msg">Produkte werden geladen…</div>
      <div v-else-if="productsError" class="state-msg error">{{ productsError }}</div>
      <div v-else-if="products.length === 0" class="state-msg">Keine Produkte gefunden.</div>
      <div v-else class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #FA0BDB, #00DDFF, transparent);
  opacity: 0.4;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 5%;
}

.section-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(28.8px, 4vw, 48px);
  font-weight: 600;
  color: #FA0BDB;
  line-height: 1.15;
  margin-bottom: 19.2px;
}

.section-text {
  color: white;
  font-size: 16.8px;
  line-height: 1.75;
  margin-bottom: 48px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.state-msg {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #8b8fa8;
}
.state-msg.error {
  color: #FA0BDB;
}
</style>
