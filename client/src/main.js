import { createApp } from 'vue'
import store from '@/store.js'

import App from '@/App.vue'
import router from '@/router'
import emitter from '@/emitter.js'

// setup app
const app = createApp(App);
app.use(router);
app.use(store);
app.config.globalProperties.emitter = emitter;
app.mount('#app');