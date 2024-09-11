const { Database } = require('@sqlitecloud/drivers');
const express = require('express'); 
const app = express();
const fs = require('fs'); 
const aesjs = require('aes-js');

//let database = new Database('sqlitecloud://cjajv32esz.sqlite.cloud:8860?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc') 
  
var key_128 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var jwt_secret = 'b8JLCDtV5ce0yv5';
var jwt = require('jsonwebtoken');

const GenerarToken = (payload) => { 
    const opciones = {
        expiresIn: '1h',  
    }; 
    return jwt.sign(payload, jwt_secret, opciones);
};  

function DescifrarArchivo(encryptedBytes, key) {  
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    return aesCtr.decrypt(encryptedBytes);
}

function CifrarArchivo(textBytes, key) {    
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)); 
    return aesCtr.encrypt(textBytes); 
}

function GuardarBytes(path, data) {
    fs.writeFile(path, data, 'binary',  (err)=> {
        if (err) {
            console.log("Ha habido un error al escribir un archivo: " + err);
        } else {
            console.log("Se ha guardado el archivo " + path);
        }
    }); 
}

const TokenValidation = (req, res, next) => { 
    jwt.verify(req.headers.authorization, jwt_secret, (err, payload) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido',
            });
        } else {
            req.user = payload.user;
            next();
        }
    }); 
}
 
const multer = require('multer'); 
const upload = multer();
app.post('/encrypt', upload.single('upload'), TokenValidation, (req, res) => {   

    // Desactivar CORS (@TODO: Quitar esto en producción)
    res.set('Access-Control-Allow-Origin', '*'); 
    
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    } else if (!req.headers.authorization) {
        return res.status(400).json({ error: 'Token no recibido' });
    }
 
    // Crear una carpeta para el usuario
    let carpetaUsuario = `./uploads/${req.user}`;
    fs.mkdir(carpetaUsuario, { recursive: true }, (err) => {
        if (err) throw err;
    }); 

    // Cifrar el archivo y guardarlo 
    let datosCifrados = CifrarArchivo(req.file.buffer, key_128);    
    GuardarBytes(`${carpetaUsuario}/enc_${req.file.originalname}`, datosCifrados);  
 
    res.status(200).json({ message: `Archivo ${req.file.originalname} subido!`, token: req.headers.authorization});
}); 

app.get('/token', (req, res) => {  
    let newToken = GenerarToken({
        user: 'florian' // @TODO: Hacer login para esto
    });
    res.status(200).json({ token: newToken });
});

const cors = require("cors");
app.use(cors());
app.listen(3000) 
console.log('Servidor iniciado en http://localhost:3000');