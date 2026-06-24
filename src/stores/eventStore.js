import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from './userStore.js'
import { useNotificationsStore } from './notificationsStore.js'
import * as svc from '../services/eventService.js'

// ── localStorage helpers (mock persistence across account switches) ────────────
const LS_EVENTS        = 'carmeet_mock_events'
const LS_JOINS         = 'carmeet_mock_joins'
const LS_MSGS          = 'carmeet_mock_msgs'
const LS_PARTS         = 'carmeet_mock_parts'
const lsJoinedIds    = (sub) => `carmeet_joined_ids_${sub}`
const lsJoinedTitles = (sub) => `carmeet_joined_titles_${sub}`

function lsGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ── Mock seed data ────────────────────────────────────────────────────────────
const MOCK_EVENTS = []

const MOCK_MESSAGES_SEED = {}

let nextId = 200

export const useEventStore = defineStore('events', () => {
  const { getAccessTokenSilently, user: auth0User } = useAuth0()
  const userStore = useUserStore()

  const events   = ref([])
  const joinedIds = ref(new Set())
  const messages  = ref({})
  const loading   = ref(false)
  const error     = ref(null)
  const useMock   = ref(false)

  const joinedEvents = computed(() =>
    events.value.filter(e => joinedIds.value.has(e.id) && !isOwnEvent(e))
  )

  function isOwnEvent(event) {
    const p = userStore.profile
    if (!p) return false
    return (event.organizerOauthId && event.organizerOauthId === p.oauthId) ||
           (event.organizerId != null && event.organizerId === p.id)
  }

  function isJoined(id) { return joinedIds.value.has(id) }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchEvents() {
    loading.value = true
    error.value = null
    try {
      const token = await getAccessTokenSilently().catch(() => null)

      // Load persisted joined state for cross-session deletion detection
      const sub = auth0User.value?.sub ?? 'anon'
      const storedIds = lsGet(lsJoinedIds(sub), null)
      const prevJoinedIds = storedIds !== null ? new Set(storedIds) : new Set(joinedIds.value)
      const storedTitles = lsGet(lsJoinedTitles(sub), {})

      const data = await svc.getEvents(token)
      events.value = Array.isArray(data) ? data : (data?.content ?? [])
      useMock.value = false

      if (token) {
        try {
          const joined = await svc.getMyJoins(token)
          const newJoinedIds = new Set(Array.isArray(joined) ? joined : [])

          // Detect events the user was joined to but are now gone (works across sessions)
          if (prevJoinedIds.size > 0) {
            const currentIds = new Set(events.value.map(e => e.id))
            const ns = useNotificationsStore()
            for (const id of prevJoinedIds) {
              if (!currentIds.has(id)) {
                const title = storedTitles[id] || `Event #${id}`
                ns.push(`Das Event „${title}" wurde gelöscht.`, 'warning')
              }
            }
          }

          joinedIds.value = newJoinedIds

          // Persist current joined IDs and their titles for next session (user-specific)
          lsSet(lsJoinedIds(sub), [...newJoinedIds])
          const titles = {}
          for (const id of newJoinedIds) {
            const ev = events.value.find(e => e.id === id)
            if (ev) titles[id] = ev.title
          }
          lsSet(lsJoinedTitles(sub), titles)
        } catch { /* keep existing joinedIds */ }
      }
    } catch {
      useMock.value = true

      // Restore events from LS
      const savedEvents = lsGet(LS_EVENTS, [])
      events.value = savedEvents.length ? savedEvents : MOCK_EVENTS.map(e => ({ ...e }))

      // Restore joins from LS
      joinedIds.value = new Set(lsGet(LS_JOINS, []))

      // Restore messages from LS (seed on first run)
      const savedMsgs = lsGet(LS_MSGS, null)
      if (!savedMsgs) {
        const seed = JSON.parse(JSON.stringify(MOCK_MESSAGES_SEED))
        lsSet(LS_MSGS, seed)
        messages.value = seed
      } else {
        messages.value = savedMsgs
      }

      // Sync currentParticipants from saved participants list
      const parts = lsGet(LS_PARTS, {})
      for (const ev of events.value) {
        const base = ev._baseParticipants ?? ev.currentParticipants ?? 0
        ev._baseParticipants = base
        ev.currentParticipants = base + (parts[ev.id]?.filter(p => !p.isOrganizer).length ?? 0)
      }
    } finally {
      loading.value = false
    }
  }

  // ── Create / Update / Delete ───────────────────────────────────────────────
  async function createEvent(formData) {
    const token = await getAccessTokenSilently()
    const p = userStore.profile
    const ev = {
      ...formData,
      id: nextId++,
      currentParticipants: 0,
      organizerOauthId: p?.oauthId ?? null,
      organizerId: p?.id ?? null,
      organizerName: [p?.firstName, p?.lastName].filter(Boolean).join(' ') || 'Du',
    }
    if (useMock.value) {
      events.value.unshift(ev)
      lsSet(LS_EVENTS, events.value)
      // Init empty chat
      const msgs = lsGet(LS_MSGS, {})
      msgs[ev.id] = []
      lsSet(LS_MSGS, msgs)
      messages.value[ev.id] = []
      // Organizer is automatically a participant
      const parts = lsGet(LS_PARTS, {})
      parts[ev.id] = [{
        id: p?.id ?? 0,
        firstName: p?.firstName ?? '',
        lastName: p?.lastName ?? '',
        email: p?.email ?? '',
        isOrganizer: true,
      }]
      lsSet(LS_PARTS, parts)
      return ev
    }
    const created = await svc.createEvent(token, formData)
    events.value.unshift(created)
    messages.value[created.id] = []
    return created
  }

  async function updateEvent(id, formData) {
    const token = await getAccessTokenSilently()
    if (useMock.value) {
      const idx = events.value.findIndex(e => e.id === id)
      if (idx !== -1) events.value[idx] = { ...events.value[idx], ...formData }
      lsSet(LS_EVENTS, events.value)
      return events.value[idx]
    }
    const updated = await svc.updateEvent(token, id, formData)
    const idx = events.value.findIndex(e => e.id === id)
    if (idx !== -1) events.value[idx] = updated
    return updated
  }

  async function deleteEvent(id) {
    const token = await getAccessTokenSilently()
    if (!useMock.value) await svc.deleteEvent(token, id)
    events.value = events.value.filter(e => e.id !== id)
    const next = new Set(joinedIds.value)
    next.delete(id)
    joinedIds.value = next

    // Remove from organizer's persistence so they don't get a false deletion notification
    if (!useMock.value) {
      const sub = auth0User.value?.sub ?? 'anon'
      lsSet(lsJoinedIds(sub), [...next])
      const titles = lsGet(lsJoinedTitles(sub), {})
      delete titles[id]
      lsSet(lsJoinedTitles(sub), titles)
    }

    if (useMock.value) {
      lsSet(LS_EVENTS, events.value)
      lsSet(LS_JOINS, [...joinedIds.value])
      const msgs = lsGet(LS_MSGS, {})
      delete msgs[id]
      lsSet(LS_MSGS, msgs)
      const parts = lsGet(LS_PARTS, {})
      delete parts[id]
      lsSet(LS_PARTS, parts)
    }
  }

  // ── Join / Leave ───────────────────────────────────────────────────────────
  async function joinEvent(id, vehicleId) {
    const token = await getAccessTokenSilently()
    if (!useMock.value) await svc.joinEvent(token, id, vehicleId)

    joinedIds.value = new Set([...joinedIds.value, id])
    const ev = events.value.find(e => e.id === id)
    if (ev) ev.currentParticipants++

    // Persist immediately so delete-detection works even without a page reload
    if (!useMock.value) {
      const sub = auth0User.value?.sub ?? 'anon'
      lsSet(lsJoinedIds(sub), [...joinedIds.value])
      const titles = lsGet(lsJoinedTitles(sub), {})
      if (ev) titles[id] = ev.title
      lsSet(lsJoinedTitles(sub), titles)
    }

    if (useMock.value) {
      lsSet(LS_JOINS, [...joinedIds.value])

      // Track participant
      const p = userStore.profile
      if (p) {
        const parts = lsGet(LS_PARTS, {})
        if (!parts[id]) parts[id] = []
        if (!parts[id].find(x => x.id === p.id)) {
          parts[id].push({ id: p.id, firstName: p.firstName ?? '', lastName: p.lastName ?? '', email: p.email ?? '' })
          lsSet(LS_PARTS, parts)
        }
      }
    }

    if (!messages.value[id]) {
      const msgs = lsGet(LS_MSGS, {})
      messages.value[id] = msgs[id] ?? []
    }
  }

  async function leaveEvent(id) {
    const token = await getAccessTokenSilently()
    if (!useMock.value) await svc.leaveEvent(token, id)

    joinedIds.value = new Set([...joinedIds.value].filter(i => i !== id))
    const ev = events.value.find(e => e.id === id)
    if (ev && ev.currentParticipants > 0) ev.currentParticipants--

    // Remove from persistence so user doesn't get a false deletion notification
    if (!useMock.value) {
      const sub = auth0User.value?.sub ?? 'anon'
      lsSet(lsJoinedIds(sub), [...joinedIds.value])
      const titles = lsGet(lsJoinedTitles(sub), {})
      delete titles[id]
      lsSet(lsJoinedTitles(sub), titles)
    }

    if (useMock.value) {
      lsSet(LS_JOINS, [...joinedIds.value])

      const p = userStore.profile
      if (p) {
        const parts = lsGet(LS_PARTS, {})
        if (parts[id]) {
          parts[id] = parts[id].filter(x => x.id !== p.id)
          lsSet(LS_PARTS, parts)
        }
      }
    }
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  async function fetchMessages(eventId) {
    if (useMock.value) {
      const msgs = lsGet(LS_MSGS, {})
      messages.value[eventId] = msgs[eventId] ?? []
      return messages.value[eventId]
    }
    const token = await getAccessTokenSilently()
    const data  = await svc.getMessages(token, eventId)
    messages.value[eventId] = Array.isArray(data) ? data : []
    return messages.value[eventId]
  }

  async function refreshMessages(eventId) {
    if (useMock.value) return
    const token = await getAccessTokenSilently().catch(() => null)
    if (!token) return
    const data = await svc.getMessages(token, eventId).catch(() => null)
    if (Array.isArray(data)) messages.value[eventId] = data
  }

  async function postMessage(eventId, content) {
    const p = userStore.profile
    const senderName = [p?.firstName, p?.lastName].filter(Boolean).join(' ') || 'Du'
    const msg = {
      id: nextId++,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      isOrganizer: false,
    }

    if (!messages.value[eventId]) messages.value[eventId] = []

    if (useMock.value) {
      messages.value[eventId].push(msg)
      // Persist — store without isOwn flag so other sessions see it as "other"
      const msgs = lsGet(LS_MSGS, {})
      if (!msgs[eventId]) msgs[eventId] = []
      msgs[eventId].push({ ...msg, isOwn: false })
      lsSet(LS_MSGS, msgs)
      return msg
    }

    const token  = await getAccessTokenSilently()
    const saved  = await svc.sendMessage(token, eventId, content)
    messages.value[eventId].push({ ...saved, isOwn: true })
    return saved
  }

  // ── Participants ───────────────────────────────────────────────────────────
  async function fetchParticipants(eventId) {
    if (useMock.value) {
      return lsGet(LS_PARTS, {})[eventId] ?? []
    }
    const token = await getAccessTokenSilently()
    return svc.getParticipants(token, eventId)
  }

  return {
    events, joinedIds, messages, loading, error, useMock,
    joinedEvents, isOwnEvent, isJoined,
    fetchEvents, createEvent, updateEvent, deleteEvent,
    joinEvent, leaveEvent, fetchMessages, refreshMessages, postMessage, fetchParticipants,
  }
})
