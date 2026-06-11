<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import { getProducts, deleteProduct, updateProduct } from '../services/productService.js'
import { getCategories } from '../services/categoryService.js'

const { getAccessTokenSilently } = useAuth0()

const vehicles = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref(null)

const editingVehicle = ref(null)
const editForm = ref({ title: '', description: '', category: null })
const saving = ref(false)
const saveError = ref(null)
const confirmDeleteId = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const [v, c] = await Promise.all([getProducts(), getCategories()])
    vehicles.value = v
    categories.value = c
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function ownerDisplay(v) {
  if (!v.owner) return '—'
  return v.owner.email || `User #${v.owner.id}`
}

function startEdit(v) {
  editingVehicle.value = v
  editForm.value = {
    title: v.title ?? '',
    description: v.description ?? '',
    category: v.category?.id ?? null,
  }
  saveError.value = null
}

function cancelEdit() {
  editingVehicle.value = null
  saveError.value = null
}

async function submitEdit() {
  saving.value = true
  saveError.value = null
  try {
    const token = await getAccessTokenSilently()
    const payload = {
      title: editForm.value.title,
      description: editForm.value.description,
      category: editForm.value.category ? { id: editForm.value.category } : null,
    }
    const updated = await updateProduct(editingVehicle.value.id, payload, token)
    const idx = vehicles.value.findIndex(v => v.id === updated.id)
    if (idx !== -1) vehicles.value[idx] = updated
    editingVehicle.value = null
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id) {
  try {
    const token = await getAccessTokenSilently()
    await deleteProduct(id, token)
    vehicles.value = vehicles.value.filter(v => v.id !== id)
  } catch (e) {
    error.value = e.message
  } finally {
    confirmDeleteId.value = null
  }
}
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />

    <main class="admin-main">
      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Fahrzeugverwaltung</h1>
        <p class="page-sub">Alle angemeldeten Fahrzeuge mit Besitzer-Informationen.</p>
      </div>

      <div v-if="loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else>
        <div class="count-row">{{ vehicles.length }} Fahrzeuge</div>

        <div class="table-wrap">
          <table class="veh-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titel</th>
                <th>Kategorie</th>
                <th>Besitzer</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in vehicles" :key="v.id">
                <td class="col-id">{{ v.id }}</td>
                <td class="col-title">{{ v.title }}</td>
                <td class="col-cat">{{ v.category?.nameDe || v.category?.name || '—' }}</td>
                <td class="col-owner">
                  <span v-if="v.owner" class="owner-tag">{{ ownerDisplay(v) }}</span>
                  <span v-else class="owner-none">Admin</span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-sm btn-edit" @click="startEdit(v)">Bearbeiten</button>
                    <button class="btn-sm btn-delete" @click="confirmDeleteId = v.id">Löschen</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Edit Modal -->
      <div v-if="editingVehicle" class="modal-backdrop" @click.self="cancelEdit">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Fahrzeug bearbeiten</div>
            <button class="modal-close" @click="cancelEdit">✕</button>
          </div>
          <form @submit.prevent="submitEdit" class="modal-form">
            <div v-if="saveError" class="alert-error">{{ saveError }}</div>
            <div class="field">
              <label>Titel</label>
              <input v-model="editForm.title" type="text" placeholder="z. B. BMW M3 Competition" required />
            </div>
            <div class="field">
              <label>Beschreibung</label>
              <textarea v-model="editForm.description" placeholder="Kurzbeschreibung…" rows="3"></textarea>
            </div>
            <div class="field">
              <label>Kategorie</label>
              <select v-model="editForm.category">
                <option :value="null">— Keine —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nameDe || cat.name }}
                </option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="cancelEdit">Abbrechen</button>
              <button type="submit" class="btn-save" :disabled="saving">
                {{ saving ? 'Wird gespeichert…' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirm -->
      <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <div class="modal-title">Fahrzeug löschen?</div>
          </div>
          <p class="modal-body-text">Diese Aktion kann nicht rückgängig gemacht werden.</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="confirmDeleteId = null">Abbrechen</button>
            <button class="btn-danger" @click="confirmDelete(confirmDeleteId)">Endgültig löschen</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout { min-height: 100vh; background:
  radial-gradient(ellipse 80% 60% at top left, rgba(250,11,219,0.08) 0%, transparent 55%),
  radial-gradient(ellipse 60% 40% at bottom right, rgba(0,221,255,0.06) 0%, transparent 55%),
  #272736; }

.admin-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 112px 5% 80px;
}

.state-msg { text-align: center; padding: 60px 0; color: #8b8fa8; }


.page-header { margin-bottom: 32px; }
.page-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #FA0BDB;
  margin-bottom: 10px;
}
.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(22px, 3.5vw, 36px);
  font-weight: 700;
  color: #FA0BDB;
  margin: 0 0 8px;
}
.page-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }

.count-row {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 16px;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
}

.veh-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.veh-table thead { background: rgba(255,255,255,0.04); }
.veh-table th {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  padding: 14px 16px;
  text-align: left;
  white-space: nowrap;
}
.veh-table td {
  padding: 14px 16px;
  color: rgba(255,255,255,0.75);
  border-top: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}
.veh-table tbody tr:hover { background: rgba(255,255,255,0.02); }

.col-id { color: rgba(255,255,255,0.3); font-size: 12px; }
.col-title { font-weight: 500; color: white; }
.col-cat { font-size: 12px; color: rgba(255,255,255,0.5); }
.col-owner { font-size: 12px; }

.owner-tag {
  background: rgba(0,221,255,0.08);
  border: 1px solid rgba(0,221,255,0.2);
  color: #00DDFF;
  padding: 3px 10px;
  border-radius: 20px;
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 0.8px;
}
.owner-none {
  font-size: 12px;
  color: rgba(255,255,255,0.25);
}

.action-btns { display: flex; gap: 6px; }

.btn-sm {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.btn-edit { border-color: rgba(0,221,255,0.3); background: none; color: #00DDFF; }
.btn-edit:hover { background: rgba(0,221,255,0.08); }
.btn-delete { border-color: rgba(255,60,60,0.3); background: none; color: #ff5555; }
.btn-delete:hover { background: rgba(255,60,60,0.08); }

.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  background: #1e1e2e;
  border: 1px solid rgba(0,221,255,0.2);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 460px;
}
.modal-sm { max-width: 360px; }
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
}
.modal-close {
  background: none; border: none;
  color: rgba(255,255,255,0.4);
  font-size: 14px; cursor: pointer;
}
.modal-close:hover { color: white; }
.modal-body-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 24px; }

.modal-form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.field input,
.field textarea,
.field select {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 11px 14px;
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
.field select option { background: #272736; }

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

.btn-cancel {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
  padding: 10px 20px; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  background: none; color: rgba(255,255,255,0.5); cursor: pointer;
}
.btn-cancel:hover { color: white; }

.btn-save {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  padding: 10px 24px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white; cursor: pointer;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-danger {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  padding: 10px 24px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #ff3333, #cc0000);
  color: white; cursor: pointer;
}

.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px;
  padding: 10px 14px;
  color: #ff7070;
  font-size: 13px;
}
</style>
