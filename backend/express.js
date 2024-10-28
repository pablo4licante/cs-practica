const express = require('express');
const cors = require('cors'); 
const { guardarClavesRSA } = require('./backend.modules.js');
const { guardarUsuario } = require('./backend.modules.js');
const { getUser } = require('./backend.modules.js');
const { obtenerClavePublica, obtenerArchivosUsuario, 
        subirArchivo, generarToken, validarToken } = require('./backend.modules.js');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/token', (req, res) => {  
    let newToken = generarToken({
        userID: 1,
        user: 'pablo', 
        email: 'pablo@example.com',
    });
    res.status(200).json({ token: newToken });
});   

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
        res.status(500).json({msg: 'Error? '+error});
    }
});
 
const multer = require("multer");
const upload = multer({dest:'./tmp/'});
app.post("/subir-archivo", validarToken, upload.single('upload'), async (req, res) => { 
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    let metadata = {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        date: new Date(),
    };

    console.log("received file with " + JSON.stringify(metadata));
 
    await subirArchivo(`./${req.file.path}`, metadata, req.userID, req.email, req.body.claveAES).then((resp) => {
        console.log('status: ' + resp.status);
        res.status(resp.status).json(
            resp
        );
    }).catch((err) => {
        console.log('er status: ' + JSON.stringify(err));
        res.status(500).json(
            err
        );
    }); 
});
 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

