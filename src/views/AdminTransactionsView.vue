<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import { getAuditLogs, getAuditLogsByTransaction } from '../services/auditService.js'

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

// ── Filter options (static — all known actions/entity types) ─────────────────
const availableActions = [
  'USER_REGISTERED', 'PROFILE_UPDATED', 'BECOME_EVENT_MANAGER',
  'ADMIN_USER_UPDATED', 'ADMIN_USER_ROLE_CHANGED', 'ADMIN_USER_LOCKED', 'ADMIN_USER_DELETED',
  'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED',
  'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
  'REVIEW_CREATED', 'REVIEW_UPDATED', 'REVIEW_DELETED',
  'EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED', 'EVENT_JOINED', 'EVENT_LEFT',
]
const availableEntityTypes = ['USER', 'PRODUCT', 'CATEGORY', 'REVIEW', 'EVENT']

// ── Detail / Transaction modal ────────────────────────────────────────────────
const selectedLog      = ref(null)
const txLogs           = ref([])
const showTxModal      = ref(false)
const loadingTxLogs    = ref(false)

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

// ── Detail modal ──────────────────────────────────────────────────────────────
function openDetail(log) {
  selectedLog.value = log
  txLogs.value = []
  showTxModal.value = false
}

function closeDetail() {
  selectedLog.value = null
  txLogs.value = []
  showTxModal.value = false
}

async function loadTransactionLogs() {
  if (!selectedLog.value?.transactionId) return
  loadingTxLogs.value = true
  try {
    const token = await getAccessTokenSilently()
    txLogs.value = await getAuditLogsByTransaction(token, selectedLog.value.transactionId)
    showTxModal.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    loadingTxLogs.value = false
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

function parseJson(str) {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}

function actionColor(action) {
  if (!action) return 'badge-default'
  if (action.includes('CREATED') || action.includes('REGISTERED')) return 'badge-green'
  if (action.includes('UPDATED') || action.includes('PROFILE') || action.includes('LOCKED') || action.includes('ROLE')) return 'badge-cyan'
  if (action.includes('DELETED')) return 'badge-red'
  if (action.includes('MANAGER')) return 'badge-purple'
  return 'badge-default'
}

function entityColor(type) {
  const map = { USER: 'ent-user', PRODUCT: 'ent-product', CATEGORY: 'ent-category', REVIEW: 'ent-review' }
  return map[type] ?? 'ent-default'
}

// ── JSON diff ─────────────────────────────────────────────────────────────────
function computeDiff(oldStr, newStr) {
  const oldObj = parseJson(oldStr) ?? {}
  const newObj = parseJson(newStr) ?? {}
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  const diffs = []
  for (const key of keys) {
    const o = JSON.stringify(oldObj[key])
    const n = JSON.stringify(newObj[key])
    if (o !== n) diffs.push({ key, old: oldObj[key], new: newObj[key] })
  }
  return diffs
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
            <option v-for="a in availableActions" :key="a" :value="a">{{ a }}</option>
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
        <div class="result-count">{{ totalItems }} Einträge gefunden</div>

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
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in logs"
                :key="log.id"
                class="tx-row"
                @click="openDetail(log)"
              >
                <td class="col-date">{{ formatDate(log.createdAt) }}</td>
                <td class="col-tx">
                  <span class="tx-id">{{ log.transactionId }}</span>
                </td>
                <td class="col-user">
                  <span class="user-name">{{ log.userName || '—' }}</span>
                  <span v-if="log.userId" class="user-id">#{{ log.userId }}</span>
                </td>
                <td>
                  <span class="action-badge" :class="actionColor(log.action)">{{ log.action }}</span>
                </td>
                <td>
                  <span class="entity-badge" :class="entityColor(log.entityType)">
                    {{ log.entityType }} <span v-if="log.entityId" class="entity-id">#{{ log.entityId }}</span>
                  </span>
                </td>
                <td class="col-desc">{{ log.description }}</td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="6" class="empty-row">Keine Einträge gefunden.</td>
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

    <!-- ── Detail Modal ── -->
    <div v-if="selectedLog" class="modal-backdrop" @click.self="closeDetail">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div>
            <div class="modal-title">Transaktionsdetail</div>
            <div class="modal-sub">{{ selectedLog.transactionId }}</div>
          </div>
          <button class="modal-close" @click="closeDetail">✕</button>
        </div>

        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Datum</span>
            <span class="detail-val">{{ formatDate(selectedLog.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Aktion</span>
            <span class="action-badge" :class="actionColor(selectedLog.action)">{{ selectedLog.action }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Entität</span>
            <span class="entity-badge" :class="entityColor(selectedLog.entityType)">
              {{ selectedLog.entityType }} <span v-if="selectedLog.entityId">#{{ selectedLog.entityId }}</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Benutzer</span>
            <span class="detail-val">{{ selectedLog.userName || '—' }} <span v-if="selectedLog.userId" class="user-id">(ID {{ selectedLog.userId }})</span></span>
          </div>
          <div v-if="selectedLog.ipAddress" class="detail-row">
            <span class="detail-label">IP-Adresse</span>
            <span class="detail-val mono">{{ selectedLog.ipAddress }}</span>
          </div>
          <div class="detail-row full">
            <span class="detail-label">Beschreibung</span>
            <span class="detail-val">{{ selectedLog.description }}</span>
          </div>
        </div>

        <!-- Diff -->
        <template v-if="selectedLog.oldData || selectedLog.newData">
          <div class="section-title">Änderungen</div>
          <div class="diff-wrap">
            <template v-if="computeDiff(selectedLog.oldData, selectedLog.newData).length > 0">
              <div v-for="d in computeDiff(selectedLog.oldData, selectedLog.newData)" :key="d.key" class="diff-row">
                <span class="diff-key">{{ d.key }}</span>
                <span class="diff-old">{{ d.old ?? '—' }}</span>
                <span class="diff-arrow">→</span>
                <span class="diff-new">{{ d.new ?? '—' }}</span>
              </div>
            </template>
            <div v-else class="diff-none">Keine Feldänderungen erkannt.</div>
          </div>

          <div class="json-cols">
            <div v-if="selectedLog.oldData" class="json-panel">
              <div class="json-label">Vorher</div>
              <pre class="json-pre">{{ JSON.stringify(parseJson(selectedLog.oldData), null, 2) }}</pre>
            </div>
            <div v-if="selectedLog.newData" class="json-panel">
              <div class="json-label">Nachher</div>
              <pre class="json-pre">{{ JSON.stringify(parseJson(selectedLog.newData), null, 2) }}</pre>
            </div>
          </div>
        </template>

        <!-- Transaction chain -->
        <div class="section-title" style="margin-top:24px">Prozess-Kette</div>
        <div class="tx-chain-info">
          Alle Schritte mit Transaktions-ID <span class="mono">{{ selectedLog.transactionId }}</span>
        </div>
        <button v-if="!showTxModal" class="btn-load-tx" :disabled="loadingTxLogs" @click="loadTransactionLogs">
          {{ loadingTxLogs ? 'Wird geladen…' : 'Alle Schritte laden' }}
        </button>
        <div v-if="showTxModal" class="tx-chain-list">
          <div v-for="t in txLogs" :key="t.id" class="tx-chain-item" :class="{ 'tx-chain-current': t.id === selectedLog.id }">
            <span class="tx-chain-time">{{ formatDate(t.createdAt) }}</span>
            <span class="action-badge" :class="actionColor(t.action)">{{ t.action }}</span>
            <span class="tx-chain-desc">{{ t.description }}</span>
          </div>
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
  margin-bottom: 14px;
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
.tx-row { cursor: pointer; transition: background 0.15s; }
.tx-row:hover { background: rgba(0,221,255,0.03); }

.col-date  { color: rgba(255,255,255,0.4); font-size: 12px; white-space: nowrap; }
.col-tx    { font-family: 'Orbitron', sans-serif; font-size: 10px; }
.tx-id     { color: #00DDFF; letter-spacing: 0.5px; }
.col-user  { display: flex; align-items: center; gap: 6px; }
.user-name { font-weight: 500; color: white; }
.user-id   { font-size: 11px; color: rgba(255,255,255,0.3); }
.col-desc  { max-width: 320px; color: rgba(255,255,255,0.6); font-size: 12px; }
.empty-row { text-align: center; color: rgba(255,255,255,0.3); padding: 40px; }

/* ── Badges ── */
.action-badge {
  display: inline-block;
  font-family: 'Orbitron', sans-serif;
  font-size: 7.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
  font-weight: 700;
  white-space: nowrap;
}
.badge-green  { background: rgba(0,221,150,0.1);  border: 1px solid rgba(0,221,150,0.3);  color: #00dd96; }
.badge-cyan   { background: rgba(0,221,255,0.08); border: 1px solid rgba(0,221,255,0.25); color: #00DDFF; }
.badge-red    { background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.25); color: #ff5555; }
.badge-purple { background: rgba(153,85,255,0.1); border: 1px solid rgba(153,85,255,0.3); color: #9955FF; }
.badge-default{ background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); }

.entity-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Orbitron', sans-serif;
  font-size: 7.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
  font-weight: 700;
  white-space: nowrap;
}
.entity-id    { font-size: 9px; opacity: 0.7; }
.ent-user     { background: rgba(250,11,219,0.08); border: 1px solid rgba(250,11,219,0.25); color: #FA0BDB; }
.ent-product  { background: rgba(0,221,255,0.08);  border: 1px solid rgba(0,221,255,0.25);  color: #00DDFF; }
.ent-category { background: rgba(255,170,0,0.08);  border: 1px solid rgba(255,170,0,0.25);  color: #ffaa00; }
.ent-review   { background: rgba(153,85,255,0.08); border: 1px solid rgba(153,85,255,0.25); color: #9955FF; }
.ent-default  { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); }

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

/* ── Modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  overflow-y: auto;
}
.modal {
  background: #1e1e2e;
  border: 1px solid rgba(0,221,255,0.2);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
}
.modal-lg { max-width: 860px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}
.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
}
.modal-sub { font-family: 'Orbitron', sans-serif; font-size: 10px; color: #00DDFF; margin-top: 4px; }
.modal-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 16px;
  cursor: pointer;
}
.modal-close:hover { color: white; }

/* ── Detail grid ── */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  margin-bottom: 28px;
}
.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-row.full { grid-column: 1 / -1; }
.detail-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.detail-val { font-size: 13px; color: rgba(255,255,255,0.8); }
.mono { font-family: monospace; font-size: 12px; }

/* ── Diff ── */
.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding-bottom: 8px;
}
.diff-wrap {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.diff-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 12px;
}
.diff-row:last-child { border-bottom: none; }
.diff-key  { font-family: 'Orbitron', sans-serif; font-size: 9px; color: rgba(255,255,255,0.4); min-width: 120px; padding-top: 2px; }
.diff-old  { color: #ff7070; font-family: monospace; flex: 1; }
.diff-arrow{ color: rgba(255,255,255,0.3); }
.diff-new  { color: #00dd96; font-family: monospace; flex: 1; }
.diff-none { color: rgba(255,255,255,0.3); font-size: 13px; text-align: center; padding: 8px 0; }

.json-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}
.json-panel { display: flex; flex-direction: column; gap: 6px; }
.json-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}
.json-pre {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 12px;
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  font-family: monospace;
  overflow-x: auto;
  max-height: 260px;
  overflow-y: auto;
  white-space: pre;
  margin: 0;
}

/* ── TX chain ── */
.tx-chain-info { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 12px; }
.btn-load-tx {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 9px 18px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #00DDFF, #9955FF);
  color: #1e1e2e;
  cursor: pointer;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}
.btn-load-tx:hover:not(:disabled) { box-shadow: 0 0 16px rgba(0,221,255,0.3); }
.btn-load-tx:disabled { opacity: 0.5; cursor: not-allowed; }

.tx-chain-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.tx-chain-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  font-size: 12px;
}
.tx-chain-current {
  background: rgba(0,221,255,0.06);
  border-color: rgba(0,221,255,0.2);
}
.tx-chain-time { font-family: monospace; color: rgba(255,255,255,0.35); white-space: nowrap; }
.tx-chain-desc { color: rgba(255,255,255,0.6); flex: 1; }

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

@media (max-width: 700px) {
  .json-cols { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
