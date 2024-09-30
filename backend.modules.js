/*
 * Este archivo tendra los diferentes modulos que se utilizaran en
 * el backend de la aplicacion.
 * 
 */

import { Database } from '@sqlitecloud/drivers';

const db = new Database(sqlitecloud://cjajv32esz.sqlite.cloud:8860/cs?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc);

// ----------------------------------------------
// MODULOS PARA GESTION DE USUARIOS
// ----------------------------------------------

// Modulo 1: Generar claves RSA
// Generar claves RSA de manera aleatoria 
// el modulo deberia devolver las dos claves en un objeto JSON


// Modulo 4: Almacenar claves RSA en el servidor
// Almacenar las claves RSA publica y privada cifrada en el servidor
// el modulo deberia devolver un mensaje de confirmacion
export function guardarClavesRSA(email, public_key, private_key) {
        db.sql('SELECT id FROM users WHERE email = ?', [email], (err, res) => {
                if(err) {
                        console.log(err);
                        return err;
                }
        }
}

// ----------------------------------------------
// MODULOS PARA CIFRADO DE ARCHIVOS
// ----------------------------------------------

// Modulo 9: Almacenar archivo y clave AES cifrada en el servidor
// CHECK CODIGO @Florian, subida del archivo al servidor FTP y 
// guardar registro en la DB del archivo junto a la clave AES cifrada.
// el modulo deberia devolver un mensaje de confirmacion


//----------------------------------------------
// MODULOS PARA DESCIFRADO DE ARCHIVOS
//----------------------------------------------

// Modulo 11: Obtener archivo junto a su clave AES
// Obtener el archivo cifrado y la clave AES cifrada del servidor FTP
// el modulo deberia devolver el archivo y la clave AES cifrada





