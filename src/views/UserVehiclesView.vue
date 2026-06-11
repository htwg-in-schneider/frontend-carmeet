<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import UserNavbar from '../components/UserNavbar.vue'
import { getMyProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js'
import { getCategories } from '../services/categoryService.js'

const { getAccessTokenSilently, user } = useAuth0()

// ── mock localStorage fallback ───────────────────────────────────────────────
const LS_KEY = 'carmeet_mock_vehicles'
function lsGet(k, fb) { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fb } catch { return fb } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const useMock = ref(false)

function nextMockId() {
  const saved = lsGet(LS_KEY, [])
  const max = saved.reduce((m, v) => Math.max(m, v.id ?? 0), 8999)
  return max + 1
}

const vehicles   = ref([])
const categories = ref([])
const loading    = ref(false)
const error      = ref(null)

// ── create form ───────────────────────────────────────────────────────────────
const showCreate  = ref(false)
const createForm  = ref({ make: '', model: '', horsepower: null, year: null, mileage: null, categoryId: null })
const creating    = ref(false)
const createError = ref(null)

// ── edit form ─────────────────────────────────────────────────────────────────
const editingVehicle = ref(null)
const editForm       = ref({ make: '', model: '', horsepower: null, year: null, mileage: null, categoryId: null })
const saving         = ref(false)
const saveError      = ref(null)

const confirmDeleteId = ref(null)

// ── helpers ───────────────────────────────────────────────────────────────────
function toPayload(form) {
  return {
    make:       form.make.trim(),
    model:      form.model.trim(),
    horsepower: form.horsepower != null && form.horsepower !== '' ? Number(form.horsepower) : null,
    year:       form.year       != null && form.year       !== '' ? Number(form.year)       : null,
    mileage:    form.mileage    != null && form.mileage    !== '' ? Number(form.mileage)    : null,
    category:   form.categoryId ? { id: Number(form.categoryId) } : null,
  }
}

function vehicleDetails(v) {
  const parts = []
  if (v.horsepower) parts.push(`${v.horsepower} PS`)
  if (v.year)       parts.push(String(v.year))
  if (v.mileage)    parts.push(`${Number(v.mileage).toLocaleString('de-DE')} km`)
  return parts.join(' • ')
}

function vehicleName(v) {
  if (v.make && v.model) return `${v.make} ${v.model}`
  return v.title ?? 'Unbekannt'
}

// ── data loading ──────────────────────────────────────────────────────────────
async function loadMyVehicles() {
  try {
    const token = await getAccessTokenSilently()
    vehicles.value = await getMyProducts(token)
    useMock.value  = false
  } catch {
    useMock.value  = true
    vehicles.value = lsGet(LS_KEY, [])
  }
}

onMounted(async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
  } catch {}
  await loadMyVehicles()
  loading.value = false
})

watch(() => user.value?.sub, (newSub, oldSub) => {
  if (newSub && oldSub && newSub !== oldSub) loadMyVehicles()
})

// ── create ────────────────────────────────────────────────────────────────────
function openCreate() {
  createForm.value  = { make: '', model: '', horsepower: null, year: null, mileage: null, categoryId: null }
  createError.value = null
  showCreate.value  = true
}

async function submitCreate() {
  if (!createForm.value.categoryId) { createError.value = 'Bitte eine Kategorie wählen.'; return }
  creating.value    = true
  createError.value = null
  try {
    const payload = toPayload(createForm.value)
    if (useMock.value) {
      const cat = categories.value.find(c => c.id === Number(createForm.value.categoryId)) ?? null
      const v   = { id: nextMockId(), ...payload, title: `${payload.make} ${payload.model}`, category: cat }
      vehicles.value.push(v)
      lsSet(LS_KEY, vehicles.value)
    } else {
      const token   = await getAccessTokenSilently()
      const created = await createProduct(payload, token)
      // Merge payload as fallback so new fields show even if backend is older
      vehicles.value.push({
        ...payload,
        ...created,
        make:       created.make       ?? payload.make,
        model:      created.model      ?? payload.model,
        horsepower: created.horsepower ?? payload.horsepower,
        year:       created.year       ?? payload.year,
        mileage:    created.mileage    ?? payload.mileage,
      })
    }
    showCreate.value = false
  } catch (e) {
    createError.value = e.message
  } finally {
    creating.value = false
  }
}

// ── edit ──────────────────────────────────────────────────────────────────────
function startEdit(v) {
  editingVehicle.value = v
  editForm.value = {
    make:       v.make  ?? '',
    model:      v.model ?? '',
    horsepower: v.horsepower ?? null,
    year:       v.year       ?? null,
    mileage:    v.mileage    ?? null,
    categoryId: v.category?.id ?? null,
  }
  saveError.value = null
}

async function submitEdit() {
  if (!editForm.value.categoryId) { saveError.value = 'Bitte eine Kategorie wählen.'; return }
  saving.value    = true
  saveError.value = null
  try {
    const payload = toPayload(editForm.value)
    if (useMock.value) {
      const cat = categories.value.find(c => c.id === Number(editForm.value.categoryId)) ?? null
      const idx = vehicles.value.findIndex(v => v.id === editingVehicle.value.id)
      if (idx !== -1) {
        vehicles.value[idx] = { ...vehicles.value[idx], ...payload, title: `${payload.make} ${payload.model}`, category: cat }
      }
      lsSet(LS_KEY, vehicles.value)
    } else {
      const token   = await getAccessTokenSilently()
      const updated = await updateProduct(editingVehicle.value.id, payload, token)
      const idx     = vehicles.value.findIndex(v => v.id === (updated.id ?? editingVehicle.value.id))
      if (idx !== -1) {
        vehicles.value[idx] = {
          ...payload,
          ...updated,
          make:       updated.make       ?? payload.make,
          model:      updated.model      ?? payload.model,
          horsepower: updated.horsepower ?? payload.horsepower,
          year:       updated.year       ?? payload.year,
          mileage:    updated.mileage    ?? payload.mileage,
        }
      }
    }
    editingVehicle.value = null
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

// ── delete ────────────────────────────────────────────────────────────────────
async function confirmDelete(id) {
  try {
    if (useMock.value) {
      vehicles.value = vehicles.value.filter(v => v.id !== id)
      lsSet(LS_KEY, vehicles.value)
    } else {
      const token = await getAccessTokenSilently()
      await deleteProduct(id, token)
      vehicles.value = vehicles.value.filter(v => v.id !== id)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    confirmDeleteId.value = null
  }
}
</script>

<template>
  <div class="user-layout">
    <UserNavbar />

    <main class="user-main">
      <div class="page-header">
        <div class="page-label">Mein Bereich</div>
        <h1 class="page-title">Meine Fahrzeuge</h1>
        <p class="page-sub">Verwalte deine Fahrzeuge. Mit einem passenden Fahrzeug kannst du an Events teilnehmen.</p>
      </div>

      <div v-if="loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else>
        <div class="toolbar">
          <span class="count-label">{{ vehicles.length }} Fahrzeug{{ vehicles.length !== 1 ? 'e' : '' }}</span>
          <button class="btn-add" @click="openCreate">+ Neues Fahrzeug</button>
        </div>

        <div v-if="vehicles.length === 0" class="empty-state">
          <div class="empty-title">Noch keine Fahrzeuge</div>
          <div class="empty-sub">Leg dein erstes Fahrzeug an und nimm an Events teil!</div>
          <button class="btn-add" @click="openCreate">+ Erstes Fahrzeug anlegen</button>
        </div>

        <div v-else class="vehicles-grid">
          <div v-for="v in vehicles" :key="v.id" class="vehicle-card">
            <div class="vehicle-cat">{{ v.category?.nameDe || v.category?.name || 'Keine Kategorie' }}</div>
            <div class="vehicle-title">{{ vehicleName(v) }}</div>
            <div v-if="vehicleDetails(v)" class="vehicle-details">{{ vehicleDetails(v) }}</div>
            <div class="card-actions">
              <button class="btn-sm btn-edit" @click="startEdit(v)">Bearbeiten</button>
              <button class="btn-sm btn-delete" @click="confirmDeleteId = v.id">Löschen</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Create Modal ─────────────────────────────────────────────────── -->
      <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Neues Fahrzeug</div>
            <button class="modal-close" @click="showCreate = false">✕</button>
          </div>
          <form @submit.prevent="submitCreate" class="modal-form">
            <div v-if="createError" class="alert-error">{{ createError }}</div>
            <div class="field-row">
              <div class="field">
                <label>Marke *</label>
                <input v-model="createForm.make" type="text" placeholder="z. B. BMW" required />
              </div>
              <div class="field">
                <label>Modell *</label>
                <input v-model="createForm.model" type="text" placeholder="z. B. M3 Competition" required />
              </div>
            </div>
            <div class="field">
              <label>Kategorie *</label>
              <select v-model="createForm.categoryId">
                <option :value="null">— Bitte wählen —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nameDe || cat.name }}
                </option>
              </select>
            </div>
            <div class="field-row">
              <div class="field">
                <label>PS <span class="optional">(optional)</span></label>
                <input v-model="createForm.horsepower" type="number" min="1" max="2000" placeholder="z. B. 510" />
              </div>
              <div class="field">
                <label>Baujahr <span class="optional">(optional)</span></label>
                <input v-model="createForm.year" type="number" min="1886" max="2099" placeholder="z. B. 2021" />
              </div>
            </div>
            <div class="field">
              <label>Kilometer <span class="optional">(optional)</span></label>
              <input v-model="createForm.mileage" type="number" min="0" placeholder="z. B. 15000" />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showCreate = false">Abbrechen</button>
              <button type="submit" class="btn-save" :disabled="creating">
                {{ creating ? 'Wird gespeichert…' : 'Fahrzeug anlegen' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ── Edit Modal ──────────────────────────────────────────────────── -->
      <div v-if="editingVehicle" class="modal-backdrop" @click.self="editingVehicle = null">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Fahrzeug bearbeiten</div>
            <button class="modal-close" @click="editingVehicle = null">✕</button>
          </div>
          <form @submit.prevent="submitEdit" class="modal-form">
            <div v-if="saveError" class="alert-error">{{ saveError }}</div>
            <div class="field-row">
              <div class="field">
                <label>Marke *</label>
                <input v-model="editForm.make" type="text" placeholder="z. B. BMW" required />
              </div>
              <div class="field">
                <label>Modell *</label>
                <input v-model="editForm.model" type="text" placeholder="z. B. M3 Competition" required />
              </div>
            </div>
            <div class="field">
              <label>Kategorie *</label>
              <select v-model="editForm.categoryId">
                <option :value="null">— Bitte wählen —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nameDe || cat.name }}
                </option>
              </select>
            </div>
            <div class="field-row">
              <div class="field">
                <label>PS <span class="optional">(optional)</span></label>
                <input v-model="editForm.horsepower" type="number" min="1" max="2000" placeholder="z. B. 510" />
              </div>
              <div class="field">
                <label>Baujahr <span class="optional">(optional)</span></label>
                <input v-model="editForm.year" type="number" min="1886" max="2099" placeholder="z. B. 2021" />
              </div>
            </div>
            <div class="field">
              <label>Kilometer <span class="optional">(optional)</span></label>
              <input v-model="editForm.mileage" type="number" min="0" placeholder="z. B. 15000" />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="editingVehicle = null">Abbrechen</button>
              <button type="submit" class="btn-save" :disabled="saving">
                {{ saving ? 'Wird gespeichert…' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ── Delete Confirm ──────────────────────────────────────────────── -->
      <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <div class="modal-title">Fahrzeug löschen?</div>
          </div>
          <p class="modal-body-text">Das Fahrzeug wird dauerhaft entfernt und steht nicht mehr für Events zur Verfügung.</p>
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
.user-layout {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 60% at top left, rgba(250,11,219,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at bottom right, rgba(0,221,255,0.06) 0%, transparent 55%),
    #272736;
}

.user-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 112px 5% 80px;
}

.state-msg { text-align: center; padding: 60px 0; color: #8b8fa8; }

.page-header { margin-bottom: 32px; }
.page-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: #00DDFF; margin-bottom: 10px;
}
.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(22px, 3.5vw, 36px);
  font-weight: 700; color: #FA0BDB; margin: 0 0 8px;
}
.page-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; line-height: 1.5; max-width: 560px; }

.toolbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 24px;
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

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 80px 0; text-align: center;
}
.empty-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: white;
}
.empty-sub { font-size: 14px; color: rgba(255,255,255,0.4); max-width: 300px; }

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.vehicle-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(0,221,255,0.12);
  border-radius: 16px; padding: 24px;
  display: flex; flex-direction: column; gap: 10px;
  transition: border-color 0.2s;
}
.vehicle-card:hover { border-color: rgba(0,221,255,0.3); }

.vehicle-cat {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase;
  color: #00DDFF;
}
.vehicle-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px; font-weight: 700; color: white;
}
.vehicle-details {
  font-size: 12px; color: rgba(255,255,255,0.4);
  letter-spacing: 0.3px;
}

.card-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-sm {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px; letter-spacing: 0.8px; text-transform: uppercase;
  padding: 7px 14px; border-radius: 20px; border: 1px solid;
  cursor: pointer; transition: background 0.2s;
}
.btn-edit  { border-color: rgba(0,221,255,0.3);  background: none; color: #00DDFF; }
.btn-edit:hover  { background: rgba(0,221,255,0.08); }
.btn-delete { border-color: rgba(255,60,60,0.3); background: none; color: #ff5555; }
.btn-delete:hover { background: rgba(255,60,60,0.08); }

/* ── Modals ─────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  z-index: 2000; display: flex; align-items: center;
  justify-content: center; padding: 20px;
}
.modal {
  background: #1e1e2e; border: 1px solid rgba(0,221,255,0.2);
  border-radius: 20px; padding: 32px; width: 100%; max-width: 480px;
  max-height: 90vh; overflow-y: auto;
}
.modal-sm { max-width: 360px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
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

.modal-form { display: flex; flex-direction: column; gap: 14px; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.field label .optional { font-size: 7.5px; color: rgba(255,255,255,0.25); font-family: inherit; }
.field input,
.field select {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 11px 14px; color: white;
  font-size: 14px; font-family: inherit; outline: none;
  transition: border-color 0.2s;
}
.field input:focus,
.field select:focus { border-color: rgba(0,221,255,0.5); }
.field select option { background: #272736; }

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

.alert-error {
  background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px; padding: 10px 14px; color: #ff7070; font-size: 13px;
}
</style>
