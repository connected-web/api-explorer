import { createApp } from 'vue'
import './style.css'

import App from './App.vue'
import setupIcons from './helpers/icons.js'
import router from './routes.js'
import Auth from './login/Auth.ts'

const app = createApp(App)

try {
  const authClient = Auth.getOAuthClient()
  app.use(authClient, { global: true })
} catch (err) {
  console.error('Unable to initialise OAuth client:', err.message, err)
}

setupIcons(app)
app.use(router)
app.mount('#app')
