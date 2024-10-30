<script>

export default {
    name: 'FilesPage',
    data() {
        return {
            archivos: [],
            error: null,
        };
    },
    mounted() {
        this.loadFiles();
    },
    methods: {
        async loadFiles() {
            const token = sessionStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:3000/obtener-archivos?token=${token}`);
                if (!response.ok) throw new Error('Network response was not ok');
                
                const archivos = await response.json();
                this.archivos = archivos.files.map(archivo => {
                    const metadata = JSON.parse(archivo.METADATA);
                    return {
                        filename: metadata.filename,
                        date: new Date(metadata.date).toLocaleString(),
                        url: archivo.URL,
                        size: this.formatSize(metadata.size),
                    };
                });
            } catch (error) {
                console.error('Failed to fetch archivos:', error);
                this.error = 'Error al cargar los archivos.';
            }
        },
        formatSize(fileSize) {
            if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(2)} KB`;
            if (fileSize < 1024 * 1024 * 1024) return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
            return `${(fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        },
        redirectUpload(){
            window.location.replace("/upload");
        }
    },
};
</script>

<template>
    <div class="info-container">
        <h1>Mis archivos</h1>
        <div v-if="error">{{ error }}</div>
        <div v-else id="file-explorer">
            <div v-for="archivo in archivos" :key="archivo.url" class="file-card">
                <h3>{{ archivo.filename }}</h3>
                <p>{{ archivo.date }}</p>
                <p>URL: {{ archivo.url }}</p>
                <p>Size: {{ archivo.size }}</p>
            </div>
        </div>
        <button type="button" @click="redirectUpload">Subir archivo</button>
    </div>
</template>

<style scoped>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}

h1 {
    text-align: center;
    margin-top: 20px;
    margin-bottom: 40px;
}

#file-explorer {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.file-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: transform 0.2s;
    margin: 10px;
}

.file-card:hover {
    transform: translateY(-10px);
}

.file-card h3 {
    margin-top: 0;
    color: #333;
}

.file-card p {
    color: #666;
    margin: 5px 0;
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
