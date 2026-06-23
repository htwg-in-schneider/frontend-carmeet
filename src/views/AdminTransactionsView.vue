<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
import { getAuditLogs, deleteAuditLog, deleteAllAuditLogs } from '../services/auditService.js'

const { getAccessTokenSilently } = useAuth0()

// ── Data ──────────────────────────────────────────────────────────────────────
const logs       = ref([])
const totalPages = ref(0)
const totalItems = ref(0)
const loading    = ref(false)
const error      = ref(null)

// ── Filter state ─────────────────────────────────────────────────────────────
const filters = ref({
  search: '',
  action: '',
  entityType: '',
})
const page = ref(0)
const pageSize = 20

// ── Filter options ────────────────────────────────────────────────────────────
const availableActions = [
  { label: 'CREATED', value: 'CREATED' },
  { label: 'UPDATED', value: 'UPDATED' },
  { label: 'DELETED', value: 'DELETED' },
]
const availableEntityTypes = ['USER', 'PRODUCT', 'CATEGORY', 'REVIEW', 'EVENT']

function actionLabel(action) {
  if (!action) return '—'
  if (action.includes('CREATED') || action.includes('REGISTERED') || action.includes('JOINED') || action === 'BECOME_EVENT_MANAGER') return 'CREATED'
  if (action.includes('UPDATED') || action.includes('LOCKED') || action.includes('ROLE') || action.includes('LEFT') || action === 'PROFILE_UPDATED') return 'UPDATED'
  if (action.includes('DELETED')) return 'DELETED'
  return action
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deletingId           = ref(null)
const deletingAll          = ref(false)
const showDeleteAllConfirm = ref(false)
const confirmDeleteId      = ref(null)

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(fetchLogs)

async function fetchLogs() {
  loading.value = true
  error.value   = null
  try {
    const token = await getAccessTokenSilently()
    const result = await getAuditLogs(token, {
      page: page.value,
      size: pageSize,
      search:     filters.value.search     || undefined,
      action:     filters.value.action     || undefined,
      entityType: filters.value.entityType || undefined,
    })
    logs.value       = result?.content    ?? []
    totalPages.value = result?.totalPages ?? 0
    totalItems.value = result?.totalElements ?? 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 0
  fetchLogs()
}

function resetFilters() {
  filters.value = { search: '', action: '', entityType: '' }
  page.value = 0
  fetchLogs()
}

function goToPage(p) {
  page.value = p
  fetchLogs()
}

// ── Delete single ─────────────────────────────────────────────────────────────
async function deleteSingleLog(id) {
  confirmDeleteId.value = null
  deletingId.value = id
  try {
    const token = await getAccessTokenSilently()
    await deleteAuditLog(token, id)
    logs.value = logs.value.filter(l => l.id !== id)
    totalItems.value = Math.max(0, totalItems.value - 1)
  } catch (e) {
    error.value = e.message
  } finally {
    deletingId.value = null
  }
}

async function deleteAll() {
  deletingAll.value = true
  showDeleteAllConfirm.value = false
  try {
    const token = await getAccessTokenSilently()
    await deleteAllAuditLogs(token)
    logs.value = []
    totalItems.value = 0
    totalPages.value = 0
  } catch (e) {
    error.value = e.message
  } finally {
    deletingAll.value = false
  }
}

// ── Computed helpers ──────────────────────────────────────────────────────────
const pageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const cur = page.value
  const pages = new Set([0, total - 1, cur])
  for (let i = cur - 1; i <= cur + 1; i++) if (i >= 0 && i < total) pages.add(i)
  return [...pages].sort((a, b) => a - b)
})

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}


</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />

    <main class="admin-main">
      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Transaktionen</h1>
        <p class="page-sub">Audit-Log aller Benutzeraktionen in der Anwendung.</p>
      </div>

      <!-- ── Filter bar ── -->
      <div class="filter-bar">
        <div class="filter-row">
          <input
            v-model="filters.search"
            class="filter-input filter-wide"
            placeholder="Suche (Beschreibung, Benutzer, TID…)"
            @keyup.enter="applyFilters"
          />
          <select v-model="filters.action" class="filter-select">
            <option value="">Alle Aktionen</option>
            <option v-for="a in availableActions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
          <select v-model="filters.entityType" class="filter-select">
            <option value="">Alle Entitäten</option>
            <option v-for="t in availableEntityTypes" :key="t" :value="t">{{ t }}</option>
          </select>
          <button class="btn-filter" @click="applyFilters">Filtern</button>
          <button class="btn-reset"  @click="resetFilters">Zurücksetzen</button>
        </div>
      </div>

      <!-- ── State ── -->
      <div v-if="loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else>
        <div class="result-toolbar">
          <div class="result-count">{{ totalItems }} Einträge gefunden</div>
          <button v-if="logs.length > 0" class="btn-delete-all" :disabled="deletingAll" @click="showDeleteAllConfirm = true">
            {{ deletingAll ? 'Wird gelöscht…' : 'Alle löschen' }}
          </button>
        </div>

        <!-- ── Table ── -->
        <div class="table-wrap">
          <table class="tx-table">
            <thead>
              <tr>
                <th>Datum/Zeit</th>
                <th>Transaktions-ID</th>
                <th>Benutzer</th>
                <th>Aktion</th>
                <th>Entität</th>
                <th>Beschreibung</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in logs"
                :key="log.id"
                class="tx-row"
              >
                <td class="col-date">{{ formatDate(log.createdAt) }}</td>
                <td class="col-tx">
                  <span class="tx-id">{{ log.transactionId }}</span>
                </td>
                <td class="col-user">
                  <span class="user-name">{{ log.userName || '—' }}</span>
                  <span v-if="log.userId" class="user-id">#{{ log.userId }}</span>
                </td>
                <td class="col-plain">{{ actionLabel(log.action) }}</td>
                <td class="col-plain">
                  {{ log.entityType || '—' }}<span v-if="log.entityId" class="entity-id"> #{{ log.entityId }}</span>
                </td>
                <td class="col-desc">{{ log.description }}</td>
                <td>
                  <button class="btn-row-delete" :disabled="deletingId === log.id" @click="confirmDeleteId = log.id" title="Löschen">
                    {{ deletingId === log.id ? '…' : '✕' }}
                  </button>
                </td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="7" class="empty-row">Keine Einträge gefunden.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Pagination ── -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pg-btn" :disabled="page === 0" @click="goToPage(page - 1)">‹</button>
          <template v-for="(p, i) in pageNumbers" :key="p">
            <span v-if="i > 0 && pageNumbers[i] - pageNumbers[i-1] > 1" class="pg-ellipsis">…</span>
            <button class="pg-btn" :class="{ 'pg-active': p === page }" @click="goToPage(p)">{{ p + 1 }}</button>
          </template>
          <button class="pg-btn" :disabled="page >= totalPages - 1" @click="goToPage(page + 1)">›</button>
        </div>
      </template>
    </main>

    <ConfirmDeleteModal
      v-if="showDeleteAllConfirm"
      title="Alle Einträge löschen?"
      message="Alle Audit-Log-Einträge werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
      :loading="deletingAll"
      @confirm="deleteAll"
      @cancel="showDeleteAllConfirm = false"
    />

    <ConfirmDeleteModal
      v-if="confirmDeleteId !== null"
      title="Eintrag löschen?"
      message="Dieser Audit-Log-Eintrag wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
      :loading="deletingId === confirmDeleteId"
      @confirm="deleteSingleLog(confirmDeleteId)"
      @cancel="confirmDeleteId = null"
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

.admin-main {
  max-width: 1300px;
  margin: 0 auto;
  padding: 112px 5% 80px;
}

.page-header { margin-bottom: 28px; }
.page-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00DDFF;
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

/* ── Filter bar ── */
.filter-bar {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-input,
.filter-select {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 9px 13px;
  color: white;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.filter-input:focus,
.filter-select:focus { border-color: rgba(0,221,255,0.5); }
.filter-select option { background: #272736; }
.filter-wide  { flex: 1; min-width: 220px; }
.filter-narrow { width: 120px; }
.filter-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}
.btn-filter,
.btn-reset {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 9px 18px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: box-shadow 0.2s, opacity 0.2s;
}
.btn-filter {
  border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
}
.btn-filter:hover { box-shadow: 0 0 16px rgba(153,85,255,0.4); }
.btn-reset {
  border: 1px solid rgba(255,255,255,0.15);
  background: none;
  color: rgba(255,255,255,0.5);
}
.btn-reset:hover { color: white; border-color: rgba(255,255,255,0.3); }

/* ── Table ── */
.result-count {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}
.table-wrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 24px;
}
.tx-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.tx-table thead { background: rgba(255,255,255,0.04); }
.tx-table th {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  padding: 13px 14px;
  text-align: left;
  white-space: nowrap;
}
.tx-table td {
  padding: 12px 14px;
  color: rgba(255,255,255,0.75);
  border-top: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}
.tx-row { transition: background 0.15s; }
.tx-row:hover { background: rgba(0,221,255,0.03); }

.col-date  { color: rgba(255,255,255,0.4); font-size: 12px; white-space: nowrap; }
.col-tx    { font-family: 'Orbitron', sans-serif; font-size: 10px; }
.tx-id     { color: #00DDFF; letter-spacing: 0.5px; }
.col-user  { display: flex; align-items: center; gap: 6px; }
.user-name { font-weight: 500; color: white; }
.user-id   { font-size: 11px; color: rgba(255,255,255,0.3); }
.col-desc  { max-width: 320px; color: rgba(255,255,255,0.6); font-size: 12px; }
.empty-row { text-align: center; color: rgba(255,255,255,0.3); padding: 40px; }

.col-plain { color: rgba(255,255,255,0.75); font-size: 13px; }
.entity-id { font-size: 11px; color: rgba(255,255,255,0.35); }

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  margin-top: 8px;
}
.pg-btn {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  background: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.pg-btn:hover:not(:disabled) { background: rgba(0,221,255,0.08); color: #00DDFF; }
.pg-btn:disabled { opacity: 0.3; cursor: default; }
.pg-active { background: rgba(0,221,255,0.12) !important; color: #00DDFF !important; border-color: rgba(0,221,255,0.3) !important; }
.pg-ellipsis { color: rgba(255,255,255,0.3); font-size: 12px; padding: 0 4px; }

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.btn-delete-all {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255,60,60,0.3);
  background: none;
  color: #ff5555;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-delete-all:hover:not(:disabled) { background: rgba(255,60,60,0.08); }
.btn-delete-all:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-row-delete {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255,60,60,0.25);
  background: none;
  color: rgba(255,80,80,0.7);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-row-delete:hover:not(:disabled) { background: rgba(255,60,60,0.08); color: #ff5555; }
.btn-row-delete:disabled { opacity: 0.3; cursor: not-allowed; }

.state-msg { text-align: center; padding: 60px 0; color: #8b8fa8; }
.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px;
  padding: 12px 16px;
  color: #ff7070;
  font-size: 13px;
  margin-bottom: 16px;
}

</style>
