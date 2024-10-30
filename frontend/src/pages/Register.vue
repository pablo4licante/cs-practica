<script setup> 
    import { registro } from '../frontend.modules.js'; 
</script>
 
<template>
    <body> 
        <div class="form-container">
        <h2>Registro</h2> 
            <div v-if="qrCode" class="codigo-qr">
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

.codigo-qr {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

p {
    text-align: center;
    margin: 1rem;
}

button { 
    width: 80%;
    padding: 10px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: var(--blue-button);
    color: white;
    border: none;
    cursor: pointer;
}

button:hover { 
    background-color: var(--blue-button-hover);
}

</style>