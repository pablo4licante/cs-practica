import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'


import LoginPage from './pages/Login.vue'
import UploadPage from './pages/Upload.vue'
import cors from 'cors'

const routes = [
    { path: '/', component: LoginPage },
    { path: '/upload', component: UploadPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
