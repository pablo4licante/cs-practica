const express = require('express');
const cors = require('cors');
const { generarTokenJWT } = require("./backend.modules.js");

const app = express();
const port = 3000;

app.use(cors());


//probar funcion de generar token

app.get("/generar-token", async (req, res) => {
    const usuario = req.query.usuario;

    if(!usuario){
        return res.status(400).json({error: "Se requiere un usuario"});
    }

    try {
        const token = await generarTokenJWT(usuario);
        res.json(token);
    } catch (error){
        res.status(500).json({error: "No se ha podido generar el token JWT"});
    }
});


app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto http://localhost:${port}`);
});