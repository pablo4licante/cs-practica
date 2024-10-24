<script setup> 
    import { subirArchivo } from '../frontend.modules.js'; 
</script>

<template>
    <div class="upload-page">
        <h1>Pagina de Subida</h1>
        <br>
        <form method="post" enctype="multipart/form-data">
            <input type="file" name="upload" /> 
            <button type="button" @click="onSubmit">Subir archivo</button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'UploadPage',
    
    methods: {
        onSubmit() {
                var form = document.forms[0];
                var data = new FormData(form);
                console.log(data);
                for (var pair of data.entries()) {
                    console.log(pair[0] + ': ' + pair[1].name);
                    console.log(pair[0] + ': ' + pair[1].size);
                    console.log(pair[0] + ': ' + pair[1].lastModified);
                }
            //subirArchivo(data);
        }
    }
};
</script>

<style scoped>
.upload-page {
    text-align: center;
    margin-top: 50px;
}
</style>