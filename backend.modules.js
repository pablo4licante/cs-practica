/*
 * Este archivo tendra los diferentes modulos que se utilizaran en
 * el backend de la aplicacion.
 * 
 */

// TODO ESCONDER TOKEN SECRET
const secret = 'secret';

import { jwt } from 'jsonwebtoken';
import { Database } from '@sqlitecloud/drivers';

const db = new Database('sqlitecloud://cjajv32esz.sqlite.cloud:8860/cs?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc');
console.log('Base de datos conectada');

// ----------------------------------------------
// MODULOS PARA GESTION DE USUARIOS
// ----------------------------------------------

// Modulo 1: Generar claves RSA
// Generar claves RSA de manera aleatoria 
// el modulo deberia devolver las dos claves en un objeto JSON


// Modulo 4: Almacenar claves RSA en el servidor
// Almacenar las claves RSA publica y privada cifrada en el servidor
// el modulo deberia devolver un mensaje de confirmacion

export async function guardarClavesRSA(email, public_key, private_key) {
    try {
        console.log('Buscando usuario con email:', email);
        
        // Realiza la consulta para obtener el ID del usuario
        const res = await db.sql`SELECT ID FROM USERS WHERE EMAIL = ${email};`;
        console.log('Resultado de búsqueda de usuario:', res);

        if (res.length > 0) {
            const user_id = res[0].ID;

            // Inserta las claves RSA en la tabla KEYS
            const insertResult = await db.sql`INSERT INTO KEYS (USER_ID, PUBLIC_KEY, PRIVATE_KEY) VALUES (${user_id}, ${public_key}, ${private_key});`;
            console.log('Resultado de la inserción:', insertResult);

            return 'Claves RSA guardadas con éxito';
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error en guardarClavesRSA:', error);
        throw error;
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


// Modulo 12: Devolver la informacion de todos los archivos de un usuario.
// Hay que pasarle el token del usuario y y devuelve la informacion de todos los archivos
// de ese usuario

export async function obtenerArchivosUsuario(token) {
    
    try {
        // Verifica el token
        const decoded = jwt.verify(token, secret);
        console.log('Token decodificado:', decoded);

        const res = await db.sql`SELECT ID FROM USERS WHERE EMAIL = ${decoded.email};`;
        console.log('Resultado de búsqueda de usuario:', res);

        if (res.length > 0) {
            const user_id = res[0].ID;

            const files = await db.sql`SELECT f.* FROM FILES f JOIN ACCESS a ON f.ID = a.FILE WHERE a.USER = ?;`([user_id]);
            console.log('Archivos del usuario:', files);

            return files;
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error en obtenerArchivosUsuario:', error);
        throw error;
    }
}
