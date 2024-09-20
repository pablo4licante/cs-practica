const express = require("express");
const cors = require('cors')
const app = express();
app.use(cors())
const fs = require("fs");
const ftp = require("ftp");
const moment = require('moment');

function SubirArchivo(filePath, folder) {
    let rutaArchivos = `./htdocs/uploads`;
    var c = new ftp();
    c.on("ready", function () { 
        c.list(rutaArchivos, function (err, list) { 
            if (err) throw err; 
            // Comprobar si la carpeta para usuario existe
            let carpetaExiste = false;
            for (let i = 0; i < list.length; i++) {
                if(list[i].name == folder) { 
                    carpetaExiste = true;
                    break;
                }
            }
            // Crear nueva carpeta si es necesario
            if(!carpetaExiste) { 
                c.mkdir(`${rutaArchivos}/${folder}`, true, function (err) {
                    if (err) throw err;
                    console.log(`Carpeta creada para usuario: ${folder}`);
                });
            }

            // Nombre del archivo
            let fileName = `file${moment().valueOf()}`;

            // Almacenar archivo en la carpeta del usuario
            const destino = `${rutaArchivos}/${folder}/${fileName}`;
            console.log(`Subiendo archivo: ${fileName} en ${destino}`); 
            c.put(filePath, destino, function (err) { 
                if (err) throw err;
                console.log(`Archivo subido: ${fileName} (${destino})`); 
                
                // Eliminar archivo temporal    
                fs.unlink(filePath, (err) => { 
                    if (err) throw err;
                    console.log(`Archivo temporal eliminado: ${filePath}`);
                });
            });
            c.end();
        }); 
    }); 
    c.connect({host:"ftpupload.net", port:21, user:"if0_37322158", password:"rlVSmEn4uB3B52q"});
}

var jwt_secret = 'b8JLCDtV5ce0yv5';
var jwt = require('jsonwebtoken');

const GenerarToken = (payload) => { 
    const opciones = {
        expiresIn: '1h',  
    }; 
    return jwt.sign(payload, jwt_secret, opciones);
};  

const ValidarToken = (req, res, next) => { 
    jwt.verify(req.headers.authorization, jwt_secret, (err, payload) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido',
            });
        } else {
            req.user = payload.user;
            req.email = payload.email;
            next();
        }
    });
}

app.get("/test", (req, res) => {
    res.status(200).json({
        message: `ok!`,
    });
});

const multer = require("multer");
const upload = multer({dest:'./tmp/'});
app.post("/upload", upload.single('upload'), (req, res) => { 
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    } else if (!req.headers["Authorization"]) {
        //return res.status(400).json({ error: "No token" });
    }

    let token = req.headers["Authorization"];
    let username = "usuario";

    let userFolder = username;
    fs.mkdir(userFolder, { recursive: true }, (err) => {
        if (err) throw err;
    });
    
    SubirArchivo(`./${req.file.path}`, userFolder, req.file.originalname);

    res.status(200).json({
        message: `File ${req.file.originalname} uploaded`,
    });
});

app.get("/", async (req, res) => {
    //let results = database.sql`USE DATABASE cs; INSERT INTO usuarios (nombre) VALUES ("Paco"); SELECT * FROM usuarios`
    //let results = await database.sql`USE DATABASE cs; SELECT * FROM usuarios`
    //res.send(results)
    res.status(200).json({
        message: `ok!`,
    });
});

app.listen(3000);
