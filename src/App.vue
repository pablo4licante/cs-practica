<script setup> 
    import { registro } from './frontend.modules.js'; 
</script>
 
<template>
    <body> 
        <div class="form-container">
            <h2>Register</h2> 
            <form @submit.prevent="submit">
                <label for="email">Email:</label>
                <input type="email" v-model="email" required>

                <label for="password">Password:</label>
                <input type="password" v-model="password" required>

                <label for="confirm_password">Confirm Password:</label>
                <input type="password" v-model="password2" required>
 
                <button type="submit">Prueba</button>
            </form>
        </div>
    </body> 
</template> 

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      password2: '', 
    }
  },
  methods: {
    submit() { 
        if(!this.email || !this.password || !this.password2)
            return;

        // Comprobar si contraseñas coinciden
        if(this.password == this.password2)
        {
            alert('Ejecutando función de registro!');
            registro(this.email, this.password);
        }else{
            alert('Las contraseñas no son coincidentes');
        }
    }
  }
}
</script>