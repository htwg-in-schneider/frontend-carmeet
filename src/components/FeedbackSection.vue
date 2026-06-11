<script setup>
import { ref, computed } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')
const emailTouched = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailValid = computed(() => emailRegex.test(email.value))
const emailError = computed(() => emailTouched.value && email.value && !emailValid.value)

const canSubmit = computed(() =>
  name.value.trim() !== '' &&
  email.value.trim() !== '' &&
  emailValid.value &&
  message.value.trim() !== ''
)

function sendFeedback() {
  if (!canSubmit.value) return

  const body =
    `Name: ${name.value}\n\n` +
    `E-Mail: ${email.value}\n\n` +
    `Nachricht:\n${message.value}`

  const mailtoUrl =
    `mailto:an871kor@htwg-konstanz.de,le871gip@htwg-konstanz.de` +
    `?subject=${encodeURIComponent('CarMeet Feedback')}` +
    `&body=${encodeURIComponent(body)}`

  window.location.href = mailtoUrl
}
</script>

<template>
  <section id="feedback">
    <div class="section-inner">
      <div class="section-label">Feedback &amp; Kontakt</div>
      <h2 class="section-title">Deine Meinung zählt</h2>
      <p class="section-text intro-text">
        Hast du Ideen, Verbesserungsvorschläge oder Fehler entdeckt? Sende uns gerne dein Feedback.
      </p>

      <div class="form-wrapper">
        <form class="feedback-form" @submit.prevent="sendFeedback" novalidate>

          <div class="field-group">
            <label for="fb-name" class="field-label">Name <span class="required">*</span></label>
            <input
              id="fb-name"
              v-model="name"
              type="text"
              class="field-input"
              placeholder="Max Mustermann"
              autocomplete="name"
              required
            />
          </div>

          <div class="field-group">
            <label for="fb-email" class="field-label">E-Mail <span class="required">*</span></label>
            <input
              id="fb-email"
              v-model="email"
              type="email"
              class="field-input"
              :class="{ 'input-error': emailError }"
              placeholder="max.mustermann@example.com"
              autocomplete="email"
              required
              @blur="emailTouched = true"
            />
            <span v-if="emailError" class="error-msg">
              Bitte gib eine gültige E-Mail-Adresse ein (z.&nbsp;B. name@example.com).
            </span>
          </div>

          <div class="field-group">
            <label for="fb-message" class="field-label">
              Nachricht / Verbesserungsvorschlag <span class="required">*</span>
            </label>
            <textarea
              id="fb-message"
              v-model="message"
              class="field-input field-textarea"
              placeholder="Dein Feedback, Ideen oder gemeldete Fehler …"
              rows="5"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            class="btn-send"
            :disabled="!canSubmit"
          >
            Feedback senden
          </button>

        </form>
      </div>

      <div class="legal-links">
        <router-link to="/impressum" class="legal-link">Impressum</router-link>
        <span class="legal-sep">·</span>
        <router-link to="/datenschutz" class="legal-link">Datenschutzerklärung</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  position: relative;
  z-index: 1;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 5%;
}

.section-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #00DDFF;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12.8px;
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(28.8px, 4vw, 48px);
  font-weight: 600;
  color: #FA0BDB;
  line-height: 1.15;
  margin-bottom: 19.2px;
}

.section-text {
  color: white;
  font-size: 16.8px;
  line-height: 1.75;
}

.intro-text {
  max-width: 680px;
  margin-bottom: 48px;
}

/* ─── FORM WRAPPER ─── */
.form-wrapper {
  max-width: 640px;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── FIELD ─── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10.4px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #00DDFF;
}

.required {
  color: #FA0BDB;
}

.field-input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 18px;
  color: #ffffff;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.field-input:focus {
  border-color: #00DDFF;
  background: rgba(0, 221, 255, 0.04);
  box-shadow: 0 0 0 3px rgba(0, 221, 255, 0.12);
}

.field-input.input-error {
  border-color: #FA0BDB;
  box-shadow: 0 0 0 3px rgba(250, 11, 219, 0.12);
}

.field-textarea {
  resize: vertical;
  min-height: 130px;
}

.error-msg {
  font-size: 13px;
  color: #FA0BDB;
  line-height: 1.5;
}

/* ─── SEND BUTTON ─── */
.btn-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  font-family: 'Orbitron', sans-serif;
  font-size: 11.2px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 14.4px 40px;
  border-radius: 50px;
  background: linear-gradient(90deg, #FA0BDB, #00DDFF);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(250, 11, 219, 0.3), 0 0 60px rgba(0, 221, 255, 0.15);
  transition: box-shadow 0.3s, transform 0.2s, opacity 0.2s;
}

.btn-send:hover:not(:disabled) {
  box-shadow: 0 0 40px rgba(250, 11, 219, 0.5), 0 0 80px rgba(0, 221, 255, 0.25);
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

/* ─── LEGAL LINKS ─── */
.legal-links {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
}

.legal-link {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s;
}

.legal-link:hover {
  color: #00DDFF;
}

.legal-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 13.5px;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 600px) {
  .section-inner {
    padding: 70px 5%;
  }

  .form-wrapper {
    max-width: 100%;
  }

  .btn-send {
    align-self: stretch;
    text-align: center;
  }
}
</style>
