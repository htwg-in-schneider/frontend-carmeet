<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'

const { getAccessTokenSilently } = useAuth0()
const BASE = '/api'

// ── State ─────────────────────────────────────────────────────────────────────
const reviews   = ref([])
const products  = ref([])
const loading   = ref(false)
const error     = ref(null)
const search    = ref('')
const productFilter = ref('')

// ── Edit modal ────────────────────────────────────────────────────────────────
const editingReview = ref(null)
const editForm      = ref({ userName: '', text: '', stars: 5 })
const saving        = ref(false)
const saveError     = ref(null)

// ── Delete confirm ────────────────────────────────────────────────────────────
const confirmDeleteId = ref(null)
const deleting        = ref(false)

onMounted(async () => {
  await Promise.all([fetchReviews(), fetchProducts()])
})

async function fetchReviews() {
  loading.value = true
  error.value   = null
  try {
    const res = await fetch(`${BASE}/review`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    reviews.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(`${BASE}/product`)
    if (res.ok) products.value = await res.json()
  } catch { /* ignore */ }
}

function productTitle(productId) {
  const p = products.value.find(p => p.id === productId)
  return p ? p.title : `Fahrzeug #${productId}`
}

// ── Filtered list ─────────────────────────────────────────────────────────────
const filteredReviews = computed(() => {
  let list = reviews.value
  if (productFilter.value) {
    list = list.filter(r => r.product?.id === Number(productFilter.value))
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(r =>
      (r.userName ?? '').toLowerCase().includes(q) ||
      (r.text     ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

// ── Edit ──────────────────────────────────────────────────────────────────────
function startEdit(review) {
  editingReview.value = review
  editForm.value = { userName: review.userName ?? '', text: review.text ?? '', stars: review.stars ?? 5 }
  saveError.value = null
}

function cancelEdit() {
  editingReview.value = null
  saveError.value = null
}

async function submitEdit() {
  saving.value = true
  saveError.value = null
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${BASE}/review/${editingReview.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userName: editForm.value.userName,
        text:     editForm.value.text,
        stars:    Number(editForm.value.stars),
        product:  { id: editingReview.value.product?.id },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const updated = await res.json()
    const idx = reviews.value.findIndex(r => r.id === updated.id)
    if (idx !== -1) reviews.value[idx] = updated
    editingReview.value = null
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function askDelete(id) {
  confirmDeleteId.value = id
}

function cancelDelete() {
  confirmDeleteId.value = null
}

async function confirmDelete() {
  deleting.value = true
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${BASE}/review/${confirmDeleteId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    reviews.value = reviews.value.filter(r => r.id !== confirmDeleteId.value)
    confirmDeleteId.value = null
  } catch (e) {
    error.value = e.message
  } finally {
    deleting.value = false
  }
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />

    <main class="admin-main">
      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Bewertungen</h1>
        <p class="page-sub">Alle Fahrzeugbewertungen einsehen, bearbeiten und löschen.</p>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <input
          v-model="search"
          class="filter-input filter-wide"
          placeholder="Suche nach Autor oder Inhalt…"
        />
        <select v-model="productFilter" class="filter-select">
          <option value="">Alle Fahrzeuge</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </div>

      <div v-if="loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else>
        <div class="result-count">{{ filteredReviews.length }} Bewertungen gefunden</div>

        <div class="table-wrap">
          <table class="reviews-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fahrzeug</th>
                <th>Autor</th>
                <th>Sterne</th>
                <th>Bewertungstext</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="review in filteredReviews" :key="review.id">
                <td class="col-id">{{ review.id }}</td>
                <td class="col-product">{{ review.product ? productTitle(review.product.id) : '—' }}</td>
                <td class="col-author">{{ review.userName || '—' }}</td>
                <td class="col-stars">
                  <span class="stars-display">{{ stars(review.stars) }}</span>
                </td>
                <td class="col-text">{{ review.text }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-sm btn-edit" @click="startEdit(review)">Bearbeiten</button>
                    <button class="btn-sm btn-delete" @click="askDelete(review.id)">Löschen</button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredReviews.length === 0">
                <td colspan="6" class="empty-row">Keine Bewertungen gefunden.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </main>

    <!-- Edit Modal -->
    <div v-if="editingReview" class="modal-backdrop" @click.self="cancelEdit">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Bewertung bearbeiten</div>
          <button class="modal-close" @click="cancelEdit">✕</button>
        </div>
        <form @submit.prevent="submitEdit" class="modal-form">
          <div v-if="saveError" class="alert-error">{{ saveError }}</div>
          <div class="field">
            <label>Autor</label>
            <input v-model="editForm.userName" type="text" placeholder="Name des Autors" />
          </div>
          <div class="field">
            <label>Sterne (1–5)</label>
            <select v-model="editForm.stars">
              <option :value="1">1 ★</option>
              <option :value="2">2 ★★</option>
              <option :value="3">3 ★★★</option>
              <option :value="4">4 ★★★★</option>
              <option :value="5">5 ★★★★★</option>
            </select>
          </div>
          <div class="field">
            <label>Bewertungstext</label>
            <textarea v-model="editForm.text" rows="4" placeholder="Text der Bewertung…"></textarea>
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

    <!-- Delete Confirm Modal -->
    <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal modal-sm">
        <div class="modal-header">
          <div class="modal-title">Bewertung löschen</div>
          <button class="modal-close" @click="cancelDelete">✕</button>
        </div>
        <p class="modal-body-text">Soll diese Bewertung wirklich unwiderruflich gelöscht werden?</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelDelete">Abbrechen</button>
          <button class="btn-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Wird gelöscht…' : 'Löschen' }}
          </button>
        </div>
      </div>
    </div>
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
.page-label { font-family:'Orbitron',sans-serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#00DDFF; margin-bottom:10px; }
.page-title { font-family:'Orbitron',sans-serif; font-size:clamp(22px,3.5vw,36px); font-weight:700; color:#FA0BDB; margin:0 0 8px; }
.page-sub   { font-size:13px; color:rgba(255,255,255,0.4); margin:0; }

.filter-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
.filter-input, .filter-select {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius:10px; padding:9px 13px; color:white; font-size:13px;
  font-family:inherit; outline:none; transition:border-color 0.2s;
}
.filter-input:focus, .filter-select:focus { border-color:rgba(0,221,255,0.5); }
.filter-select option { background:#272736; }
.filter-wide { flex:1; min-width:200px; }

.result-count { font-family:'Orbitron',sans-serif; font-size:9px; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:14px; }

.table-wrap { overflow-x:auto; border-radius:16px; border:1px solid rgba(255,255,255,0.06); }
.reviews-table { width:100%; border-collapse:collapse; font-size:13px; }
.reviews-table thead { background:rgba(255,255,255,0.04); }
.reviews-table th { font-family:'Orbitron',sans-serif; font-size:8.5px; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,0.35); padding:13px 14px; text-align:left; white-space:nowrap; }
.reviews-table td { padding:12px 14px; color:rgba(255,255,255,0.75); border-top:1px solid rgba(255,255,255,0.05); vertical-align:middle; }
.reviews-table tbody tr:hover { background:rgba(255,255,255,0.02); }

.col-id      { color:rgba(255,255,255,0.3); font-size:12px; }
.col-product { font-weight:500; color:white; max-width:180px; }
.col-author  { color:rgba(255,255,255,0.7); }
.col-stars   { white-space:nowrap; }
.stars-display { color:#ffaa00; letter-spacing:2px; }
.col-text    { max-width:300px; color:rgba(255,255,255,0.55); font-size:12px; }
.empty-row   { text-align:center; color:rgba(255,255,255,0.3); padding:40px; }

.action-btns { display:flex; gap:6px; }
.btn-sm { font-family:'Orbitron',sans-serif; font-size:8px; letter-spacing:0.8px; text-transform:uppercase; padding:6px 12px; border-radius:20px; border:1px solid; cursor:pointer; white-space:nowrap; transition:background 0.2s; }
.btn-edit   { border-color:rgba(0,221,255,0.3); background:none; color:#00DDFF; }
.btn-edit:hover { background:rgba(0,221,255,0.08); }
.btn-delete { border-color:rgba(255,60,60,0.3); background:none; color:#ff5555; }
.btn-delete:hover { background:rgba(255,60,60,0.08); }

/* Modal */
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px; }
.modal { background:#1e1e2e; border:1px solid rgba(0,221,255,0.2); border-radius:20px; padding:32px; width:100%; max-width:480px; }
.modal-sm { max-width:360px; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.modal-title { font-family:'Orbitron',sans-serif; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:white; }
.modal-close { background:none; border:none; color:rgba(255,255,255,0.4); font-size:14px; cursor:pointer; }
.modal-close:hover { color:white; }
.modal-body-text { font-size:14px; color:rgba(255,255,255,0.5); margin:0 0 24px; }
.modal-form { display:flex; flex-direction:column; gap:16px; }
.field { display:flex; flex-direction:column; gap:6px; }
.field label { font-family:'Orbitron',sans-serif; font-size:8.5px; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,0.4); }
.field input, .field select, .field textarea {
  background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px;
  padding:11px 14px; color:white; font-size:14px; font-family:inherit; outline:none; transition:border-color 0.2s; resize:vertical;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color:rgba(0,221,255,0.5); }
.field select option { background:#272736; }
.modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
.btn-cancel { font-family:'Orbitron',sans-serif; font-size:9px; letter-spacing:1px; text-transform:uppercase; padding:10px 20px; border-radius:20px; border:1px solid rgba(255,255,255,0.15); background:none; color:rgba(255,255,255,0.5); cursor:pointer; }
.btn-cancel:hover { color:white; border-color:rgba(255,255,255,0.3); }
.btn-save { font-family:'Orbitron',sans-serif; font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; padding:10px 24px; border-radius:20px; border:none; background:linear-gradient(135deg,#FA0BDB,#9955FF); color:white; cursor:pointer; transition:box-shadow 0.2s,opacity 0.2s; }
.btn-save:hover { box-shadow:0 0 20px rgba(153,85,255,0.4); }
.btn-save:disabled { opacity:0.5; cursor:not-allowed; }
.btn-danger { font-family:'Orbitron',sans-serif; font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; padding:10px 24px; border-radius:20px; border:none; background:linear-gradient(135deg,#ff3333,#cc0000); color:white; cursor:pointer; }
.btn-danger:hover { box-shadow:0 0 20px rgba(255,60,60,0.3); }
.btn-danger:disabled { opacity:0.5; cursor:not-allowed; }

.state-msg { text-align:center; padding:60px 0; color:#8b8fa8; }
.alert-error { background:rgba(255,60,60,0.08); border:1px solid rgba(255,60,60,0.25); border-radius:10px; padding:10px 14px; color:#ff7070; font-size:13px; margin-bottom:12px; }
</style>
