<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import { becomeEventManager } from '../services/profileService.js'
import UserNavbar from '../components/UserNavbar.vue'
import AdminNavbar from '../components/AdminNavbar.vue'

const { user, getAccessTokenSilently } = useAuth0()
const userStore = useUserStore()

const editing = ref(false)
const saveError = ref(null)
const saveSuccess = ref(false)
const form = ref({ firstName: '', lastName: '', birthDate: '' })
const profile = computed(() => userStore.profile)

// Eventmanager inline box
const emExpanded = ref(false)
const emSubmitting = ref(false)
const emError = ref(null)
const emForm = ref({ cardHolder: '', cardNumber: '', expiry: '', cvc: '' })

const cardNumberStripped = computed(() => emForm.value.cardNumber.replace(/\D/g, ''))
const cardNumberValid = computed(() => /^\d{13,19}$/.test(cardNumberStripped.value))
const expiryValid = computed(() => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(emForm.value.expiry)) return false
  const [mm, yy] = emForm.value.expiry.split('/')
  const now = new Date()
  const expYear = 2000 + parseInt(yy)
  const expMonth = parseInt(mm)
  return expYear > now.getFullYear() || (expYear === now.getFullYear() && expMonth >= now.getMonth() + 1)
})
const cvcValid = computed(() => /^\d{3,4}$/.test(emForm.value.cvc))
const cardHolderValid = computed(() => emForm.value.cardHolder.trim().length >= 2)
const emCanSubmit = computed(() =>
  cardHolderValid.value && cardNumberValid.value && expiryValid.value && cvcValid.value
)

function onCardNumberInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 19)
  emForm.value.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function onExpiryInput(e) {
  let val = e.target.value.replace(/\D/g, '').slice(0, 4)
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
  emForm.value.expiry = val
}

async function submitEM() {
  if (!emCanSubmit.value) return
  emSubmitting.value = true
  emError.value = null
  try {
    const token = await getAccessTokenSilently()
    const updated = await becomeEventManager(token)
    userStore.profile.eventManager = updated.eventManager
    emExpanded.value = false
  } catch (e) {
    emError.value = e.message
  } finally {
    emSubmitting.value = false
  }
}

onMounted(async () => {
  if (!profile.value) {
    await userStore.fetchProfile()
  }
  fillForm()
})

function fillForm() {
  if (profile.value) {
    form.value.firstName = profile.value.firstName ?? ''
    form.value.lastName = profile.value.lastName ?? ''
    form.value.birthDate = profile.value.birthDate ?? ''
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function startEdit() {
  fillForm()
  saveError.value = null
  saveSuccess.value = false
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  saveError.value = null
}

async function submitEdit() {
  saveError.value = null
  saveSuccess.value = false
  try {
    await userStore.saveProfile({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      birthDate: form.value.birthDate || null,
    })
    editing.value = false
    saveSuccess.value = true
  } catch (e) {
    saveError.value = e.message
  }
}
</script>

<template>
  <div class="user-layout">
    <AdminNavbar v-if="userStore.isAdmin" />
    <UserNavbar v-else />

    <div class="profile-wrapper">
      <div class="page-header">
        <div class="page-label">{{ userStore.isAdmin ? 'Admin' : 'Mein Bereich' }}</div>
        <h1 class="page-title">Profil</h1>
      </div>

      <div v-if="userStore.loading && !profile" class="state-msg">Profil wird geladen…</div>

      <template v-else>
        <!-- Profile card -->
        <div class="profile-card">
          <div class="profile-top">
            <img
              v-if="user?.picture"
              :src="user.picture"
              :alt="user.name"
              class="profile-avatar"
            />
            <span v-else class="profile-avatar-fallback">{{ user?.name?.[0] ?? '?' }}</span>

            <div class="profile-meta">
              <h1 class="profile-name">{{ user?.name }}</h1>
              <div class="profile-email">{{ user?.email }}</div>
              <span class="role-badge" :class="profile?.role === 'ADMIN' ? 'badge-admin' : profile?.eventManager ? 'badge-em' : 'badge-user'">
                {{ profile?.role === 'ADMIN' ? 'ADMIN' : profile?.eventManager ? 'EVENTMANAGER' : 'USER' }}
              </span>
            </div>
          </div>

          <div v-if="saveSuccess" class="alert-success">Profil erfolgreich gespeichert.</div>
          <div v-if="saveError" class="alert-error">{{ saveError }}</div>

          <template v-if="!editing">
            <div class="info-grid">
              <div class="info-item info-item-full">
                <div class="info-label">E-Mail</div>
                <div class="info-value">{{ user?.email || profile?.email || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Vorname</div>
                <div class="info-value">{{ profile?.firstName || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">{{ profile?.lastName || '—' }}</div>
              </div>
              <div class="info-item info-item-full">
                <div class="info-label">Geburtsdatum</div>
                <div class="info-value">{{ formatDate(profile?.birthDate) }}</div>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn-edit" @click="startEdit">Bearbeiten</button>
            </div>
          </template>

          <template v-else>
            <form class="edit-form" @submit.prevent="submitEdit">
              <div class="field">
                <label>Vorname</label>
                <input v-model="form.firstName" type="text" placeholder="Max" />
              </div>
              <div class="field">
                <label>Name</label>
                <input v-model="form.lastName" type="text" placeholder="Mustermann" />
              </div>
              <div class="field">
                <label>Geburtsdatum</label>
                <input v-model="form.birthDate" type="date" />
              </div>
              <div class="card-actions">
                <button type="button" class="btn-cancel" @click="cancelEdit">Abbrechen</button>
                <button type="submit" class="btn-save" :disabled="userStore.loading">
                  {{ userStore.loading ? 'Wird gespeichert…' : 'Speichern' }}
                </button>
              </div>
            </form>
          </template>
        </div>

        <!-- Eventmanager-Abo box (only for USER role) -->
        <div v-if="profile?.role === 'USER' && !profile?.eventManager" class="em-box" :class="{ expanded: emExpanded }">
          <div class="em-header">
            <div class="em-title">Eventmanager-Abo</div>
            <div class="em-price">19,99€ – einmalige Kosten</div>
            <button class="btn-become-em" @click="emExpanded = !emExpanded">
              {{ emExpanded ? 'Abbrechen' : 'Jetzt Eventmanager werden' }}
            </button>
          </div>

          <div class="em-form-wrap">
            <div class="em-divider"></div>

            <div v-if="emError" class="alert-error em-alert">{{ emError }}</div>

            <form class="em-form" @submit.prevent="submitEM">
              <div class="field">
                <label>Karteninhaber</label>
                <input
                  v-model="emForm.cardHolder"
                  type="text"
                  placeholder="Max Mustermann"
                  autocomplete="cc-name"
                />
              </div>

              <div class="field">
                <label>Kartennummer</label>
                <input
                  :value="emForm.cardNumber"
                  @input="onCardNumberInput"
                  type="text"
                  inputmode="numeric"
                  placeholder="0000 0000 0000 0000"
                  maxlength="23"
                  autocomplete="cc-number"
                  :class="{ 'input-error': emForm.cardNumber && !cardNumberValid }"
                />
                <span v-if="emForm.cardNumber && !cardNumberValid" class="field-hint error">Ungültige Kartennummer</span>
              </div>

              <div class="field-row">
                <div class="field">
                  <label>Ablaufdatum</label>
                  <input
                    :value="emForm.expiry"
                    @input="onExpiryInput"
                    type="text"
                    inputmode="numeric"
                    placeholder="MM/JJ"
                    maxlength="5"
                    autocomplete="cc-exp"
                    :class="{ 'input-error': emForm.expiry && !expiryValid }"
                  />
                  <span v-if="emForm.expiry && !expiryValid" class="field-hint error">
                    {{ /^(0[1-9]|1[0-2])\/\d{2}$/.test(emForm.expiry) ? 'Karte ist abgelaufen' : 'Format: MM/JJ' }}
                  </span>
                </div>

                <div class="field">
                  <label>CVC</label>
                  <input
                    v-model="emForm.cvc"
                    type="text"
                    inputmode="numeric"
                    placeholder="123"
                    maxlength="4"
                    autocomplete="cc-csc"
                    :class="{ 'input-error': emForm.cvc && !cvcValid }"
                  />
                  <span v-if="emForm.cvc && !cvcValid" class="field-hint error">3–4 Ziffern</span>
                </div>
              </div>

<div class="em-actions">
                <button type="submit" class="btn-subscribe" :disabled="!emCanSubmit || emSubmitting">
                  {{ emSubmitting ? 'Wird verarbeitet…' : 'Abo abschließen' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>
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

.profile-wrapper {
  max-width: 680px;
  margin: 0 auto;
  padding: 112px 5% 80px;
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
  margin: 0;
}

.state-msg {
  text-align: center;
  padding: 60px 0;
  color: #8b8fa8;
}

/* ── Profile card ────────────────────────────── */
.profile-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 40px;
}

@media (max-width: 480px) {
  .profile-card { padding: 24px 20px; }
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #00DDFF;
  object-fit: cover;
  flex-shrink: 0;
}

.profile-avatar-fallback {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #00DDFF;
  background: #272736;
  color: #00DDFF;
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-name {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(18px, 3vw, 26px);
  font-weight: 700;
  color: white;
  margin: 0 0 4px;
}

.profile-email {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 10px;
}

.role-badge {
  display: inline-block;
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
}
.badge-admin {
  background: rgba(250,11,219,0.15);
  border: 1px solid rgba(250,11,219,0.4);
  color: #FA0BDB;
}
.badge-user {
  background: rgba(0,221,255,0.1);
  border: 1px solid rgba(0,221,255,0.3);
  color: #00DDFF;
}
.badge-em {
  background: rgba(153,85,255,0.12);
  border: 1px solid rgba(153,85,255,0.4);
  color: #9955FF;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}
@media (max-width: 480px) {
  .info-grid { grid-template-columns: 1fr; }
}

.info-item { display: flex; flex-direction: column; gap: 6px; }
.info-item-full { grid-column: 1 / -1; }
.info-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8b8fa8;
}
.info-value { font-size: 15px; color: white; }

.alert-success {
  background: rgba(0,221,255,0.08);
  border: 1px solid rgba(0,221,255,0.25);
  border-radius: 10px;
  padding: 12px 16px;
  color: #00DDFF;
  font-size: 14px;
  margin-bottom: 24px;
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field { display: flex; flex-direction: column; gap: 7px; }
.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8b8fa8;
}
.field input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 11px 14px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.field input:focus { border-color: rgba(0,221,255,0.5); }
.field input.input-error { border-color: rgba(255,60,60,0.5); }
.field input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); cursor: pointer; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 400px) {
  .field-row { grid-template-columns: 1fr; }
}

.field-hint { font-size: 11px; }
.field-hint.error { color: #ff7070; }

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 8px;
}

.btn-edit {
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
  transition: box-shadow 0.3s;
}
.btn-edit:hover { box-shadow: 0 0 36px rgba(153,85,255,0.5); }

.btn-cancel {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 11px 22px;
  border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.15);
  background: none;
  color: #8b8fa8;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-cancel:hover { border-color: rgba(255,255,255,0.3); color: white; }

.btn-save {
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
.btn-save:hover { box-shadow: 0 0 36px rgba(153,85,255,0.5); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Eventmanager box ────────────────────────── */
.em-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(153,85,255,0.2);
  border-radius: 20px;
  margin-top: 20px;
  overflow: hidden;
  transition: border-color 0.3s;
}
.em-box.expanded {
  border-color: rgba(153,85,255,0.45);
}

.em-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px 32px;
}
@media (max-width: 480px) {
  .em-header { padding: 22px 20px; }
}

.em-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #00DDFF;
  margin: 0;
}

.em-price {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0;
}

.btn-become-em {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 16px 28px;
  border-radius: 40px;
  border: none;
  background: linear-gradient(90deg, #FA0BDB, #9955FF, #00DDFF);
  color: white;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 0 28px rgba(250,11,219,0.3);
  transition: box-shadow 0.3s, opacity 0.2s;
}
.btn-become-em:hover {
  box-shadow: 0 0 44px rgba(250,11,219,0.5);
  opacity: 0.92;
}

.em-divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 0 32px;
}
@media (max-width: 480px) {
  .em-divider { margin: 0 20px; }
}

.em-form-wrap {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.45s ease;
}
.em-box.expanded .em-form-wrap {
  max-height: 900px;
}

.em-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 32px 32px;
}
@media (max-width: 480px) {
  .em-form { padding: 24px 20px 24px; }
}

.em-alert { margin: 0; }

.em-actions { display: flex; justify-content: flex-end; }

.btn-subscribe {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 13px 32px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #9955FF, #FA0BDB);
  color: white;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(153,85,255,0.35);
  transition: box-shadow 0.3s, opacity 0.2s;
}
.btn-subscribe:hover { box-shadow: 0 0 40px rgba(153,85,255,0.55); }
.btn-subscribe:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
</style>
