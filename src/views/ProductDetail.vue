<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProductById } from '../services/productService.js'
import ProductReviews from '../components/ProductReviews.vue'

const route = useRoute()
const product = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    product.value = await getProductById(route.params.id)
  } catch (e) {
    console.error('[ProductDetail] Laden fehlgeschlagen:', e)
    error.value = 'Produkt konnte nicht geladen werden.'
  }
})
</script>

<template>
  <div class="detail-wrapper">
    <router-link to="/products" class="back-link">← Zurück zum Autokatalog</router-link>

    <div v-if="error" class="state-msg error">{{ error }}</div>

    <div v-else-if="!product" class="state-msg">Produkt wird geladen…</div>

    <template v-else>
      <div class="detail-card">
        <div class="detail-img-placeholder"></div>

        <div class="detail-info">
          <div v-if="product.category" class="detail-category">
            {{ product.category.nameDe || product.category.name }}
          </div>
          <h1 class="detail-title">{{ product.title }}</h1>
          <p v-if="product.description" class="detail-desc">{{ product.description }}</p>

          <dl class="detail-fields">
            <dt>ID</dt>
            <dd>{{ product.id }}</dd>
          </dl>
        </div>
      </div>

      <ProductReviews :productId="product.id" />
    </template>
  </div>
</template>

<style scoped>
.detail-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 110px 5% 80px;
}

.back-link {
  display: inline-block;
  color: #00DDFF;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 40px;
}
.back-link:hover { color: #66eaff; }

.state-msg {
  text-align: center;
  padding: 80px 0;
  font-size: 16px;
  color: #8b8fa8;
}
.state-msg.error { color: #FA0BDB; }

.detail-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
}

.detail-img-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0,221,255,0.06), rgba(250,11,219,0.06));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-category {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #FA0BDB;
  margin-bottom: 12px;
}

.detail-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 700;
  color: white;
  margin: 0 0 16px;
  line-height: 1.3;
}

.detail-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin: 0 0 20px;
}

.detail-fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 20px;
}

.detail-fields dt {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8b8fa8;
  padding-top: 3px;
}

.detail-fields dd {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

@media (max-width: 700px) {
  .detail-card { grid-template-columns: 1fr; }
}
</style>
