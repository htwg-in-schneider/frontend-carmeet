<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProductById } from '../services/productService.js'

const route = useRoute()
const product = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    product.value = await getProductById(route.params.id)
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load product'
  }
})
</script>

<template>
  <div class="detail-wrapper">
    <router-link :to="{ path: '/', hash: '#products' }" class="back-link">← Zurück zur Produktliste</router-link>

    <div v-if="error" class="not-found">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="product" class="detail-card">
      <div class="detail-top">
        <div class="detail-images">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="detail-main-img"
          />
          <div v-else class="detail-img-placeholder"></div>
        </div>

        <div class="detail-info">
          <div v-if="product.category" class="detail-category">{{ product.category }}</div>
          <h1 class="detail-title">{{ product.name }}</h1>

          <dl class="detail-fields">
            <template v-if="product.id != null">
              <dt>ID</dt>
              <dd>{{ product.id }}</dd>
            </template>
            <template v-if="product.description">
              <dt>Beschreibung</dt>
              <dd>{{ product.description }}</dd>
            </template>
            <template v-if="product.price != null">
              <dt>Preis</dt>
              <dd>{{ product.price }} €</dd>
            </template>
            <template v-if="product.category">
              <dt>Kategorie</dt>
              <dd>{{ product.category }}</dd>
            </template>
          </dl>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Produkt wird geladen…</p>
    </div>
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
.back-link:hover {
  color: #66eaff;
}

.detail-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 40px;
}

.detail-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.detail-main-img {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

.detail-img-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0,221,255,0.06), rgba(250,11,219,0.06));
  border: 1px solid rgba(255,255,255,0.08);
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
  margin-bottom: 20px;
  line-height: 1.3;
}

.detail-fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 10px 24px;
  margin-top: 8px;
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
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  margin: 0;
}

.not-found {
  text-align: center;
  padding: 80px 0;
  color: #8b8fa8;
}

@media (max-width: 700px) {
  .detail-top {
    grid-template-columns: 1fr;
  }
}
</style>
