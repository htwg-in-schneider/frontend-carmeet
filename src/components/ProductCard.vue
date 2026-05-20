<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <router-link :to="'/products/' + product.id" class="product-card">
    <div v-if="product.category" class="product-category">{{ product.category }}</div>

    <dl class="product-fields">
      <template v-if="product.id != null">
        <dt>ID</dt>
        <dd>{{ product.id }}</dd>
      </template>
      <template v-if="product.name">
        <dt>Name</dt>
        <dd>{{ product.name }}</dd>
      </template>
      <template v-if="product.description">
        <dt>Beschreibung</dt>
        <dd class="product-desc">{{ product.description }}</dd>
      </template>
      <template v-if="product.price != null">
        <dt>Preis</dt>
        <dd>{{ product.price }} €</dd>
      </template>
    </dl>
  </router-link>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid #00DDFF;
  border-radius: 14px;
  padding: 20px 22px;
  text-decoration: none;
  color: white;
  transition: border-color 0.3s, background 0.3s;
  gap: 12px;
}
.product-card:hover {
  background: rgba(255,255,255,0.06);
  border-left-color: #FA0BDB;
}

.product-category {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #FA0BDB;
}

.product-fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  margin: 0;
}

.product-fields dt {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8b8fa8;
  padding-top: 2px;
}

.product-fields dd {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  margin: 0;
  line-height: 1.4;
}

.product-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
}
</style>
