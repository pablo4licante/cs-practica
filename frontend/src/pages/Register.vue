<script setup> 
    import { registro } from '../frontend.modules.js'; 
</script>
 
<template>
    <body> 
        <div class="form-container">
            <h2>Registro</h2> 
            <div v-if="qrCode">
                <img :src="qrCode" alt="QR Code" />
                <p>Escanea este código con Google Authenticator.</p>
                <button @click="aceptarQR">He escaneado el QR</button>
            </div>
            <form v-else @submit.prevent="submit">
                <label id="respuesta" class="error"></label>
                <label for="email">Correo electrónico:</label>
                <input type="email" v-model="email" required>

                <label for="password">Contraseña:</label>
                <input type="password" v-model="password" required>

                <label for="confirm_password">Repetir contraseña:</label>
                <input type="password" v-model="password2" required>
                
                <p>¿Ya tienes cuenta? <br> <a href="/login">Inicia sesión.</a></p>
                <button type="submit">Enviar</button>
            </form>
        </div>
    </body> 
</template> 

<script>
export default {
    
    name: 'RegisterPage',

    data() {
        return {
            email: '',
            password: '',
            password2: '', 
            qrCode: '',
        }
    },
    methods: {
        async submit() { 
            if(!this.email || !this.password || !this.password2)
                return;

            // Comprobar si contraseñas coinciden
            if(this.password == this.password2) { 
                await registro(this.email, this.password).then((resp) => {  
                    this.qrCode = resp.qrCode;  
                }).catch((err) => {
                    document.getElementById('respuesta').textContent = err;
                }); 
            }else{
                alert('Las contraseñas no coinciden');
            }
        },
        async aceptarQR() {
            window.location.replace("/login");
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

html::before{
    background: url("../assets/fondocloudy.png");
    object-fit: cover;
    background-size: 110%;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: .6;
}

</style>