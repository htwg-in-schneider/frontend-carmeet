import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'

import App from './App.vue'
import router from './router'

const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    // BASE_URL is '/' in dev and '/frontend-carmeet/' in production (GitHub Pages).
    // Without the base path, Auth0 redirects to the bare origin which has no Vue app.
    redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    scope: 'openid profile email',
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(auth0)

app.mount('#app')
