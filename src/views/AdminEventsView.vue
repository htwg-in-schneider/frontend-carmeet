<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import { useEventStore } from '../stores/eventStore.js'
import { getCategories } from '../services/categoryService.js'

const eventStore = useEventStore()

const expandedId = ref(null)
const categories = ref([])

const formModal = ref({ open: false, event: null })
const formData = ref({ title: '', category: '', address: '', date: '', maxParticipants: 20, description: '' })
const formSaving = ref(false)
const formError = ref(null)

const deleteConfirm = ref({ open: false, event: null })
const deleting = ref(false)

const participantsModal = ref({ open: false, event: null, list: [], loading: false })

const chatModal = ref({ open: false, event: null })
const chatScroll = ref(null)

onMounted(async () => {
  await eventStore.fetchEvents()
  try {
    const cats = await getCategories()
    categories.value = cats.map(c => typeof c === 'string' ? { id: null, name: c } : { id: c.id ?? null, name: c.name ?? c }).filter(c => c.name)
  } catch {
    categories.value = [
      { id: 1, name: 'Coupe' },
      { id: 2, name: 'Oldtimer' },
      { id: 3, name: 'Sportwagen' },
      { id: 4, name: 'SUV' },
      { id: 5, name: 'Tuning' },
      { id: 6, name: 'Sonstiges' },
    ]
  }
})

watch(() => formModal.value.open, (open) => {
  if (open) {
    const ev = formModal.value.event
    formData.value = ev
      ? {
          title: ev.title ?? '',
          category: ev.category ?? '',
          address: ev.address ?? '',
          date: ev.date ? ev.date.slice(0, 16) : '',
          maxParticipants: ev.maxParticipants ?? 20,
          description: ev.description ?? '',
        }
      : { title: '', category: categories.value[0] ?? '', address: '', date: '', maxParticipants: 20, description: '' }
    formError.value = null
  }
})

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr`
}

function eventColor(eventId) {
  const colors = ['theme-cyan', 'theme-pink', 'theme-purple']
  return colors[(eventId - 1) % 3]
}

async function submitForm() {
  formSaving.value = true
  formError.value = null
  try {
    const payload = {
      ...formData.value,
      date: formData.value.date ? new Date(formData.value.date).toISOString() : null,
      maxParticipants: Number(formData.value.maxParticipants),
    }
    await eventStore.updateEvent(formModal.value.event.id, payload)
    formModal.value.open = false
  } catch (e) {
    formError.value = e.message
  } finally {
    formSaving.value = false
  }
}

async function doDelete() {
  deleting.value = true
  try {
    const id = deleteConfirm.value.event.id
    await eventStore.deleteEvent(id)
    if (expandedId.value === id) expandedId.value = null
    deleteConfirm.value.open = false
  } catch (e) { console.error(e) } finally { deleting.value = false }
}

async function openParticipants(event) {
  participantsModal.value = { open: true, event, list: [], loading: true }
  try {
    participantsModal.value.list = (await eventStore.fetchParticipants(event.id)) ?? []
  } catch { participantsModal.value.list = [] } finally { participantsModal.value.loading = false }
}

async function openChat(event) {
  chatModal.value = { open: true, event }
  await eventStore.fetchMessages(event.id)
  await nextTick()
  if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight
}

function chatMsgs(id) { return eventStore.messages[id] ?? [] }

function participantName(p) {
  if (p.firstName || p.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ')
  return p.email || `#${p.id}`
}

function formatMsgTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="admin-layout">
    <AdminNavbar />
    <main class="admin-main">

      <div class="page-header">
        <div class="page-label">Admin</div>
        <h1 class="page-title">Events</h1>
        <p class="page-sub">Alle Veranstaltungen verwalten und bearbeiten.</p>
      </div>

      <div v-if="eventStore.loading" class="state-msg">Wird geladen…</div>
      <div v-else-if="eventStore.error" class="alert-error">{{ eventStore.error }}</div>

      <template v-else>
        <div class="events-count">{{ eventStore.events.length }} Events gefunden</div>

        <div v-if="eventStore.events.length === 0" class="empty-state">
          <div class="empty-icon">◎</div>
          <div class="empty-text">Keine Events vorhanden.</div>
        </div>

        <div v-else class="events-list">
          <div
            v-for="event in eventStore.events"
            :key="event.id"
            class="event-card"
          :class="eventColor(event.id)"
          >
            <!-- Header -->
            <div class="card-header" @click="toggleExpand(event.id)">
              <div class="card-info">
                <div class="card-title">{{ event.title }}</div>
                <div class="card-meta">
                  <span>{{ event.address }}</span>
                  <span class="dot">·</span>
                  <span>{{ formatDate(event.date) }}</span>
                  <span class="dot">·</span>
                  <span>{{ event.currentParticipants }}/{{ event.maxParticipants }} Plätze</span>
                </div>
              </div>
              <div class="card-right">
                <span class="cat-badge">{{ event.category }}</span>
                <span class="chevron" :class="{ open: expandedId === event.id }">›</span>
              </div>
            </div>

            <!-- Admin action buttons (always visible) -->
            <div class="card-actions">
              <button class="btn-sm btn-gradient" @click.stop="formModal = { open: true, event }">Bearbeiten</button>
              <button class="btn-sm btn-outline" @click.stop="openParticipants(event)">Teilnehmer</button>
              <button class="btn-sm btn-outline-cyan" @click.stop="openChat(event)">Event-Chat</button>
              <button class="btn-sm btn-outline-red" @click.stop="deleteConfirm = { open: true, event }">Löschen</button>
            </div>

            <!-- Expanded details -->
            <transition name="expand">
              <div v-if="expandedId === event.id" class="card-expanded">
                <dl class="detail-list">
                  <div class="detail-row">
                    <dt>Treffpunkt</dt>
                    <dd>{{ event.address }}</dd>
                  </div>
                  <div class="detail-row">
                    <dt>Wann</dt>
                    <dd>{{ formatDate(event.date) }}</dd>
                  </div>
                  <div class="detail-row">
                    <dt>Organisator</dt>
                    <dd>{{ event.organizerName }}</dd>
                  </div>
                  <div v-if="event.description" class="detail-row">
                    <dt>Beschreibung</dt>
                    <dd>{{ event.description }}</dd>
                  </div>
                </dl>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </main>

    <!-- Edit Modal -->
    <div v-if="formModal.open" class="modal-backdrop" @click.self="formModal.open = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Event bearbeiten</div>
          <button class="modal-close" @click="formModal.open = false">✕</button>
        </div>
        <form @submit.prevent="submitForm" class="modal-form">
          <div v-if="formError" class="alert-error">{{ formError }}</div>
          <div class="field">
            <label>Eventname</label>
            <input v-model="formData.title" type="text" required />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Kategorie</label>
              <select v-model="formData.category" required>
                <option v-for="c in categories" :key="c.id ?? c.name" :value="c.name">{{ c.name }}</option>
              </select>
            </div>
            <div class="field field-sm">
              <label>Max. Teilnehmer</label>
              <input v-model="formData.maxParticipants" type="number" min="1" max="9999" required />
            </div>
          </div>
          <div class="field">
            <label>Treffpunkt</label>
            <input v-model="formData.address" type="text" required />
          </div>
          <div class="field">
            <label>Datum &amp; Uhrzeit</label>
            <input v-model="formData.date" type="datetime-local" required />
          </div>
          <div class="field">
            <label>Beschreibung</label>
            <textarea v-model="formData.description" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="formModal.open = false">Abbrechen</button>
            <button type="submit" class="btn-save" :disabled="formSaving">
              {{ formSaving ? 'Wird gespeichert…' : 'Speichern' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteConfirm.open" class="modal-backdrop" @click.self="deleteConfirm.open = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <div class="modal-title">Event löschen</div>
          <button class="modal-close" @click="deleteConfirm.open = false">✕</button>
        </div>
        <p class="modal-body-text">„{{ deleteConfirm.event?.title }}" wirklich löschen?</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deleteConfirm.open = false">Abbrechen</button>
          <button class="btn-danger" :disabled="deleting" @click="doDelete">{{ deleting ? '…' : 'Löschen' }}</button>
        </div>
      </div>
    </div>

    <!-- Participants Modal -->
    <div v-if="participantsModal.open" class="modal-backdrop" @click.self="participantsModal.open = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">
            Teilnehmer
            <span v-if="!participantsModal.loading" class="count-pill">{{ participantsModal.list.length }}</span>
          </div>
          <button class="modal-close" @click="participantsModal.open = false">✕</button>
        </div>
        <div class="modal-sub">{{ participantsModal.event?.title }}</div>
        <div v-if="participantsModal.loading" class="state-msg-sm">Wird geladen…</div>
        <div v-else-if="participantsModal.list.length === 0" class="state-msg-sm">Keine Teilnehmer.</div>
        <ul v-else class="participants-list">
          <li v-for="p in participantsModal.list" :key="p.id" class="participant-row">
            <div class="p-name-row">
              <span class="p-name">{{ participantName(p) }}</span>
              <span v-if="p.isOrganizer" class="p-manager-badge">Manager</span>
            </div>
            <div v-if="p.email" class="p-email">{{ p.email }}</div>
          </li>
        </ul>
        <div class="modal-actions">
          <button class="btn-save" @click="participantsModal.open = false">Schließen</button>
        </div>
      </div>
    </div>

    <!-- Chat Modal (read-only for admin) -->
    <div v-if="chatModal.open" class="modal-backdrop" @click.self="chatModal.open = false">
      <div class="modal modal-chat">
        <div class="modal-header chat-header">
          <div class="modal-title">Event-Chat · {{ chatModal.event?.title }}</div>
          <button class="modal-close" @click="chatModal.open = false">✕</button>
        </div>
        <div class="chat-messages" ref="chatScroll">
          <div v-if="chatMsgs(chatModal.event?.id).length === 0" class="chat-empty">
            Noch keine Nachrichten.
          </div>
          <div
            v-for="msg in chatMsgs(chatModal.event?.id)"
            :key="msg.id"
            class="chat-msg"
            :class="{ 'msg-organizer': msg.isOrganizer }"
          >
            <div class="msg-sender">
              {{ msg.senderName }}
              <span v-if="msg.isOrganizer" class="org-badge">Organisator</span>
            </div>
            <div class="msg-bubble">{{ msg.content }}</div>
            <div class="msg-time">{{ formatMsgTime(msg.timestamp) }}</div>
          </div>
        </div>
        <div class="chat-read-note">Admin-Ansicht · Schreibgeschützt</div>
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
  max-width: 1100px;
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
  margin: 0 0 8px;
}

.page-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin: 0;
}

.events-count {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 16px;
}

.state-msg {
  text-align: center;
  padding: 60px 0;
  color: rgba(255,255,255,0.35);
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 12px;
  padding: 12px 16px;
  color: #ff7070;
  font-size: 13px;
  margin-bottom: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  border: 1px dashed rgba(250,11,219,0.12);
  border-radius: 20px;
}
.empty-icon { font-size: 32px; color: rgba(250,11,219,0.25); }
.empty-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
}

.events-list { display: flex; flex-direction: column; gap: 12px; }

.event-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 3px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  overflow: hidden;
}
.event-card:hover { border-color: rgba(255,255,255,0.12); }
.event-card.theme-cyan   { border-left-color: rgba(0,221,255,0.55); }
.event-card.theme-pink   { border-left-color: rgba(250,11,219,0.55); }
.event-card.theme-purple { border-left-color: rgba(153,85,255,0.55); }

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  cursor: pointer;
}
.card-header:hover { background: rgba(255,255,255,0.02); }

.card-info { flex: 1; min-width: 0; }

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255,255,255,0.45);
}
.dot { color: rgba(255,255,255,0.2); }

.card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.cat-badge {
  font-family: 'Orbitron', sans-serif;
  font-size: 7.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 700;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6);
  white-space: nowrap;
}
.theme-cyan .cat-badge   { background: rgba(0,221,255,0.08); border-color: rgba(0,221,255,0.3); color: #00DDFF; }
.theme-pink .cat-badge   { background: rgba(250,11,219,0.08); border-color: rgba(250,11,219,0.3); color: #FA0BDB; }
.theme-purple .cat-badge { background: rgba(153,85,255,0.08); border-color: rgba(153,85,255,0.3); color: #9955FF; }

.chevron {
  font-size: 20px;
  color: rgba(255,255,255,0.3);
  transition: transform 0.25s;
  line-height: 1;
  flex-shrink: 0;
}
.chevron.open { transform: rotate(90deg); }
.theme-cyan .chevron.open   { color: rgba(0,221,255,0.8); }
.theme-pink .chevron.open   { color: rgba(250,11,219,0.8); }
.theme-purple .chevron.open { color: rgba(153,85,255,0.8); }

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 14px;
  border-top: 1px solid rgba(255,255,255,0.04);
  padding-top: 10px;
}

.expand-enter-active, .expand-leave-active { transition: opacity 0.2s; }
.expand-enter-from, .expand-leave-to { opacity: 0; }

.card-expanded {
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row { display: grid; grid-template-columns: 90px 1fr; gap: 8px; }
.detail-row dt {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  padding-top: 1px;
}
.detail-row dd { font-size: 13px; color: rgba(255,255,255,0.75); margin: 0; line-height: 1.5; }

/* Buttons */
.btn-sm {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-gradient { border: none; background: linear-gradient(135deg, #FA0BDB, #9955FF); color: white; }
.btn-gradient:hover { box-shadow: 0 0 14px rgba(250,11,219,0.3); }
.btn-outline { border: 1px solid rgba(255,255,255,0.2); background: none; color: rgba(255,255,255,0.65); }
.btn-outline:hover { border-color: rgba(255,255,255,0.4); color: white; }
.btn-outline-cyan { border: 1px solid rgba(0,221,255,0.3); background: none; color: #00DDFF; }
.btn-outline-cyan:hover { background: rgba(0,221,255,0.06); }
.btn-outline-red { border: 1px solid rgba(255,60,60,0.3); background: none; color: #ff5555; }
.btn-outline-red:hover { background: rgba(255,60,60,0.06); }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: #1e1e2e;
  border: 1px solid rgba(0,221,255,0.18);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-sm { max-width: 360px; }
.modal-chat {
  max-width: 540px;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.chat-header {
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0;
}
.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: -16px 0 16px; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 14px; cursor: pointer; }
.modal-close:hover { color: white; }
.modal-body-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 24px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 130px; gap: 12px; }
.field label { font-family: 'Orbitron', sans-serif; font-size: 8px; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.4); }
.field input,
.field select,
.field textarea {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: white;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(0,221,255,0.5); }
.field select option { background: #272736; }
.field input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }

.btn-cancel {
  font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
  padding: 10px 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15);
  background: none; color: rgba(255,255,255,0.5); cursor: pointer;
}
.btn-cancel:hover { color: white; border-color: rgba(255,255,255,0.3); }
.btn-save {
  font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  padding: 10px 24px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #FA0BDB, #9955FF); color: white; cursor: pointer;
  transition: box-shadow 0.2s, opacity 0.2s;
}
.btn-save:hover { box-shadow: 0 0 20px rgba(153,85,255,0.4); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  padding: 10px 24px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #ff3333, #cc0000); color: white; cursor: pointer;
}
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px;
  padding: 10px 14px;
  color: #ff7070;
  font-size: 13px;
}

.count-pill {
  font-size: 10px; font-family: sans-serif; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
  background: rgba(0,221,255,0.12); color: #00DDFF;
}

.state-msg-sm { padding: 24px 0 8px; text-align: center; color: rgba(255,255,255,0.35); font-size: 13px; }
.participants-list { list-style: none; margin: 4px 0 20px; padding: 0; }
.participant-row { display: flex; flex-direction: column; gap: 2px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.participant-row:last-child { border-bottom: none; }
.p-name-row { display: flex; align-items: center; gap: 8px; }
.p-name { font-size: 14px; color: white; font-weight: 500; }
.p-manager-badge {
  font-family: 'Orbitron', sans-serif;
  font-size: 7px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 20px;
  background: rgba(250,11,219,0.1);
  border: 1px solid rgba(250,11,219,0.3);
  color: #FA0BDB;
  font-weight: 700;
}
.p-email { font-size: 12px; color: rgba(255,255,255,0.4); }

/* Chat */
.chat-messages {
  flex: 1; overflow-y: auto;
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 14px;
  min-height: 240px; max-height: 380px;
}
.chat-empty {
  text-align: center; margin: auto;
  font-family: 'Orbitron', sans-serif; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: rgba(255,255,255,0.2);
}
.chat-msg { display: flex; flex-direction: column; gap: 4px; max-width: 80%; }
.msg-organizer { }
.msg-sender {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Orbitron', sans-serif; font-size: 7.5px;
  letter-spacing: 1px; text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.org-badge {
  font-size: 6.5px; padding: 1px 6px; border-radius: 10px;
  background: rgba(0,221,255,0.1); border: 1px solid rgba(0,221,255,0.25); color: #00DDFF;
}
.msg-bubble {
  padding: 9px 13px; font-size: 13px; color: rgba(255,255,255,0.88); line-height: 1.5;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px 14px 14px 14px;
}
.msg-organizer .msg-bubble {
  background: rgba(0,221,255,0.06); border-color: rgba(0,221,255,0.15);
}
.msg-time { font-size: 10px; color: rgba(255,255,255,0.2); padding: 0 2px; }
.chat-read-note {
  padding: 10px 24px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-family: 'Orbitron', sans-serif;
  font-size: 7.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  text-align: center;
}

@media (max-width: 640px) {
  .detail-row { grid-template-columns: 78px 1fr; }
  .field-row { grid-template-columns: 1fr; }
  .card-meta { flex-direction: column; gap: 2px; }
  .dot { display: none; }
}
</style>
