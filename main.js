const { Database } = require('@sqlitecloud/drivers')
const express = require('express')
const app = express()

let database = new Database('sqlitecloud://cjajv32esz.sqlite.cloud:8860?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc') 
 
app.get('/', async (req, res) => {  
    //let results = database.sql`USE DATABASE cs; INSERT INTO usuarios (nombre) VALUES ("Paco"); SELECT * FROM usuarios` 
    let results = await database.sql`USE DATABASE cs; SELECT * FROM usuarios`
    res.send(results)
});

app.listen(3000) 