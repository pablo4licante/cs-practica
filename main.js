const { Database } = require('@sqlitecloud/drivers');
const express = require("express");
const cors = require('cors')
const app = express();
app.use(cors())
const fs = require("fs");
const ftp = require("ftp");
const moment = require('moment');
 
let database = new Database('sqlitecloud://cjajv32esz.sqlite.cloud:8860?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc');

function EliminarArchivo(filePath) {
    fs.unlink(filePath, (err) => { 
        if (err) throw err;
        console.log(`Archivo eliminado: ${filePath}`);
    });
}

async function SubirArchivo(filePath, folder, userID, fileKey) {
    if(!fileKey) {
        console.log(`No se ha especificado una clave para el archivo ${filePath}`);

        // Eliminar archivo temporal    
        EliminarArchivo(filePath);
        return;
    } 
    console.log(`Subiendo archivo: ${filePath} en ${folder} de usuario ${userID} + clave ${fileKey}`);
    let rutaArchivos = `./htdocs/uploads`;
    var c = new ftp();
    c.on("ready", function () {
        try { 
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
                c.put(filePath, destino, async function (err) { 
                    if (err) throw err;
                    console.log(`Archivo subido: ${fileName} (${destino})`); 

                    // Almacenar archivo en db
                    let result = await database.sql`USE DATABASE cs; 
                    INSERT INTO FILES (URL, METADATA) 
                    VALUES ("${folder}/${fileName}", "metapod")`;
    
                    let fileID = result.lastID; 
                
                    // Crear relacion entre archivo y usuario en db
                    await database.sql`USE DATABASE cs; 
                    INSERT INTO ACCESS (FILE, USER, FILEKEY) 
                    VALUES (${fileID}, ${userID}, "${fileKey}")`;
                    
                    // Eliminar archivo temporal    
                    EliminarArchivo(filePath);
                });
                c.end();
            }); 
        }catch (e) {
            // Eliminar archivo temporal    
            EliminarArchivo(filePath);
        }
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
            req.userID = payload.userID;
            req.user = payload.user;
            req.email = payload.email;
            next();
        }
    });
} 

const multer = require("multer");
const upload = multer({dest:'./tmp/'});
app.post("/upload", ValidarToken, upload.single('upload'), async (req, res) => { 
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
 
    let username = "usuario";  
    
    SubirArchivo(`./${req.file.path}`, username, req.userID, req.fileKey);

    res.status(200).json({
        message: `File ${req.file.originalname} uploaded`,
    });
});

app.get("/insert_test", async (req, res) => { 
    let results = await database.sql`USE DATABASE cs; 
    INSERT INTO USERS (EMAIL, PASSWORD, SALT, PUBLICKEY) 
    VALUES ("user@email.com", "asjiasijasdijadjioijoads", "sal", "1,2,3,4,5")`
    res.status(200).json({
        message: JSON.stringify(results),
    });
});

app.get("/delete_all", async (req, res) => { 
    let results = await database.sql`USE DATABASE cs; 
    DELETE * FROM TABLE ACCESS; DELETE * FROM TABLE FILES; DELETE * FROM TABLE USERS;`
    res.status(200).json({
        message: JSON.stringify(results),
    });
});

// Obtener relaciones
app.get("/access", async (req, res) => {
    let results = await database.sql`USE DATABASE cs;
    SELECT * FROM ACCESS`
    res.status(200).json({
        message: JSON.stringify(results),
    });
});

// Obtener los archivos
app.get("/files", async (req, res) => {
    let results = await database.sql`USE DATABASE cs;
    SELECT * FROM FILES`
    res.status(200).json({
        message: JSON.stringify(results),
    });
});

// Obtener los usuarios + clave pública
app.get("/users", async (req, res) => {
    let results = await database.sql`USE DATABASE cs;
    SELECT ID, EMAIL, PUBLICKEY FROM USERS`
    res.status(200).json({
        message: JSON.stringify(results),
    });
});

app.get('/token', (req, res) => {  
    let newToken = GenerarToken({
        userID: 1,
        user: 'florian', 
        email: 'email@email.com',
    });
    res.status(200).json({ token: newToken });
});    	 

app.listen(3000);
