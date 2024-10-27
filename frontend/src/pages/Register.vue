<script setup> 
    import { registro } from '../frontend.modules.js'; 
</script>
 
<template>
    <body> 
        <div class="form-container">
            <h2>Registro</h2> 
            <form @submit.prevent="submit">
                <label id="respuesta" class="error"></label>
                <label for="email">Email:</label>
                <input type="email" v-model="email" required>

                <label for="password">Password:</label>
                <input type="password" v-model="password" required>

                <label for="confirm_password">Confirm Password:</label>
                <input type="password" v-model="password2" required>
                
                <a href="/login">¿Ya tienes cuenta? Inicia sesión.</a>
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
        }
    },
    methods: {
        async submit() { 
            if(!this.email || !this.password || !this.password2)
                return;

            // Comprobar si contraseñas coinciden
            if(this.password == this.password2)
            { 
                await registro(this.email, this.password).then((resp) => {
                    window.location.replace("/login");
                }).catch((err) => {
                    document.getElementById('respuesta').textContent = err;
                }); 
            }else{
                alert('Las contraseñas no coinciden');
            }
        }
    }
}
</script>