const express = require('express');
const cors = require('cors');
const { obtenerArchivosUsuario } = require('./backend.modules.js');

const app = express();
const port = 3000;

app.use(cors());

app.get('/obtener-archivos', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const archivos = await obtenerArchivosUsuario(token);
        res.json(archivos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch archivos' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});