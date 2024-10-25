const express = require('express');
const cors = require('cors');
const { obtenerArchivosUsuario } = require('./backend.modules.js');
const { guardarClavesRSA } = require('./backend.modules.js');
const { guardarUsuario } = require('./backend.modules.js');
const { getUser } = require('./backend.modules.js');
const { subirArchivo } = require('./backend.modules.js');
const multer = require('multer');

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
        const usuarioResult = await guardarUsuario(email, password, salt);
        const claveResult = await guardarClavesRSA(email, public_key, private_key);
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

app.get('/obtener-clave-publica', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const result = await obtenerClavePublica(token);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch public key' });
    }
});

const upload = multer({ dest: './tmp/' });

app.post('/subir-archivo', upload.single('upload'), express.json(), async (req, res) => {
    const { file_path, metadata, token, AES_key } = req.body;

    if (!req.file || !metadata || !token || !AES_key) {
        return res.status(400).json({ error: 'file, metadata, token, and AES_key are required' });
    }

    try {
        const file_path = req.file.path;
        const result = await subirArchivo(file_path, metadata, token, AES_key);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

