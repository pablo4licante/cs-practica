import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'


import RegisterPage from './pages/Register.vue'
import LoginPage from './pages/Login.vue'
import UploadPage from './pages/Upload.vue'
import cors from 'cors'

const routes = [
    { path: '/', component: RegisterPage },
    { path: '/register', component: RegisterPage },
    { path: '/login', component: LoginPage },
    { path: '/upload', component: UploadPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
