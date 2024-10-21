const express = require('express');
const cors = require('cors');
const { obtenerArchivosUsuario } = require('../backend.modules.js');
const { guardarClavesRSA } = require('../backend.modules.js');
const { guardarUsuario } = require('../backend.modules.js');
const { getUser } = require('../backend.modules.js');

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


app.post('/guardar-datos', express.json(), async (req, res) => {
    const { email, public_key, private_key, password, salt } = req.body;

    if (!email || !public_key || !private_key || !password || !salt) {
        return res.status(400).json({ error: 'Email, public_key, private_key, password, and salt are required' });
    }

    try {
        const claveResult = await guardarClavesRSA(email, public_key, private_key);
        const usuarioResult = await guardarUsuario(email, password, salt);
        res.json({ message: 'Data saved successfully', claveResult, usuarioResult });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/obtener-usuario', async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const user = await getUser(email);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});