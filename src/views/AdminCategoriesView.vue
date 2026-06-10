<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService.js'

const { getAccessTokenSilently } = useAuth0()

const categories = ref([])
const loading = ref(false)
const error = ref(null)

const showCreateModal = ref(false)
const createForm = ref({ name: '', nameDe: '' })
const creating = ref(false)
const createError = ref(null)

const editingCategory = ref(null)
const editForm = ref({ name: '', nameDe: '' })
const saving = ref(false)
const saveError = ref(null)

const confirmDeleteId = ref(null)

onMounted(fetchCategories)

async function fetchCategories() {
  loading.value = true
  error.value = null
  try {
    categories.value = await getCategories()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  createForm.value = { name: '', nameDe: '' }
  createError.value = null
  showCreateModal.value = true
}

function cancelCreate() {
  showCreateModal.value = false
  createError.value = null
}

async function submitCreate() {
  creating.value = true
  createError.value = null
  try {
    const token = await getAccessTokenSilently()
    const created = await createCategory(token, {
      name: createForm.value.name,
      nameDe: createForm.value.nameDe,
    })
    categories.value.push(created)
    showCreateModal.value = false
  } catch (e) {
    createError.value = e.message
  } finally {
    creating.value = false
  }
}

function startEdit(cat) {
  editingCategory.value = cat
  editForm.value = { name: cat.name ?? '', nameDe: cat.nameDe ?? '' }
  saveError.value = null
}

function cancelEdit() {
  editingCategory.value = null
  saveError.value = null
}

async function submitEdit() {
  saving.value = true
  saveError.value = null
  try {
    const token = await getAccessTokenSilently()
    const updated = await updateCategory(token, editingCategory.value.id, {
      name: editForm.value.name,
      nameDe: editForm.value.nameDe,
    })
    const idx = categories.value.findIndex(c => c.id === updated.id)
    if (idx !== -1) categories.value[idx] = updated
    editingCategory.value = null
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id) {
  try {
    const token = await getAccessTokenSilently()
    await deleteCategory(token, id)
    categories.value = categories.value.filter(c => c.id !== id)
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
        <h1 class="page-title">Fahrzeugkategorien</h1>
        <p class="page-sub">Kategorien verwalten, anlegen und löschen.</p>
      </div>

      <div v-if="loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else>
        <div class="toolbar">
          <span class="count-label">{{ categories.length }} Kategorien</span>
          <button class="btn-add" @click="openCreate">+ Neue Kategorie</button>
        </div>

        <div class="table-wrap">
          <table class="cat-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name (EN)</th>
                <th>Name (DE)</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td class="col-id">{{ cat.id }}</td>
                <td>{{ cat.name }}</td>
                <td>{{ cat.nameDe || '—' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-sm btn-edit" @click="startEdit(cat)">Bearbeiten</button>
                    <button class="btn-sm btn-delete" @click="confirmDeleteId = cat.id">Löschen</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Create Modal -->
      <div v-if="showCreateModal" class="modal-backdrop" @click.self="cancelCreate">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Neue Kategorie</div>
            <button class="modal-close" @click="cancelCreate">✕</button>
          </div>
          <form @submit.prevent="submitCreate" class="modal-form">
            <div v-if="createError" class="alert-error">{{ createError }}</div>
            <div class="field">
              <label>Name (EN) *</label>
              <input v-model="createForm.name" type="text" placeholder="z. B. Sports Car" required />
            </div>
            <div class="field">
              <label>Name (DE)</label>
              <input v-model="createForm.nameDe" type="text" placeholder="z. B. Sportwagen" />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="cancelCreate">Abbrechen</button>
              <button type="submit" class="btn-save" :disabled="creating">
                {{ creating ? 'Wird gespeichert…' : 'Anlegen' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="editingCategory" class="modal-backdrop" @click.self="cancelEdit">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Kategorie bearbeiten</div>
            <button class="modal-close" @click="cancelEdit">✕</button>
          </div>
          <form @submit.prevent="submitEdit" class="modal-form">
            <div v-if="saveError" class="alert-error">{{ saveError }}</div>
            <div class="field">
              <label>Name (EN)</label>
              <input v-model="editForm.name" type="text" placeholder="z. B. Sports Car" />
            </div>
            <div class="field">
              <label>Name (DE)</label>
              <input v-model="editForm.nameDe" type="text" placeholder="z. B. Sportwagen" />
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
            <div class="modal-title">Kategorie löschen?</div>
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
.admin-layout { min-height: 100vh; background: #0b0b1e; }

.admin-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 96px 5% 80px;
}

.state-msg { text-align: center; padding: 60px 0; color: #8b8fa8; }

.page-header { margin-bottom: 32px; }
.page-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: #FA0BDB; margin-bottom: 10px;
}
.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(22px, 3.5vw, 36px); font-weight: 700; color: white; margin: 0 0 8px;
}
.page-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.count-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}
.btn-add {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  padding: 10px 20px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white; cursor: pointer; transition: box-shadow 0.3s;
}
.btn-add:hover { box-shadow: 0 0 20px rgba(153,85,255,0.4); }

.table-wrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
}
.cat-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.cat-table thead { background: rgba(255,255,255,0.04); }
.cat-table th {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase;
  color: rgba(255,255,255,0.35); padding: 14px 16px;
  text-align: left; white-space: nowrap;
}
.cat-table td {
  padding: 14px 16px; color: rgba(255,255,255,0.75);
  border-top: 1px solid rgba(255,255,255,0.05); vertical-align: middle;
}
.cat-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.col-id { color: rgba(255,255,255,0.3); font-size: 12px; }

.action-btns { display: flex; gap: 6px; }
.btn-sm {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px; letter-spacing: 0.8px; text-transform: uppercase;
  padding: 6px 12px; border-radius: 20px; border: 1px solid;
  cursor: pointer; white-space: nowrap; transition: background 0.2s;
}
.btn-edit { border-color: rgba(0,221,255,0.3); background: none; color: #00DDFF; }
.btn-edit:hover { background: rgba(0,221,255,0.08); }
.btn-delete { border-color: rgba(255,60,60,0.3); background: none; color: #ff5555; }
.btn-delete:hover { background: rgba(255,60,60,0.08); }

.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7); z-index: 2000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal {
  background: #12122a; border: 1px solid rgba(0,221,255,0.2);
  border-radius: 20px; padding: 32px; width: 100%; max-width: 460px;
}
.modal-sm { max-width: 360px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
}
.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: white;
}
.modal-close {
  background: none; border: none; color: rgba(255,255,255,0.4);
  font-size: 14px; cursor: pointer;
}
.modal-close:hover { color: white; }
.modal-body-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 24px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.field input {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 11px 14px; color: white;
  font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s;
}
.field input:focus { border-color: rgba(0,221,255,0.5); }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.btn-cancel {
  font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 1px;
  text-transform: uppercase; padding: 10px 20px; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15); background: none;
  color: rgba(255,255,255,0.5); cursor: pointer;
}
.btn-cancel:hover { color: white; }
.btn-save {
  font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 24px;
  border-radius: 20px; border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white; cursor: pointer;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 24px;
  border-radius: 20px; border: none;
  background: linear-gradient(135deg, #ff3333, #cc0000);
  color: white; cursor: pointer;
}
.btn-danger:hover { box-shadow: 0 0 20px rgba(255,60,60,0.3); }
.alert-error {
  background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px; padding: 10px 14px; color: #ff7070; font-size: 13px;
}
</style>
