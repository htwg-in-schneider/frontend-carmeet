<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById, updateProduct, deleteProduct } from '../services/productService.js'

const route = useRoute()
const router = useRouter()

const form = ref({ title: '', description: '', categoryId: '' })
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

onMounted(async () => {
  console.log('[EditProduct] route.params.id:', route.params.id)
  try {
    const product = await getProductById(route.params.id)
    console.log('[EditProduct] Loaded product:', product)
    form.value.title = product.title ?? ''
    form.value.description = product.description ?? ''
    form.value.categoryId = product.category?.id ?? ''
  } catch (e) {
    console.error('[EditProduct] Laden fehlgeschlagen:', e)
    error.value = `Produkt konnte nicht geladen werden: ${e.message}`
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!form.value.title.trim()) {
    error.value = 'Titel ist erforderlich.'
    return
  }

  saving.value = true
  error.value = null

  const payload = {
    title: form.value.title,
    description: form.value.description,
    category: form.value.categoryId ? { id: Number(form.value.categoryId) } : undefined,
  }
  console.log(`[EditProduct] PUT id=${route.params.id}`, JSON.stringify(payload))

  try {
    await updateProduct(route.params.id, payload)
    alert('Produkt erfolgreich gespeichert!')
    router.push('/products')
  } catch (e) {
    console.error('[EditProduct] Speichern fehlgeschlagen:', e)
    error.value = `Fehler beim Speichern: ${e.message}`
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Produkt wirklich löschen?')) return

  try {
    console.log(`[EditProduct] DELETE id=${route.params.id}`)
    await deleteProduct(route.params.id)
    alert('Produkt gelöscht.')
    router.push('/products')
  } catch (e) {
    console.error('[EditProduct] Löschen fehlgeschlagen:', e)
    error.value = `Fehler beim Löschen: ${e.message}`
  }
}
</script>

<template>
  <div class="form-wrapper">
    <router-link to="/products" class="back-link">← Zurück zum Katalog</router-link>

    <div class="form-card">
      <div class="form-header">
        <div class="form-label">Backend API</div>
        <h1 class="form-title">Produkt bearbeiten</h1>
      </div>

      <div v-if="loading" class="state-msg">Lade Produktdaten…</div>

      <template v-else>
        <div v-if="error" class="alert-error">{{ error }}</div>

        <form @submit.prevent="save" class="form">
          <div class="field">
            <label>Titel</label>
            <input v-model="form.title" type="text" placeholder="z. B. BMW 320i" />
          </div>

          <div class="field">
            <label>Beschreibung</label>
            <textarea v-model="form.description" rows="4" placeholder="Fahrzeugbeschreibung…" />
          </div>

          <div class="field">
            <label>Kategorie ID</label>
            <input v-model="form.categoryId" type="number" placeholder="z. B. 1" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-delete" @click="remove">Löschen</button>
            <router-link to="/products" class="btn-cancel">Abbrechen</router-link>
            <button type="submit" class="btn-submit" :disabled="saving">
              {{ saving ? 'Wird gespeichert…' : 'Speichern' }}
            </button>
          </div>
        </form>
      </template>
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
  color: #00DDFF;
  margin-bottom: 10px;
}

.form-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 700;
  color: #FA0BDB;
  margin: 0 0 32px;
}

.alert-error {
  background: rgba(250,11,219,0.08);
  border: 1px solid rgba(250,11,219,0.3);
  border-radius: 10px;
  padding: 12px 16px;
  color: #FA0BDB;
  font-size: 14px;
  margin-bottom: 24px;
}

.state-msg {
  text-align: center;
  padding: 40px 0;
  color: #8b8fa8;
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
.field textarea {
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
.field textarea:focus { border-color: rgba(0,221,255,0.5); }

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-delete {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 11px 22px;
  border-radius: 30px;
  border: 1px solid rgba(250,11,219,0.4);
  background: transparent;
  color: #FA0BDB;
  cursor: pointer;
  margin-right: auto;
  transition: background 0.2s;
}
.btn-delete:hover { background: rgba(250,11,219,0.08); }

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
