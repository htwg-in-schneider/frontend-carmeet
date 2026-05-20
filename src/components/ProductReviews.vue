<script setup>
import { ref, onMounted } from 'vue'
import { getReviewsByProductId } from '../services/reviewService.js'

const props = defineProps({
  productId: {
    type: [Number, String],
    required: true,
  },
})

const reviews = ref([])
const loading = ref(true)
const error = ref(null)

function renderStars(count) {
  const n = Math.max(0, Math.min(5, Number(count) || 0))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

onMounted(async () => {
  if (!props.productId) {
    loading.value = false
    return
  }
  try {
    reviews.value = await getReviewsByProductId(props.productId)
  } catch (e) {
    console.error('[ProductReviews] Laden fehlgeschlagen:', e)
    error.value = `Reviews konnten nicht geladen werden: ${e.message}`
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="reviews-section">
    <h2 class="reviews-heading">Reviews</h2>

    <div v-if="loading" class="reviews-state">Reviews werden geladen…</div>
    <div v-else-if="error" class="reviews-state reviews-error">{{ error }}</div>
    <div v-else-if="reviews.length === 0" class="reviews-state">Keine Reviews vorhanden.</div>

    <div v-else class="reviews-list">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <span class="review-user">{{ review.userName }}</span>
          <span class="review-stars" :title="`${review.stars} von 5 Sternen`">
            {{ renderStars(review.stars) }}
          </span>
        </div>
        <p class="review-text">{{ review.text }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews-section {
  margin-top: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 36px;
}

.reviews-heading {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00DDFF;
  margin: 0 0 24px;
}

.reviews-state {
  padding: 32px 0;
  font-size: 14px;
  color: #8b8fa8;
  text-align: center;
}
.reviews-error {
  color: #FA0BDB;
}

.reviews-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.review-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 3px solid #9955FF;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-user {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
}

.review-stars {
  font-size: 14px;
  color: #FFB800;
  letter-spacing: 2px;
  flex-shrink: 0;
}

.review-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
}
</style>
