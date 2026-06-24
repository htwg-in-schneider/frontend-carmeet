<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '../stores/userStore.js'
import { becomeEventManager } from '../services/profileService.js'
import UserNavbar from '../components/UserNavbar.vue'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()
const userStore = useUserStore()

const form = ref({
  cardHolder: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
})

const submitting = ref(false)
const submitError = ref(null)

// Strip non-digits from card number and validate 13-19 digits
const cardNumberStripped = computed(() => form.value.cardNumber.replace(/\D/g, ''))
const cardNumberValid = computed(() => /^\d{13,19}$/.test(cardNumberStripped.value))
const expiryValid = computed(() => /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.value.expiry))
const cvcValid = computed(() => /^\d{3,4}$/.test(form.value.cvc))
const cardHolderValid = computed(() => form.value.cardHolder.trim().length >= 2)

const canSubmit = computed(() =>
  cardHolderValid.value && cardNumberValid.value && expiryValid.value && cvcValid.value
)

// Auto-format card number: XXXX XXXX XXXX XXXX
function onCardNumberInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 19)
  form.value.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// Auto-format expiry: MM/YY
function onExpiryInput(e) {
  let val = e.target.value.replace(/\D/g, '').slice(0, 4)
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
  form.value.expiry = val
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = null
  try {
    const token = await getAccessTokenSilently()
    const updated = await becomeEventManager(token)
    userStore.profile.role = updated.role
    userStore.profile.eventManager = true
    router.replace('/user/profile')
  } catch (e) {
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="em-layout">
    <UserNavbar />

    <main class="em-main">
      <div class="page-header">
        <div class="page-label">Mein Bereich</div>
        <h1 class="page-title">Eventmanager werden</h1>
        <p class="page-sub">Einmalige Zahlung — dauerhafter Zugang zu allen Eventmanager-Funktionen.</p>
      </div>

      <div class="payment-card">
        <div class="price-banner">
          <span class="price-amount">19,99 €</span>
          <span class="price-label">einmalige Kosten</span>
        </div>

        <div v-if="submitError" class="alert-error">{{ submitError }}</div>

        <form class="payment-form" @submit.prevent="submit">

          <div class="field">
            <label>Karteninhaber</label>
            <input
              v-model="form.cardHolder"
              type="text"
              placeholder="Max Mustermann"
              autocomplete="cc-name"
            />
          </div>

          <div class="field">
            <label>Kartennummer</label>
            <input
              :value="form.cardNumber"
              @input="onCardNumberInput"
              type="text"
              inputmode="numeric"
              placeholder="0000 0000 0000 0000"
              maxlength="23"
              autocomplete="cc-number"
              :class="{ 'input-error': form.cardNumber && !cardNumberValid }"
            />
            <span v-if="form.cardNumber && !cardNumberValid" class="field-hint error">
              Ungültige Kartennummer
            </span>
          </div>

          <div class="field-row">
            <div class="field">
              <label>Ablaufdatum</label>
              <input
                :value="form.expiry"
                @input="onExpiryInput"
                type="text"
                inputmode="numeric"
                placeholder="MM/JJ"
                maxlength="5"
                autocomplete="cc-exp"
                :class="{ 'input-error': form.expiry && !expiryValid }"
              />
              <span v-if="form.expiry && !expiryValid" class="field-hint error">Format: MM/JJ</span>
            </div>

            <div class="field">
              <label>CVC</label>
              <input
                v-model="form.cvc"
                type="text"
                inputmode="numeric"
                placeholder="123"
                maxlength="4"
                autocomplete="cc-csc"
                :class="{ 'input-error': form.cvc && !cvcValid }"
              />
              <span v-if="form.cvc && !cvcValid" class="field-hint error">3–4 Ziffern</span>
            </div>
          </div>

          <button type="submit" class="btn-subscribe" :disabled="!canSubmit || submitting">
            {{ submitting ? 'Wird verarbeitet…' : 'Abo abschließen' }}
          </button>

        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
.em-layout {
  min-height: 100vh;
}

.em-main {
  max-width: 560px;
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
  color: #9955FF;
  margin: 0 0 8px;
}
.page-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }

.payment-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(153,85,255,0.2);
  border-radius: 20px;
  padding: 36px;
}

.price-banner {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.price-amount {
  font-family: 'Orbitron', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #9955FF;
}
.price-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}

.payment-form { display: flex; flex-direction: column; gap: 20px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.field input {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 14px;
  color: white;
  font-size: 15px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: border-color 0.2s;
  letter-spacing: 0.5px;
}
.field input:focus { border-color: rgba(153,85,255,0.6); }
.field input.input-error { border-color: rgba(255,60,60,0.5); }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.field-hint { font-size: 11px; }
.field-hint.error { color: #ff7070; }

.btn-subscribe {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 14px 28px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #9955FF, #FA0BDB);
  color: white;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(153,85,255,0.35);
  transition: box-shadow 0.3s, opacity 0.2s;
  margin-top: 4px;
}
.btn-subscribe:hover { box-shadow: 0 0 40px rgba(153,85,255,0.55); }
.btn-subscribe:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

.alert-error {
  background: rgba(255,60,60,0.08);
  border: 1px solid rgba(255,60,60,0.25);
  border-radius: 10px;
  padding: 10px 14px;
  color: #ff7070;
  font-size: 13px;
  margin-bottom: 4px;
}
</style>
