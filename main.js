const express = require("express");
const app = express();
const fs = require("fs");

function UploadBytes(filePath, path) {
    var Client = require("ftp");
    var c = new Client();
    c.on("ready", function () {
        console.log("ready");
        c.put(filePath, `./htdocs/${path}`, function (err) {
            console.log("put?");
            if (err) throw err;

            console.log(err);
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
const upload = multer({dest:'./tmp/'}).single('file');
app.post("/upload", upload,  (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    } else if (!req.headers["Authorization"]) {
        return res.status(400).json({ error: "No token" });
    }

    let token = req.headers["Authorization"];
    let username = "usuario";

    let userFolder = `./uploads/${username}`;
    fs.mkdir(userFolder, { recursive: true }, (err) => {
        if (err) throw err;
    });
 
    UploadBytes(req.file.path, `${userFolder}/enc_${req.file.originalname}`);

    res.status(200).json({
        message: `File ${req.file.originalname} uploaded!`,
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
