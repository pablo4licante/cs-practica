<script setup> 
    import { inicio } from '../frontend.modules.js'; 
</script>
 
<template>
    <body> 
        <div class="form-container">
            <h2>Iniciar sesión</h2> 
            <form @submit.prevent="submit">
                <label id="respuesta" class="error"></label>
                <label for="email">Correo electrónico:</label>
                <input type="email" v-model="email" required>

                <label for="password">Contraseña:</label>
                <input type="password" v-model="password" required>

                <label for="token">Código 2FA:</label>
                <input type="text" v-model="tfatoken" required>
  
                <p>¿No tienes cuenta? <a href="/register">Regístrate.</a></p>

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
            tfatoken: ''
        }
    },
    methods: {
        async submit() { 
            if(!this.email || !this.password)
                return;
                
            await inicio(this.email, this.password, this.tfatoken).then((resp) => {
                window.location.replace("/upload");
            }).catch((err) => {
                document.getElementById('respuesta').textContent = err;
            }); 
        }
    }
}
</script>

<style>
.upload-page {
    text-align: center;
    margin-top: 50px;
}

p {
    text-align: center;
    margin: 1rem;
}

</style>