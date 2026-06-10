<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { createProduct } from '../services/productService.js'
import { getCategories } from '../services/categoryService.js'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const form = ref({ title: '', description: '', categoryId: '' })
const loading = ref(false)
const error = ref(null)
const successMsg = ref(null)
const categories = ref([])
const categoriesLoading = ref(true)

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (e) {
    console.error('[CreateProduct] Kategorien laden fehlgeschlagen:', e)
  } finally {
    categoriesLoading.value = false
  }
})

async function submit() {
  if (!form.value.title.trim()) {
    error.value = 'Titel ist erforderlich.'
    return
  }

  loading.value = true
  error.value = null
  successMsg.value = null

  const payload = {
    title: form.value.title,
    description: form.value.description,
    category: form.value.categoryId ? { id: Number(form.value.categoryId) } : undefined,
  }

  try {
    const token = await getAccessTokenSilently()
    await createProduct(payload, token)
    successMsg.value = 'Fahrzeug erfolgreich erstellt.'
    setTimeout(() => router.push('/products'), 1400)
  } catch (e) {
    error.value = `Fehler beim Erstellen: ${e.message}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-wrapper">
    <router-link to="/products" class="back-link">← Zurück zum Katalog</router-link>

    <div class="form-card">
      <div class="form-header">
        <div class="form-label">Admin</div>
        <h1 class="form-title">Neues Fahrzeug</h1>
      </div>

      <div v-if="error" class="alert-error">{{ error }}</div>
      <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>

      <form @submit.prevent="submit" class="form">
        <div class="field">
          <label>Titel</label>
          <input v-model="form.title" type="text" placeholder="z. B. BMW 320i" />
        </div>

        <div class="field">
          <label>Beschreibung</label>
          <textarea v-model="form.description" rows="4" placeholder="Fahrzeugbeschreibung…" />
        </div>

        <div class="field">
          <label>Kategorie</label>
          <select v-model="form.categoryId" :disabled="categoriesLoading">
            <option value="">— Keine Kategorie —</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.nameDe || cat.name }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <router-link to="/products" class="btn-cancel">Abbrechen</router-link>
          <button type="submit" class="btn-submit" :disabled="loading || !!successMsg">
            {{ loading ? 'Wird gespeichert…' : 'Erstellen' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrapper {
  max-width: 640px;
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

.form-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 40px;
}

.form-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #FA0BDB;
  margin-bottom: 10px;
}

.form-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 700;
  color: white;
  margin: 0 0 32px;
}

.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px;
  padding: 12px 16px;
  color: #ff7070;
  font-size: 14px;
  margin-bottom: 24px;
}

.alert-success {
  background: rgba(0,221,150,0.08);
  border: 1px solid rgba(0,221,150,0.3);
  border-radius: 10px;
  padding: 12px 16px;
  color: #00dd96;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8b8fa8;
}

.field input,
.field textarea,
.field select {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
}
.field input:focus,
.field textarea:focus,
.field select:focus { border-color: rgba(0,221,255,0.5); }
.field select option { background: #272736; color: white; }
.field select:disabled { opacity: 0.5; cursor: not-allowed; }

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 11px 22px;
  border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.15);
  color: #8b8fa8;
  text-decoration: none;
  transition: border-color 0.2s;
}
.btn-cancel:hover { border-color: rgba(255,255,255,0.3); color: white; }

.btn-submit {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 11px 28px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(153,85,255,0.3);
  transition: box-shadow 0.3s, opacity 0.2s;
}
.btn-submit:hover { box-shadow: 0 0 36px rgba(153,85,255,0.5); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
