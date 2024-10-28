<script setup> 
    import { inicio } from '../frontend.modules.js'; 
</script>
 
<template>
    <body> 
        <div class="form-container">
            <h2>Iniciar sesión</h2> 
            <form @submit.prevent="submit">
                <label id="respuesta" class="error"></label>
                <label for="email">Email:</label>
                <input type="email" v-model="email" required>

                <label for="password">Password:</label>
                <input type="password" v-model="password" required>
  
                <a href="/register">¿No tienes cuenta? Regístrate.</a>

                <button type="submit">Enviar</button>
            </form>
        </div>
    </body> 
</template> 

<script>
export default {
    
    name: 'LoginPage',

    data() {
        return {
            email: '',
            password: '',
            password2: '', 
        }
    },
    methods: {
        async submit() { 
            if(!this.email || !this.password)
                return;
             
            await inicio(this.email, this.password).then((resp) => {
                window.location.replace("/upload");
            }).catch((err) => {
                document.getElementById('respuesta').textContent = err;
            }); 
        }
    }
}
</script>
<style>
    html {
        background-color: red;
    }
</style>