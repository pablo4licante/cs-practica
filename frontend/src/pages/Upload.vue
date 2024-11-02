<script setup> 
    import { subirArchivo } from '../frontend.modules.js'; 
</script>

<template>
    <div class="info-container">
        <div class="upload-page">
            <h1>Pagina de Subida</h1>
            <br>
            <form method="post" enctype="multipart/form-data">
                <input type="file" name="upload"/> 
                <br>
                <button type="button" @click="onSubmit">Subir archivo</button>
            </form>
        </div>

        <button type="button" @click="redirectFiles">Ver mis archivos</button>
    </div>
</template>

<script>
export default {
    name: 'UploadPage',
    
    methods: {
        onSubmit() {
            var form = document.forms[0];
            var data = new FormData(form);
 
            for (const key of data.keys()) {
                console.log(data.get(key));
            }
 
            var reader = new FileReader(); 
            reader.onload = function(e)
            { 
                console.log("archivo leido!"); 
 
                subirArchivo(data, reader.result);
            };
 
            if (data.has("upload") && data.get("upload")) { 
                console.log("leyendo archivo.."); 
                reader.readAsArrayBuffer(data.get("upload")); 
            } else {
                console.log('No file selected');
            }
        },
        redirectFiles(){
            window.location.replace("/files");
        }
    }
};
</script>

<style scoped>
.upload-page {
    text-align: center;
    margin-top: 50px;
}

h1 {
    margin: 0;
    margin-top: -1rem;
    margin-bottom: 1rem;
}

button { 
    width: 40%;
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