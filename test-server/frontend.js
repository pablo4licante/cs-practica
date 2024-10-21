document.addEventListener('DOMContentLoaded', async () => {
    const fileExplorerDiv = document.getElementById('file-explorer');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBhYmxvQGV4YW1wbGUuY29tIn0.SbtLZRgkXf1BcWF0NXkRiFOtrddSrggvTunGs20HKJc'; // Replace with the actual token

    try {
        await fetch(`http://localhost:3000/obtener-archivos?token=${token}`).then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(archivos => {
            fileExplorerDiv.innerHTML = ''; // Clear any existing content
            archivos.files.forEach(archivo => {
            const metadata = JSON.parse(archivo.METADATA);
            const card = document.createElement('div');
            card.className = 'file-card';
            const fileSize = metadata.size;
            let displaySize;
            if (fileSize < 1024 * 1024) {
                displaySize = (fileSize / 1024).toFixed(2) + 'KB';
            } else if (fileSize < 1024 * 1024 * 1024) {
                displaySize = (fileSize / (1024 * 1024)).toFixed(2) + 'MB';
            } else {
                displaySize = (fileSize / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
            }

            card.innerHTML = `
                <h3>${metadata.filename}</h3>
                <p>${new Date(metadata.date).toLocaleString()}</p>
                <p>URL: ${archivo.URL}</p>
                <p>Size: ${displaySize}</p>
            `;
            fileExplorerDiv.appendChild(card);
            });
        });
    } catch (error) {
        console.error('Failed to fetch archivos:', error);
        fileExplorerDiv.textContent = 'Failed to load files.';
    }
});