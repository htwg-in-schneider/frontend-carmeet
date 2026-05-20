<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories } from '../services/categoryService.js'

const route = useRoute()
const router = useRouter()

const searchName = ref(route.query.name || '')
const selectedCategory = ref(route.query.category || '')
const categories = ref([])
const categoriesLoading = ref(true)
const categoriesError = ref(null)

watch(() => route.query.category, (val) => { selectedCategory.value = val || '' })
watch(() => route.query.name,     (val) => { searchName.value = val || '' })

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (e) {
    console.error('[ProductFilter] Kategorien laden fehlgeschlagen:', e)
    categoriesError.value = 'Kategorien konnten nicht geladen werden.'
  } finally {
    categoriesLoading.value = false
  }
})

function applyFilter() {
  const query = {}
  if (searchName.value.trim()) query.name = searchName.value.trim()
  if (selectedCategory.value !== '') query.category = selectedCategory.value
  router.push({ query })
}

function resetFilter() {
  router.push({ query: {} })
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-fields">
      <div class="filter-field">
        <label class="filter-label">Suche</label>
        <input
          v-model="searchName"
          type="text"
          placeholder="z. B. BMW"
          class="filter-input"
          @keyup.enter="applyFilter"
        />
      </div>

      <div class="filter-field">
        <label class="filter-label">Kategorie</label>
        <select v-model="selectedCategory" class="filter-input" :disabled="categoriesLoading">
          <option value="">Alle Kategorien</option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.nameDe || cat.name }}
          </option>
        </select>
        <span v-if="categoriesError" class="filter-error">{{ categoriesError }}</span>
      </div>
    </div>

    <div class="filter-actions">
      <button class="btn-reset" type="button" @click="resetFilter">Zurücksetzen</button>
      <button class="btn-apply" type="button" @click="applyFilter">Filter anwenden</button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 32px;
}

.filter-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  flex: 1;
}

.filter-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8b8fa8;
}

.filter-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: white;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  appearance: none;
}
.filter-input:focus {
  border-color: rgba(0,221,255,0.5);
}
.filter-input option {
  background: #272736;
  color: white;
}
.filter-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-error {
  font-size: 11px;
  color: #FA0BDB;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}

.btn-reset {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: #8b8fa8;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-reset:hover {
  border-color: rgba(255,255,255,0.3);
  color: white;
}

.btn-apply {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #00DDFF, #9955FF);
  color: white;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(0,221,255,0.2);
  transition: box-shadow 0.3s;
}
.btn-apply:hover {
  box-shadow: 0 0 28px rgba(0,221,255,0.4);
}
</style>
