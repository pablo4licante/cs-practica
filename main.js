const { Database } = require('@sqlitecloud/drivers');
const express = require('express');
const app = express();
const fs = require('fs');

let aesjs = require('aes-js');
//let database = new Database('sqlitecloud://cjajv32esz.sqlite.cloud:8860?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc') 
 
function DecryptFile(encryptedBytes, key) { 
    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    return aesCtr.decrypt(encryptedBytes);
}

function EncryptFile(textBytes, key) { 
    //var textBytes = aesjs.utils.utf8.toBytes(file);
    
    // The counter is optional, and if omitted will begin at 1
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);
  
    // Convert our bytes back into text
    return encryptedBytes; 
}

function SaveBytes(path, data) {
    fs.writeFile(path, data, 'binary',  (err)=> {
        if (err) {
            console.log("There was an error writing the image")
        }
        else {
            console.log("Written File :" + path)
        }
    }); 
}

function GetUserFromBearer(token) {
    return "florian";
}

var key_128 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const multer = require('multer'); 
const upload = multer();
app.post('/encrypt', upload.single('upload'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    } else if (!req.headers['Authorization']) {
        return res.status(400).json({ error: 'No token' });
    }

    let token = req.headers['Authorization'];
    let username = GetUserFromBearer(token);

    let userFolder = `./uploads/${username}`;
    fs.mkdir(userFolder, { recursive: true }, (err) => {
        if (err) throw err;
    }); 

    let enc = EncryptFile(req.file.buffer, key_128);    
    SaveBytes(`${userFolder}/enc_${req.file.originalname}`, enc);  
 
    res.status(200).json({ message: `File ${req.file.originalname} uploaded!`});
});

app.get('/', async (req, res) => {  
    //let results = database.sql`USE DATABASE cs; INSERT INTO usuarios (nombre) VALUES ("Paco"); SELECT * FROM usuarios` 
    //let results = await database.sql`USE DATABASE cs; SELECT * FROM usuarios`
    //res.send(results)

    console.log(EncryptFile("abcde", key_128));
});

app.listen(3000) 