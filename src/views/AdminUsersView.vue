<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import { getAllUsers, updateUserRole, updateUser } from '../services/adminService.js'

const { getAccessTokenSilently } = useAuth0()

const users = ref([])
const loading = ref(false)
const error = ref(null)

const editingUser = ref(null)
const editForm = ref({ firstName: '', lastName: '', email: '', role: 'USER' })
const saving = ref(false)
const saveError = ref(null)

onMounted(fetchUsers)

async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    const token = await getAccessTokenSilently()
    users.value = await getAllUsers(token)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function effectiveRole(user) {
  return user.eventManager ? 'EVENTMANAGER' : (user.role ?? 'USER')
}

function startEdit(user) {
  editingUser.value = user
  editForm.value = {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    role: effectiveRole(user),
  }
  saveError.value = null
}

function cancelEdit() {
  editingUser.value = null
  saveError.value = null
}

async function submitEdit() {
  saving.value = true
  saveError.value = null
  try {
    const token = await getAccessTokenSilently()
    let updated = await updateUser(token, editingUser.value.id, {
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      email: editForm.value.email,
    })
    if (editForm.value.role !== effectiveRole(editingUser.value)) {
      updated = await updateUserRole(token, editingUser.value.id, editForm.value.role)
    }
    const idx = users.value.findIndex(u => u.id === (updated?.id ?? editingUser.value.id))
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...updated }
    editingUser.value = null
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

function displayName(user) {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ')
  }
  return user.email || `User #${user.id}`
}
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />

    <main class="admin-main">
      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Nutzerverwaltung</h1>
        <p class="page-sub">Alle Benutzer anzeigen, bearbeiten und löschen.</p>
      </div>

      <div v-if="loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else>
        <div class="users-count">{{ users.length }} Nutzer gefunden</div>

        <div class="users-table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="col-id">{{ user.id }}</td>
                <td>
                  <div class="user-name-cell">
                    <span class="user-name">{{ displayName(user) }}</span>
                    <span v-if="user.locked" class="locked-badge">Gesperrt</span>
                  </div>
                </td>
                <td class="col-email">{{ user.email || '—' }}</td>
                <td>
                  <span class="role-badge" :class="user.role === 'ADMIN' ? 'badge-admin' : user.eventManager ? 'badge-em' : 'badge-user'">
                    {{ effectiveRole(user) }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-sm btn-edit" @click="startEdit(user)">Bearbeiten</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Edit Modal -->
      <div v-if="editingUser" class="modal-backdrop" @click.self="cancelEdit">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Nutzer bearbeiten</div>
            <button class="modal-close" @click="cancelEdit">✕</button>
          </div>
          <form @submit.prevent="submitEdit" class="modal-form">
            <div v-if="saveError" class="alert-error">{{ saveError }}</div>
            <div class="field">
              <label>Vorname</label>
              <input v-model="editForm.firstName" type="text" placeholder="Vorname" />
            </div>
            <div class="field">
              <label>Nachname</label>
              <input v-model="editForm.lastName" type="text" placeholder="Nachname" />
            </div>
            <div class="field">
              <label>E-Mail</label>
              <input v-model="editForm.email" type="email" placeholder="E-Mail-Adresse" />
            </div>
            <div class="field">
              <label>Rolle</label>
              <select v-model="editForm.role">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="EVENTMANAGER">Eventmanager</option>
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

.state-msg {
  text-align: center;
  padding: 60px 0;
  color: #8b8fa8;
}


.page-header { margin-bottom: 32px; }

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

.page-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin: 0;
}

.users-count {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 16px;
}

.users-table-wrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.users-table thead {
  background: rgba(255,255,255,0.04);
}

.users-table th {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  padding: 14px 16px;
  text-align: left;
  white-space: nowrap;
}

.users-table td {
  padding: 14px 16px;
  color: rgba(255,255,255,0.75);
  border-top: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}

.users-table tbody tr:hover {
  background: rgba(255,255,255,0.02);
}

.col-id { color: rgba(255,255,255,0.3); font-size: 12px; }
.col-email { font-size: 12px; color: rgba(255,255,255,0.5); }

.user-name-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.user-name { font-weight: 500; color: white; }

.locked-badge {
  display: inline-block;
  font-family: 'Orbitron', sans-serif;
  font-size: 7.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 700;
  background: rgba(255,170,0,0.1);
  border: 1px solid rgba(255,170,0,0.35);
  color: #ffaa00;
}

.role-badge {
  display: inline-block;
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
}
.badge-admin {
  background: rgba(250,11,219,0.12);
  border: 1px solid rgba(250,11,219,0.35);
  color: #FA0BDB;
}
.badge-user {
  background: rgba(0,221,255,0.08);
  border: 1px solid rgba(0,221,255,0.25);
  color: #00DDFF;
}
.badge-em {
  background: rgba(153,85,255,0.1);
  border: 1px solid rgba(153,85,255,0.35);
  color: #9955FF;
}

.action-btns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

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
  transition: background 0.2s, box-shadow 0.2s;
}

.btn-edit {
  border-color: rgba(0,221,255,0.3);
  background: none;
  color: #00DDFF;
}
.btn-edit:hover { background: rgba(0,221,255,0.08); }

.btn-role {
  border-color: rgba(153,85,255,0.3);
  background: none;
  color: #9955FF;
}
.btn-role:hover { background: rgba(153,85,255,0.08); }

.btn-lock {
  border-color: rgba(255,170,0,0.3);
  background: none;
  color: #ffaa00;
}
.btn-lock:hover { background: rgba(255,170,0,0.08); }

.btn-unlock {
  border-color: rgba(0,221,150,0.3);
  background: none;
  color: #00dd96;
}
.btn-unlock:hover { background: rgba(0,221,150,0.08); }

.btn-delete {
  border-color: rgba(255,60,60,0.3);
  background: none;
  color: #ff5555;
}
.btn-delete:hover { background: rgba(255,60,60,0.08); }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
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
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.modal-close:hover { color: white; }

.modal-body-text {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.field input,
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
}
.field input:focus,
.field select:focus { border-color: rgba(0,221,255,0.5); }
.field select option { background: #272736; }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  background: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
}
.btn-cancel:hover { color: white; border-color: rgba(255,255,255,0.3); }

.btn-save {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 10px 24px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF);
  color: white;
  cursor: pointer;
  transition: box-shadow 0.2s, opacity 0.2s;
}
.btn-save:hover { box-shadow: 0 0 20px rgba(153,85,255,0.4); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-danger {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 10px 24px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ff3333, #cc0000);
  color: white;
  cursor: pointer;
}
.btn-danger:hover { box-shadow: 0 0 20px rgba(255,60,60,0.3); }

.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px;
  padding: 10px 14px;
  color: #ff7070;
  font-size: 13px;
}
</style>
