<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <router-link :to="'/dummy-products/' + product.id" class="product-card">
    <div class="product-thumb-wrapper">
      <img :src="product.thumbnail" :alt="product.title" class="product-thumb" />
    </div>
    <div class="product-info">
      <div class="product-category">{{ product.category }}</div>
      <div class="product-title">{{ product.title }}</div>
      <div class="product-footer">
        <span class="product-rating">★ {{ product.rating }}</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: white;
  transition: border-color 0.3s, background 0.3s;
}
.product-card:hover {
  border-color: rgba(250,11,219,0.4);
  background: rgba(255,255,255,0.06);
}

.product-thumb-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
}
.product-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.product-card:hover .product-thumb {
  transform: scale(1.05);
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.product-category {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #FA0BDB;
}

.product-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: white;
}

.product-footer {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.product-rating {
  font-size: 12px;
  color: #8b8fa8;
}
</style>
