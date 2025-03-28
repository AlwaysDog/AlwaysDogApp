// Import polyfills before anything else
import './polyfills'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { MMSDK, getProvider } from './config/metamask'

// Import Naive UI
import {
  create,
  NButton,
  NIcon,
  NModal,
  NConfigProvider,
  NMessageProvider
} from 'naive-ui'

// Create Naive UI instance
const naive = create({
  components: [
    NButton,
    NIcon,
    NModal,
    NConfigProvider,
    NMessageProvider
  ]
})

// Initialize MetaMask SDK and log details
console.log('Initializing MetaMask SDK...');
console.log('MetaMask SDK Version:', MMSDK.sdkVersion);

// Create app
const app = createApp(App)
app.use(router)
app.use(naive) // Use Naive UI

// Make MetaMask SDK available globally
app.config.globalProperties.$metamask = MMSDK

// Mount app
app.mount('#app')

// Remove old connection attempts, now handled by connectSDK in App.vue
// This avoids duplicate connections and conflicts