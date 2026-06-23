<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Straße, PLZ Ort' },
  required: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const suggestions = ref([])
const showDropdown = ref(false)
let debounce = null

function onInput(e) {
  const val = e.target.value
  emit('update:modelValue', val)
  clearTimeout(debounce)
  if (val.length < 3) { suggestions.value = []; showDropdown.value = false; return }
  debounce = setTimeout(() => fetchSuggestions(val), 400)
}

function formatResult(r) {
  const a = r.address || {}
  const street = [a.road, a.house_number].filter(Boolean).join(' ')
  const city = a.city || a.town || a.village || a.hamlet || a.municipality || ''
  const postal = a.postcode || ''
  const location = [postal, city].filter(Boolean).join(' ')
  return [street, location].filter(Boolean).join(', ') || r.display_name
}

async function fetchSuggestions(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8&accept-language=de&countrycodes=de,at,ch`
    const res = await fetch(url)
    const data = await res.json()
    const seen = new Set()
    suggestions.value = data
      .map(formatResult)
      .filter(s => { if (seen.has(s)) return false; seen.add(s); return true })
    showDropdown.value = suggestions.value.length > 0
  } catch {
    suggestions.value = []
  }
}

function select(s) {
  emit('update:modelValue', s)
  suggestions.value = []
  showDropdown.value = false
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false }, 200)
}
</script>

<template>
  <div class="ac-wrap">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      type="text"
      autocomplete="off"
      class="ac-input"
      @input="onInput"
      @focus="showDropdown = suggestions.length > 0"
      @blur="onBlur"
    />
    <ul v-if="showDropdown && suggestions.length" class="ac-dropdown">
      <li
        v-for="s in suggestions"
        :key="s"
        class="ac-item"
        @mousedown.prevent="select(s)"
      >{{ s }}</li>
    </ul>
  </div>
</template>

<style scoped>
.ac-wrap {
  position: relative;
  width: 100%;
}
.ac-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: white;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.ac-input:focus { border-color: rgba(0,221,255,0.5); }
.ac-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  z-index: 9999;
  background: #1e1e2e;
  border: 1px solid rgba(0,221,255,0.25);
  border-radius: 10px;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 220px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.ac-item {
  padding: 8px 14px;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1.4;
}
.ac-item:hover { background: rgba(0,221,255,0.08); color: white; }
</style>
