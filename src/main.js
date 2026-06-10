import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'

import App from './App.vue'
import router from './router'

// redirect_uri must be a fixed URL that exactly matches the value registered
// in Auth0 → Application → Allowed Callback URLs.
// We use the bare origin so the URL never changes regardless of which page
// the user is on when they click "Anmelden".
//   dev  → http://localhost:5173
//   prod → https://htwg-in-schneider.github.io
const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: window.location.origin,
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(auth0)

app.mount('#app')
