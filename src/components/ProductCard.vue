<script setup>
import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import { deleteProduct } from '../services/productService.js'

const props = defineProps({
  product: { type: Object, required: true }
})
const emit = defineEmits(['deleted'])

const { getAccessTokenSilently } = useAuth0()
const userStore = useUserStore()

const confirmingDelete = ref(false)
const deleting = ref(false)

async function handleDelete() {
  deleting.value = true
  try {
    const token = await getAccessTokenSilently()
    await deleteProduct(props.product.id, token)
    emit('deleted', props.product.id)
  } catch (e) {
    console.error('Delete failed:', e)
  } finally {
    deleting.value = false
    confirmingDelete.value = false
  }
}
</script>

<template>
  <div class="product-card">
    <div class="card-top">
      <div v-if="product.category" class="product-category">
        {{ product.category.nameDe || product.category.name || product.category }}
      </div>
      <h3 class="product-title">{{ product.title }}</h3>
      <p v-if="product.description" class="product-desc">{{ product.description }}</p>
    </div>

    <div class="card-actions">
      <router-link :to="'/products/' + product.id" class="btn-detail">
        Details
      </router-link>
      <router-link v-if="userStore.isAdmin" :to="'/products/edit/' + product.id" class="btn-edit">
        Bearbeiten
      </router-link>
      <button
        v-if="userStore.isAdmin && !confirmingDelete"
        class="btn-delete"
        @click="confirmingDelete = true"
      >
        Löschen
      </button>
      <template v-if="confirmingDelete">
        <button class="btn-delete-confirm" :disabled="deleting" @click="handleDelete">
          {{ deleting ? '…' : 'Sicher?' }}
        </button>
        <button class="btn-cancel-delete" @click="confirmingDelete = false">Abbrechen</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid #00DDFF;
  border-radius: 14px;
  padding: 20px 22px;
  gap: 16px;
  transition: background 0.3s, border-color 0.3s;
}
.product-card:hover {
  background: rgba(255,255,255,0.06);
}

.card-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-category {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #FA0BDB;
}

.product-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.4;
}

.product-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.btn-detail {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #00DDFF, #9955FF);
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}
.btn-detail:hover { opacity: 0.85; }

.btn-edit {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0,221,255,0.35);
  color: #00DDFF;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}
.btn-edit:hover {
  background: rgba(0,221,255,0.08);
  border-color: #00DDFF;
}

.btn-delete {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,60,60,0.3);
  background: none;
  color: #ff5555;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-delete:hover { background: rgba(255,60,60,0.08); }

.btn-delete-confirm {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ff3333, #cc0000);
  color: white;
  cursor: pointer;
}
.btn-delete-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel-delete {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  background: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
}
.btn-cancel-delete:hover { color: white; }
</style>
