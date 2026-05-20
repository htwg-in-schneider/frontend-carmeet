<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const product = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch(`https://dummyjson.com/products/${route.params.id}`)
    product.value = await res.json()
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load product'
  }
})
</script>

<template>
  <div class="detail-wrapper">
    <router-link :to="{ path: '/', hash: '#dummy-products' }" class="back-link">← Zurück zu Dummy Products</router-link>

    <div v-if="error" class="not-found">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="product" class="detail-card">
      <div class="detail-top">
        <div class="detail-images">
          <img :src="product.thumbnail" :alt="product.title" class="detail-main-img" />
          <div class="detail-thumbs">
            <img
              v-for="(img, i) in product.images?.slice(0, 4)"
              :key="i"
              :src="img"
              :alt="product.title"
              class="detail-thumb"
            />
          </div>
        </div>

        <div class="detail-info">
          <div class="detail-category">{{ product.category }}</div>
          <h1 class="detail-title">{{ product.title }}</h1>
          <div v-if="product.brand" class="detail-brand">{{ product.brand }}</div>

          <div class="detail-meta">
            <span class="detail-rating">★ {{ product.rating }}</span>
            <span class="detail-stock">{{ product.stock }} auf Lager</span>
          </div>

          <p class="detail-description">{{ product.description }}</p>

          <div v-if="product.tags?.length" class="detail-tags">
            <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
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

.detail-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.detail-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
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
  margin-bottom: 8px;
  line-height: 1.3;
}

.detail-brand {
  font-size: 13px;
  color: #8b8fa8;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.detail-rating {
  font-size: 14px;
  color: #f5c518;
}

.detail-stock {
  font-size: 13px;
  color: #8b8fa8;
}

.detail-description {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255,255,255,0.8);
  margin-bottom: 24px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(0,221,255,0.08);
  color: #00DDFF;
  border: 1px solid rgba(0,221,255,0.2);
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
