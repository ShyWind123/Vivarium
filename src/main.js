import './assets/main.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'

import App from './App.vue'
import router from './router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VNumberInput } from 'vuetify/labs/VNumberInput'

const vuetify = createVuetify({
  components,
  directives,
})


const app = createApp(App)

app.use(createPinia()).use(router).use(vuetify).mount('#app')
