<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService.js'
import { getAllUsers } from '../services/adminService.js'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
import { getProducts, createProduct, deleteProduct, updateProduct } from '../services/productService.js'

const { getAccessTokenSilently } = useAuth0()
const tab = ref('kategorien')

// ── KATEGORIEN ────────────────────────────────────────────────────────────────
const cat_categories       = ref([])
const cat_loading          = ref(false)
const cat_error            = ref(null)
const cat_showCreate       = ref(false)
const cat_createForm       = ref({ name: '', nameDe: '' })
const cat_creating         = ref(false)
const cat_createError      = ref(null)
const cat_editing          = ref(null)
const cat_editForm         = ref({ name: '', nameDe: '' })
const cat_saving           = ref(false)
const cat_saveError        = ref(null)
const cat_confirmDeleteId  = ref(null)
const cat_conflictId       = ref(null)
const cat_vehiclesConflict = ref([])
const cat_deleting         = ref(false)

async function cat_fetch() {
  cat_loading.value = true; cat_error.value = null
  try { cat_categories.value = await getCategories() }
  catch (e) { cat_error.value = e.message }
  finally { cat_loading.value = false }
}
function cat_openCreate() {
  cat_createForm.value = { name: '', nameDe: '' }; cat_createError.value = null; cat_showCreate.value = true
}
async function cat_submitCreate() {
  cat_creating.value = true; cat_createError.value = null
  try {
    const token = await getAccessTokenSilently()
    const created = await createCategory(token, { name: cat_createForm.value.name, nameDe: cat_createForm.value.nameDe })
    cat_categories.value.push(created); cat_showCreate.value = false
  } catch (e) { cat_createError.value = e.message }
  finally { cat_creating.value = false }
}
function cat_startEdit(cat) {
  cat_editing.value = cat; cat_editForm.value = { name: cat.name ?? '', nameDe: cat.nameDe ?? '' }; cat_saveError.value = null
}
async function cat_submitEdit() {
  cat_saving.value = true; cat_saveError.value = null
  try {
    const token = await getAccessTokenSilently()
    const updated = await updateCategory(token, cat_editing.value.id, { name: cat_editForm.value.name, nameDe: cat_editForm.value.nameDe })
    const idx = cat_categories.value.findIndex(c => c.id === updated.id)
    if (idx !== -1) cat_categories.value[idx] = updated
    cat_editing.value = null
  } catch (e) { cat_saveError.value = e.message }
  finally { cat_saving.value = false }
}
async function cat_handleDeleteClick(id) {
  try {
    const prods = await getProducts({ category: id })
    if (prods.length > 0) { cat_vehiclesConflict.value = prods; cat_conflictId.value = id }
    else { cat_confirmDeleteId.value = id }
  } catch (e) { cat_error.value = e.message }
}
async function cat_confirmDelete(id) {
  try {
    const token = await getAccessTokenSilently()
    await deleteCategory(token, id)
    cat_categories.value = cat_categories.value.filter(c => c.id !== id)
  } catch (e) { cat_error.value = e.message }
  finally { cat_confirmDeleteId.value = null }
}
async function cat_deleteWithVehicles(action) {
  cat_deleting.value = true
  const id = cat_conflictId.value
  try {
    const token = await getAccessTokenSilently()
    for (const product of cat_vehiclesConflict.value) {
      if (action === 'delete') { await deleteProduct(product.id, token) }
      else { await updateProduct(product.id, { title: product.title, description: product.description, category: null }, token) }
    }
    await deleteCategory(token, id)
    cat_categories.value = cat_categories.value.filter(c => c.id !== id)
    cat_conflictId.value = null; cat_vehiclesConflict.value = []
  } catch (e) { cat_error.value = e.message }
  finally { cat_deleting.value = false }
}

// ── FAHRZEUGE ─────────────────────────────────────────────────────────────────
const veh_vehicles      = ref([])
const veh_categories    = ref([])
const veh_loading       = ref(false)
const veh_error         = ref(null)
const veh_categoryFilter = ref('')
const veh_filteredVehicles = computed(() => {
  if (!veh_categoryFilter.value) return veh_vehicles.value
  return veh_vehicles.value.filter(v => String(v.category?.id) === String(veh_categoryFilter.value))
})
const veh_users         = ref([])
const veh_showCreate    = ref(false)
const veh_createForm    = ref({ make: '', model: '', horsepower: null, year: null, mileage: null, category: null, ownerId: null })
const veh_creating      = ref(false)
const veh_createError   = ref(null)
const veh_editing       = ref(null)
const veh_editForm      = ref({ make: '', model: '', horsepower: null, year: null, mileage: null, category: null, ownerId: null })
const veh_saving        = ref(false)
const veh_saveError     = ref(null)
const veh_confirmDelete = ref(null)

async function veh_openCreate() {
  veh_createForm.value = { make: '', model: '', horsepower: null, year: null, mileage: null, category: null, ownerId: null }
  veh_createError.value = null
  if (veh_users.value.length === 0) {
    try {
      const token = await getAccessTokenSilently()
      veh_users.value = await getAllUsers(token)
    } catch {}
  }
  veh_showCreate.value = true
}
async function veh_submitCreate() {
  if (!veh_createForm.value.make.trim() || !veh_createForm.value.model.trim()) {
    veh_createError.value = 'Bitte Marke und Modell angeben.'
    return
  }
  if (!veh_createForm.value.category) {
    veh_createError.value = 'Bitte eine Kategorie wählen.'
    return
  }
  veh_creating.value = true; veh_createError.value = null
  try {
    const token = await getAccessTokenSilently()
    const payload = {
      make:       veh_createForm.value.make.trim(),
      model:      veh_createForm.value.model.trim(),
      horsepower: veh_createForm.value.horsepower != null && veh_createForm.value.horsepower !== '' ? Number(veh_createForm.value.horsepower) : null,
      year:       veh_createForm.value.year       != null && veh_createForm.value.year       !== '' ? Number(veh_createForm.value.year)       : null,
      mileage:    veh_createForm.value.mileage    != null && veh_createForm.value.mileage    !== '' ? Number(veh_createForm.value.mileage)    : null,
      category:   veh_createForm.value.category ? { id: veh_createForm.value.category } : null,
      owner:      veh_createForm.value.ownerId   ? { id: veh_createForm.value.ownerId }   : null,
    }
    const created = await createProduct(payload, token)
    veh_vehicles.value.unshift(created)
    veh_showCreate.value = false
  } catch (e) { veh_createError.value = e.message }
  finally { veh_creating.value = false }
}

async function veh_fetch() {
  veh_loading.value = true; veh_error.value = null
  try {
    const [v, c] = await Promise.all([getProducts(), getCategories()])
    veh_vehicles.value = v; veh_categories.value = c
  } catch (e) { veh_error.value = e.message }
  finally { veh_loading.value = false }
}
function veh_ownerDisplay(v) {
  if (!v.owner) return '—'
  return v.owner.email || `User #${v.owner.id}`
}
async function veh_startEdit(v) {
  veh_editing.value = v
  veh_editForm.value = {
    make:       v.make       ?? '',
    model:      v.model      ?? '',
    horsepower: v.horsepower ?? null,
    year:       v.year       ?? null,
    mileage:    v.mileage    ?? null,
    category:   v.category?.id ?? null,
    ownerId:    v.owner?.id  ?? null,
  }
  veh_saveError.value = null
  if (veh_users.value.length === 0) {
    try {
      const token = await getAccessTokenSilently()
      veh_users.value = await getAllUsers(token)
    } catch {}
  }
}
async function veh_submitEdit() {
  if (!veh_editForm.value.make.trim() || !veh_editForm.value.model.trim()) {
    veh_saveError.value = 'Bitte Marke und Modell angeben.'
    return
  }
  if (!veh_editForm.value.category) {
    veh_saveError.value = 'Bitte eine Kategorie wählen.'
    return
  }
  veh_saving.value = true; veh_saveError.value = null
  try {
    const token = await getAccessTokenSilently()
    const payload = {
      make:       veh_editForm.value.make.trim(),
      model:      veh_editForm.value.model.trim(),
      horsepower: veh_editForm.value.horsepower != null && veh_editForm.value.horsepower !== '' ? Number(veh_editForm.value.horsepower) : null,
      year:       veh_editForm.value.year       != null && veh_editForm.value.year       !== '' ? Number(veh_editForm.value.year)       : null,
      mileage:    veh_editForm.value.mileage    != null && veh_editForm.value.mileage    !== '' ? Number(veh_editForm.value.mileage)    : null,
      category:   veh_editForm.value.category ? { id: veh_editForm.value.category } : null,
      owner:      veh_editForm.value.ownerId   ? { id: veh_editForm.value.ownerId }   : null,
    }
    const updated = await updateProduct(veh_editing.value.id, payload, token)
    const idx = veh_vehicles.value.findIndex(v => v.id === updated.id)
    if (idx !== -1) veh_vehicles.value[idx] = updated
    veh_editing.value = null
  } catch (e) { veh_saveError.value = e.message }
  finally { veh_saving.value = false }
}
async function veh_confirmDeleteFn(id) {
  try {
    const token = await getAccessTokenSilently()
    await deleteProduct(id, token)
    veh_vehicles.value = veh_vehicles.value.filter(v => v.id !== id)
  } catch (e) { veh_error.value = e.message }
  finally { veh_confirmDelete.value = null }
}

// ── BEWERTUNGEN ───────────────────────────────────────────────────────────────
const rev_reviews        = ref([])
const rev_products       = ref([])
const rev_loading        = ref(false)
const rev_error          = ref(null)
const rev_search         = ref('')
const rev_productFilter  = ref('')
const rev_editing        = ref(null)
const rev_editForm       = ref({ userName: '', text: '', stars: 5 })
const rev_saving         = ref(false)
const rev_saveError      = ref(null)
const rev_confirmDelete  = ref(null)
const rev_deleting       = ref(false)

const rev_filtered = computed(() => {
  let list = rev_reviews.value
  if (rev_productFilter.value) list = list.filter(r => r.product?.id === Number(rev_productFilter.value))
  if (rev_search.value.trim()) {
    const q = rev_search.value.trim().toLowerCase()
    list = list.filter(r => (r.userName ?? '').toLowerCase().includes(q) || (r.text ?? '').toLowerCase().includes(q))
  }
  return list
})

async function rev_fetch() {
  rev_loading.value = true; rev_error.value = null
  try {
    const [rRes, pRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/review`),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/product`),
    ])
    if (!rRes.ok) throw new Error(`HTTP ${rRes.status}`)
    rev_reviews.value = await rRes.json()
    if (pRes.ok) rev_products.value = await pRes.json()
  } catch (e) { rev_error.value = e.message }
  finally { rev_loading.value = false }
}
function rev_productTitle(id) {
  const p = rev_products.value.find(p => p.id === id)
  return p ? p.title : `Fahrzeug #${id}`
}
function rev_startEdit(review) {
  rev_editing.value = review; rev_editForm.value = { userName: review.userName ?? '', text: review.text ?? '', stars: review.stars ?? 5 }; rev_saveError.value = null
}
async function rev_submitEdit() {
  rev_saving.value = true; rev_saveError.value = null
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/review/${rev_editing.value.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: rev_editForm.value.userName, text: rev_editForm.value.text, stars: Number(rev_editForm.value.stars), product: { id: rev_editing.value.product?.id } }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const updated = await res.json()
    const idx = rev_reviews.value.findIndex(r => r.id === updated.id)
    if (idx !== -1) rev_reviews.value[idx] = updated
    rev_editing.value = null
  } catch (e) { rev_saveError.value = e.message }
  finally { rev_saving.value = false }
}
async function rev_confirmDeleteFn() {
  rev_deleting.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/review/${rev_confirmDelete.value}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    rev_reviews.value = rev_reviews.value.filter(r => r.id !== rev_confirmDelete.value)
    rev_confirmDelete.value = null
  } catch (e) { rev_error.value = e.message }
  finally { rev_deleting.value = false }
}
function rev_stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n) }

// ── Load all on mount ─────────────────────────────────────────────────────────
onMounted(() => Promise.all([cat_fetch(), veh_fetch(), rev_fetch()]))
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />

    <main class="admin-main">
      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Fahrzeugverwaltung</h1>
        <p class="page-sub">Kategorien, Fahrzeuge und Bewertungen an einem Ort verwalten.</p>
      </div>

      <!-- Tab bar -->
      <div class="tab-bar">
        <button :class="['tab-btn', { active: tab === 'kategorien' }]" @click="tab = 'kategorien'">
          Kategorien
        </button>
        <button :class="['tab-btn', { active: tab === 'fahrzeuge' }]" @click="tab = 'fahrzeuge'">
          Fahrzeuge
          <span v-if="veh_vehicles.length" class="tab-count">{{ veh_vehicles.length }}</span>
        </button>
        <button :class="['tab-btn', { active: tab === 'bewertungen' }]" @click="tab = 'bewertungen'">
          Bewertungen
          <span v-if="rev_reviews.length" class="tab-count">{{ rev_reviews.length }}</span>
        </button>
      </div>

      <!-- ── TAB: KATEGORIEN ───────────────────────────────────────────────── -->
      <div v-show="tab === 'kategorien'">
        <div v-if="cat_loading" class="state-msg">Wird geladen…</div>
        <div v-else-if="cat_error" class="alert-error">{{ cat_error }}</div>
        <template v-else>
          <div class="toolbar">
            <span class="count-label">{{ cat_categories.length }} Kategorien</span>
            <button class="btn-add" @click="cat_openCreate">+ Neue Kategorie</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Name (EN)</th><th>Name (DE)</th><th>Aktionen</th></tr></thead>
              <tbody>
                <tr v-for="cat in cat_categories" :key="cat.id">
                  <td class="col-id">{{ cat.id }}</td>
                  <td>{{ cat.name }}</td>
                  <td>{{ cat.nameDe || '—' }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-sm btn-edit" @click="cat_startEdit(cat)">Bearbeiten</button>
                      <button class="btn-sm btn-delete" @click="cat_handleDeleteClick(cat.id)">Löschen</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- ── TAB: FAHRZEUGE ────────────────────────────────────────────────── -->
      <div v-show="tab === 'fahrzeuge'">
        <div v-if="veh_loading" class="state-msg">Wird geladen…</div>
        <div v-else-if="veh_error" class="alert-error">{{ veh_error }}</div>
        <template v-else>
          <div class="filter-bar">
            <select v-model="veh_categoryFilter" class="filter-select">
              <option value="">Alle Kategorien</option>
              <option v-for="cat in veh_categories" :key="cat.id" :value="cat.id">{{ cat.nameDe || cat.name }}</option>
            </select>
          </div>
          <div class="toolbar">
            <span class="count-label">
              {{ veh_filteredVehicles.length }}<template v-if="veh_categoryFilter"> von {{ veh_vehicles.length }}</template> Fahrzeuge
            </span>
            <button class="btn-add" @click="veh_openCreate">+ Neues Fahrzeug</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Titel</th><th>Kategorie</th><th>Besitzer</th><th>Aktionen</th></tr></thead>
              <tbody>
                <tr v-for="v in veh_filteredVehicles" :key="v.id">
                  <td class="col-id">{{ v.id }}</td>
                  <td class="col-title">{{ v.title }}</td>
                  <td class="col-sub">{{ v.category?.nameDe || v.category?.name || '—' }}</td>
                  <td class="col-sub">
                    <span v-if="v.owner" class="owner-tag">{{ veh_ownerDisplay(v) }}</span>
                    <span v-else class="owner-none">Admin</span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-sm btn-edit" @click="veh_startEdit(v)">Bearbeiten</button>
                      <button class="btn-sm btn-delete" @click="veh_confirmDelete = v.id">Löschen</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- ── TAB: BEWERTUNGEN ──────────────────────────────────────────────── -->
      <div v-show="tab === 'bewertungen'">
        <div class="filter-bar">
          <input v-model="rev_search" class="filter-input filter-wide" placeholder="Suche nach Autor oder Inhalt…" />
          <select v-model="rev_productFilter" class="filter-select">
            <option value="">Alle Fahrzeuge</option>
            <option v-for="p in rev_products" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </div>
        <div v-if="rev_loading" class="state-msg">Wird geladen…</div>
        <div v-else-if="rev_error" class="alert-error">{{ rev_error }}</div>
        <template v-else>
          <div class="count-row">{{ rev_filtered.length }} Bewertungen</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Fahrzeug</th><th>Autor</th><th>Sterne</th><th>Text</th><th>Aktionen</th></tr></thead>
              <tbody>
                <tr v-for="r in rev_filtered" :key="r.id">
                  <td class="col-id">{{ r.id }}</td>
                  <td class="col-title">{{ r.product ? rev_productTitle(r.product.id) : '—' }}</td>
                  <td class="col-sub">{{ r.userName || '—' }}</td>
                  <td><span class="stars-display">{{ rev_stars(r.stars) }}</span></td>
                  <td class="col-text">{{ r.text }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-sm btn-edit" @click="rev_startEdit(r)">Bearbeiten</button>
                      <button class="btn-sm btn-delete" @click="rev_confirmDelete = r.id">Löschen</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="rev_filtered.length === 0">
                  <td colspan="6" class="empty-row">Keine Bewertungen gefunden.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </main>

    <!-- ── MODALS: KATEGORIEN ────────────────────────────────────────────────── -->
    <div v-if="cat_showCreate" class="modal-backdrop" @click.self="cat_showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Neue Kategorie</div>
          <button class="modal-close" @click="cat_showCreate = false">✕</button>
        </div>
        <form @submit.prevent="cat_submitCreate" class="modal-form">
          <div v-if="cat_createError" class="alert-error">{{ cat_createError }}</div>
          <div class="field"><label>Name (EN) *</label><input v-model="cat_createForm.name" type="text" placeholder="z. B. Sports Car" required /></div>
          <div class="field"><label>Name (DE) *</label><input v-model="cat_createForm.nameDe" type="text" placeholder="z. B. Sportwagen" required /></div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cat_showCreate = false">Abbrechen</button>
            <button type="submit" class="btn-save" :disabled="cat_creating">{{ cat_creating ? 'Wird gespeichert…' : 'Anlegen' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="cat_editing" class="modal-backdrop" @click.self="cat_editing = null">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Kategorie bearbeiten</div>
          <button class="modal-close" @click="cat_editing = null">✕</button>
        </div>
        <form @submit.prevent="cat_submitEdit" class="modal-form">
          <div v-if="cat_saveError" class="alert-error">{{ cat_saveError }}</div>
          <div class="field"><label>Name (EN) *</label><input v-model="cat_editForm.name" type="text" required /></div>
          <div class="field"><label>Name (DE) *</label><input v-model="cat_editForm.nameDe" type="text" required /></div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cat_editing = null">Abbrechen</button>
            <button type="submit" class="btn-save" :disabled="cat_saving">{{ cat_saving ? 'Wird gespeichert…' : 'Speichern' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="cat_conflictId" class="modal-backdrop modal-backdrop-delete" @click.self="cat_conflictId = null">
      <div class="modal modal-delete">
        <div class="modal-delete-icon">⚠</div>
        <div class="modal-title">Kategorie enthält Fahrzeuge</div>
        <p class="modal-delete-message">
          <strong style="color:white">{{ cat_vehiclesConflict.length }} Fahrzeug{{ cat_vehiclesConflict.length !== 1 ? 'e' : '' }}</strong>
          {{ cat_vehiclesConflict.length !== 1 ? 'sind' : 'ist' }} dieser Kategorie zugewiesen. Was soll passieren?
        </p>
        <div class="modal-actions conflict-actions">
          <button class="btn-cancel" @click="cat_conflictId = null">Abbrechen</button>
          <button class="btn-unlink" :disabled="cat_deleting" @click="cat_deleteWithVehicles('unlink')">Fahrzeuge behalten</button>
          <button class="btn-danger" :disabled="cat_deleting" @click="cat_deleteWithVehicles('delete')">Alles löschen</button>
        </div>
      </div>
    </div>

    <ConfirmDeleteModal
      v-if="cat_confirmDeleteId"
      title="Kategorie löschen?"
      message="Diese Aktion kann nicht rückgängig gemacht werden."
      @confirm="cat_confirmDelete(cat_confirmDeleteId)"
      @cancel="cat_confirmDeleteId = null"
    />

    <!-- ── MODALS: FAHRZEUGE ─────────────────────────────────────────────────── -->
    <div v-if="veh_showCreate" class="modal-backdrop" @click.self="veh_showCreate = false">
      <div class="modal" style="max-width:520px;max-height:90vh;overflow-y:auto">
        <div class="modal-header">
          <div class="modal-title">Neues Fahrzeug anlegen</div>
          <button class="modal-close" @click="veh_showCreate = false">✕</button>
        </div>
        <form @submit.prevent="veh_submitCreate" class="modal-form">
          <div v-if="veh_createError" class="alert-error">{{ veh_createError }}</div>
          <div class="field-row">
            <div class="field"><label>Marke *</label><input v-model="veh_createForm.make" type="text" placeholder="z. B. BMW" required /></div>
            <div class="field"><label>Modell *</label><input v-model="veh_createForm.model" type="text" placeholder="z. B. M3 Competition" required /></div>
          </div>
          <div class="field">
            <label>Kategorie *</label>
            <select v-model="veh_createForm.category" required>
              <option :value="null" disabled>— Bitte wählen —</option>
              <option v-for="cat in veh_categories" :key="cat.id" :value="cat.id">{{ cat.nameDe || cat.name }}</option>
            </select>
          </div>
          <div class="field-row">
            <div class="field"><label>PS <span class="opt">(optional)</span></label><input v-model="veh_createForm.horsepower" type="number" min="1" max="2000" placeholder="z. B. 510" /></div>
            <div class="field"><label>Baujahr <span class="opt">(optional)</span></label><input v-model="veh_createForm.year" type="number" min="1886" max="2099" placeholder="z. B. 2021" /></div>
          </div>
          <div class="field"><label>Kilometer <span class="opt">(optional)</span></label><input v-model="veh_createForm.mileage" type="number" min="0" placeholder="z. B. 15000" /></div>
          <div class="field">
            <label>Fahrzeug zuweisen <span class="opt">(optional)</span></label>
            <select v-model="veh_createForm.ownerId">
              <option :value="null">— Kein Besitzer (kein Nutzer) —</option>
              <option v-for="u in veh_users" :key="u.id" :value="u.id">
                {{ u.firstName || u.lastName ? [u.firstName, u.lastName].filter(Boolean).join(' ') : (u.email || `User #${u.id}`) }}
                <template v-if="u.email"> ({{ u.email }})</template>
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="veh_showCreate = false">Abbrechen</button>
            <button type="submit" class="btn-save" :disabled="veh_creating">{{ veh_creating ? 'Wird gespeichert…' : 'Anlegen' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="veh_editing" class="modal-backdrop" @click.self="veh_editing = null">
      <div class="modal" style="max-width:520px;max-height:90vh;overflow-y:auto">
        <div class="modal-header">
          <div class="modal-title">Fahrzeug bearbeiten</div>
          <button class="modal-close" @click="veh_editing = null">✕</button>
        </div>
        <form @submit.prevent="veh_submitEdit" class="modal-form">
          <div v-if="veh_saveError" class="alert-error">{{ veh_saveError }}</div>
          <div class="field-row">
            <div class="field"><label>Marke *</label><input v-model="veh_editForm.make" type="text" placeholder="z. B. BMW" required /></div>
            <div class="field"><label>Modell *</label><input v-model="veh_editForm.model" type="text" placeholder="z. B. M3 Competition" required /></div>
          </div>
          <div class="field">
            <label>Kategorie *</label>
            <select v-model="veh_editForm.category" required>
              <option :value="null" disabled>— Bitte wählen —</option>
              <option v-for="cat in veh_categories" :key="cat.id" :value="cat.id">{{ cat.nameDe || cat.name }}</option>
            </select>
          </div>
          <div class="field-row">
            <div class="field"><label>PS <span class="opt">(optional)</span></label><input v-model="veh_editForm.horsepower" type="number" min="1" max="2000" placeholder="z. B. 510" /></div>
            <div class="field"><label>Baujahr <span class="opt">(optional)</span></label><input v-model="veh_editForm.year" type="number" min="1886" max="2099" placeholder="z. B. 2021" /></div>
          </div>
          <div class="field"><label>Kilometer <span class="opt">(optional)</span></label><input v-model="veh_editForm.mileage" type="number" min="0" placeholder="z. B. 15000" /></div>
          <div class="field">
            <label>Besitzer</label>
            <select v-model="veh_editForm.ownerId">
              <option :value="null">— Aktuellen Besitzer beibehalten —</option>
              <option v-for="u in veh_users" :key="u.id" :value="u.id">
                {{ u.firstName || u.lastName ? [u.firstName, u.lastName].filter(Boolean).join(' ') : (u.email || `User #${u.id}`) }}
                <template v-if="u.email"> ({{ u.email }})</template>
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="veh_editing = null">Abbrechen</button>
            <button type="submit" class="btn-save" :disabled="veh_saving">{{ veh_saving ? 'Wird gespeichert…' : 'Speichern' }}</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmDeleteModal
      v-if="veh_confirmDelete"
      title="Fahrzeug löschen?"
      message="Das Fahrzeug wird dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden."
      @confirm="veh_confirmDeleteFn(veh_confirmDelete)"
      @cancel="veh_confirmDelete = null"
    />

    <!-- ── MODALS: BEWERTUNGEN ───────────────────────────────────────────────── -->
    <div v-if="rev_editing" class="modal-backdrop" @click.self="rev_editing = null">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Bewertung bearbeiten</div>
          <button class="modal-close" @click="rev_editing = null">✕</button>
        </div>
        <form @submit.prevent="rev_submitEdit" class="modal-form">
          <div v-if="rev_saveError" class="alert-error">{{ rev_saveError }}</div>
          <div class="field"><label>Autor</label><input v-model="rev_editForm.userName" type="text" /></div>
          <div class="field">
            <label>Sterne (1–5)</label>
            <select v-model="rev_editForm.stars">
              <option :value="1">1 ★</option><option :value="2">2 ★★</option>
              <option :value="3">3 ★★★</option><option :value="4">4 ★★★★</option>
              <option :value="5">5 ★★★★★</option>
            </select>
          </div>
          <div class="field"><label>Bewertungstext</label><textarea v-model="rev_editForm.text" rows="4"></textarea></div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="rev_editing = null">Abbrechen</button>
            <button type="submit" class="btn-save" :disabled="rev_saving">{{ rev_saving ? 'Wird gespeichert…' : 'Speichern' }}</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmDeleteModal
      v-if="rev_confirmDelete"
      title="Bewertung löschen?"
      message="Die Bewertung wird dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden."
      :loading="rev_deleting"
      @confirm="rev_confirmDeleteFn"
      @cancel="rev_confirmDelete = null"
    />
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 60% at top left, rgba(250,11,219,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at bottom right, rgba(0,221,255,0.06) 0%, transparent 55%),
    #272736;
}
.admin-main { max-width: 1200px; margin: 0 auto; padding: 112px 5% 80px; }

.page-header { margin-bottom: 28px; }
.page-label { font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #00DDFF; margin-bottom: 10px; }
.page-title { font-family: 'Orbitron', sans-serif; font-size: clamp(22px, 3.5vw, 36px); font-weight: 700; color: #FA0BDB; margin: 0 0 8px; }
.page-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }

/* Tab bar — same pattern as UserEventsView */
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding-bottom: 0;
}
.tab-btn {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 12px 20px;
  border: none;
  background: none;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tab-btn:hover { color: rgba(255,255,255,0.7); }
.tab-btn.active { color: #00DDFF; border-bottom-color: #00DDFF; }

.tab-count {
  background: rgba(0,221,255,0.15);
  border: 1px solid rgba(0,221,255,0.3);
  color: #00DDFF;
  font-size: 8px;
  padding: 1px 6px;
  border-radius: 20px;
}

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.count-label { font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); }
.count-row { font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
.btn-add { font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 20px; border-radius: 20px; border: none; background: linear-gradient(135deg, #FA0BDB, #9955FF); color: white; cursor: pointer; transition: box-shadow 0.3s; }
.btn-add:hover { box-shadow: 0 0 20px rgba(153,85,255,0.4); }

/* Filter bar */
.filter-bar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.filter-input, .filter-select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 9px 13px; color: white; font-size: 13px; font-family: inherit; outline: none; transition: border-color 0.2s; }
.filter-input:focus, .filter-select:focus { border-color: rgba(0,221,255,0.5); }
.filter-select option { background: #272736; }
.filter-wide { flex: 1; min-width: 200px; }

/* Table */
.table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 8px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table thead { background: rgba(255,255,255,0.04); }
.data-table th { font-family: 'Orbitron', sans-serif; font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.35); padding: 14px 16px; text-align: left; white-space: nowrap; }
.data-table td { padding: 14px 16px; color: rgba(255,255,255,0.75); border-top: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
.data-table tbody tr:hover { background: rgba(255,255,255,0.02); }

.col-id { color: rgba(255,255,255,0.3); font-size: 12px; }
.col-title { font-weight: 500; color: white; }
.col-sub { font-size: 12px; color: rgba(255,255,255,0.5); }
.col-text { max-width: 280px; font-size: 12px; color: rgba(255,255,255,0.55); }
.stars-display { color: #ffaa00; letter-spacing: 2px; }
.empty-row { text-align: center; color: rgba(255,255,255,0.3); padding: 40px; }

.owner-tag { background: rgba(0,221,255,0.08); border: 1px solid rgba(0,221,255,0.2); color: #00DDFF; padding: 3px 10px; border-radius: 20px; font-family: 'Orbitron', sans-serif; font-size: 8px; letter-spacing: 0.8px; }
.owner-none { font-size: 12px; color: rgba(255,255,255,0.25); }

.action-btns { display: flex; gap: 6px; }
.btn-sm { font-family: 'Orbitron', sans-serif; font-size: 8px; letter-spacing: 0.8px; text-transform: uppercase; padding: 6px 12px; border-radius: 20px; border: 1px solid; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
.btn-edit { border-color: rgba(0,221,255,0.3); background: none; color: #00DDFF; }
.btn-edit:hover { background: rgba(0,221,255,0.08); }
.btn-delete { border-color: rgba(255,60,60,0.3); background: none; color: #ff5555; }
.btn-delete:hover { background: rgba(255,60,60,0.08); }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #1e1e2e; border: 1px solid rgba(0,221,255,0.2); border-radius: 20px; padding: 32px; width: 100%; max-width: 460px; }
.modal-sm { max-width: 360px; }

/* Delete-style modal (matches ConfirmDeleteModal) */
@keyframes cdm-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cdm-slide-up { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.modal-backdrop-delete { backdrop-filter: blur(4px); animation: cdm-fade-in 0.15s ease; }
.modal-delete {
  border-color: rgba(255, 60, 60, 0.35);
  box-shadow: 0 0 40px rgba(255, 60, 60, 0.12), 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  text-align: center;
  animation: cdm-slide-up 0.18s ease;
}
.modal-delete-icon { font-size: 28px; margin-bottom: 14px; color: #ff5555; filter: drop-shadow(0 0 8px rgba(255,60,60,0.5)); }
.modal-delete-message { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 10px 0 28px; }
.modal-delete .modal-actions { justify-content: center; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-title { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: white; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 14px; cursor: pointer; }
.modal-close:hover { color: white; }
.modal-body-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 24px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field label { font-family: 'Orbitron', sans-serif; font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.4); }
.opt { font-size: 7.5px; color: rgba(255,255,255,0.25); font-family: inherit; }
.field input, .field textarea, .field select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 14px; color: white; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; resize: vertical; }
.field input:focus, .field textarea:focus, .field select:focus { border-color: rgba(0,221,255,0.5); }
.field select option { background: #272736; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.conflict-actions { flex-wrap: wrap; gap: 8px; }

.btn-cancel { font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; padding: 10px 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); background: none; color: rgba(255,255,255,0.5); cursor: pointer; }
.btn-cancel:hover { color: white; }
.btn-save { font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 24px; border-radius: 20px; border: none; background: linear-gradient(135deg, #FA0BDB, #9955FF); color: white; cursor: pointer; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 24px; border-radius: 20px; border: none; background: linear-gradient(135deg, #ff3333, #cc0000); color: white; cursor: pointer; }
.btn-danger:hover { box-shadow: 0 0 20px rgba(255,60,60,0.3); }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-unlink { font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 24px; border-radius: 20px; border: none; background: linear-gradient(135deg, #9955FF, #6633cc); color: white; cursor: pointer; }
.btn-unlink:hover { box-shadow: 0 0 20px rgba(153,85,255,0.4); }
.btn-unlink:disabled { opacity: 0.5; cursor: not-allowed; }

.state-msg { text-align: center; padding: 60px 0; color: #8b8fa8; }
.alert-error { background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.25); border-radius: 10px; padding: 10px 14px; color: #ff7070; font-size: 13px; margin-bottom: 12px; }
</style>
