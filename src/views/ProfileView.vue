<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import { useRoute } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'

const { user } = useAuth0()
const userStore = useUserStore()
const route = useRoute()

const inUserArea = computed(() => route.meta?.hideGlobalNav === true)

const editing = ref(false)
const saveError = ref(null)
const saveSuccess = ref(false)

const form = ref({ firstName: '', lastName: '', address: '', phone: '' })

const profile = computed(() => userStore.profile)

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
    form.value.address = profile.value.address ?? ''
    form.value.phone = profile.value.phone ?? ''
  }
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
      address: form.value.address,
      phone: form.value.phone,
    })
    editing.value = false
    saveSuccess.value = true
  } catch (e) {
    saveError.value = e.message
  }
}
</script>

<template>
  <div :class="inUserArea ? 'user-layout' : ''">
    <UserNavbar v-if="inUserArea" />

  <div class="profile-wrapper">
    <router-link :to="inUserArea ? '/user' : '/'" class="back-link">← Zurück</router-link>

    <div v-if="userStore.loading && !profile" class="state-msg">Profil wird geladen…</div>

    <template v-else>
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
            <div class="profile-label">Profil</div>
            <h1 class="profile-name">{{ user?.name }}</h1>
            <div class="profile-email">{{ user?.email }}</div>
            <span class="role-badge" :class="profile?.role === 'ADMIN' ? 'badge-admin' : 'badge-user'">
              {{ profile?.role ?? 'USER' }}
            </span>
          </div>
        </div>

        <div v-if="saveSuccess" class="alert-success">Profil erfolgreich gespeichert.</div>
        <div v-if="saveError" class="alert-error">{{ saveError }}</div>

        <template v-if="!editing">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Vorname</div>
              <div class="info-value">{{ profile?.firstName || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nachname</div>
              <div class="info-value">{{ profile?.lastName || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Adresse</div>
              <div class="info-value">{{ profile?.address || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Telefon</div>
              <div class="info-value">{{ profile?.phone || '—' }}</div>
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
              <label>Nachname</label>
              <input v-model="form.lastName" type="text" placeholder="Mustermann" />
            </div>
            <div class="field">
              <label>Adresse</label>
              <input v-model="form.address" type="text" placeholder="Musterstraße 1, 12345 Stadt" />
            </div>
            <div class="field">
              <label>Telefon</label>
              <input v-model="form.phone" type="tel" placeholder="+49 123 456789" />
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
    </template>
  </div>
  </div>
</template>

<style scoped>
.user-layout {
  min-height: 100vh;
  background: #080818;
}

.profile-wrapper {
  max-width: 680px;
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

.state-msg {
  text-align: center;
  padding: 60px 0;
  color: #8b8fa8;
}

.profile-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 40px;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 36px;
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

.profile-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 6px;
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

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
</style>
