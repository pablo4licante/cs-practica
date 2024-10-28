/*
 * Este archivo tendra los diferentes modulos que se utilizaran en
 * el backend de la aplicacion.
 * 
 */

const { Database } = require('@sqlitecloud/drivers');

const fs = require('fs');
const ftp = require('ftp');
const moment = require('moment');

// TODO ESCONDER TOKEN SECRET
const jwt_secret = 'secret';
const jwt = require('jsonwebtoken')

const generarToken = (payload) => { 
    const opciones = {
        expiresIn: '1h',  
    }; 
    return jwt.sign(payload, jwt_secret, opciones);
};

const validarToken = (req, res, next) => { 
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

const db = new Database('sqlitecloud://cjajv32esz.sqlite.cloud:8860/cs?apikey=pqXdLE9WN4KJaubEtPay1bpQJ4z6AkqNCBQuyu4Y8qc');
console.log('Base de datos conectada');

// ----------------------------------------------
// MODULOS PARA GESTION DE USUARIOS
// ----------------------------------------------

// Modulo 4: Almacenar claves RSA en el servidor
// Almacenar las claves RSA publica y privada cifrada en el servidor
// el modulo deberia devolver un mensaje de confirmacion

async function guardarClavesRSA(email, public_key, private_key) {
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
// MODULOS PARA LA SUBIDA DE ARCHIVOS MEDIANTE FTP
// ----------------------------------------------

let datos_ftp = {
    host: "ftpupload.net", 
    port: 21, 
    user: "if0_37322158", 
    password: "rlVSmEn4uB3B52q",
}; 
const ruta_ftp = `./htdocs/uploads`;
 
function eliminarArchivoLocal(file_path) {
    fs.unlink(file_path, (err) => { 
        if (err) throw err;
        console.log(`Archivo eliminado: ${file_path}`);
    });
}
 
async function subirArchivo(file_path, metadata, user_id, user_email, AES_key) {
    if(!AES_key) {  
        // Eliminar archivo temporal    
        eliminarArchivoLocal(file_path);  
        return {status:400, message:'Error al subir el archivo, clave privada no especificada'};
    } 
    return new Promise((resolve, reject) => {
        var c = new ftp();
        c.on("error", function (e) {     
            // Eliminar archivo temporal    
            eliminarArchivoLocal(file_path);   
            console.log(`${e} al subir el archivo: ${file_path} subido por ${user_email}(${user_id})`);
            reject({status:500, message:`Error al subir el archivo: ${e}`});
        });   
        c.on("ready", async function () {   
            try {  
                c.list(ruta_ftp, async function (err, list) { 
                    if (err) throw err; 

                    // Comprobar si la carpeta para la id de usuario existe
                    let carpetaExiste = false;
                    for (let i = 0; i < list.length; i++) {
                        if(list[i].name == user_id) { 
                            carpetaExiste = true;
                            break;
                        }
                    }  
                    // Crear nueva carpeta si es necesario
                    if(!carpetaExiste) { 
                        await c.mkdir(`${ruta_ftp}/${user_id}`, true, async function (err) {
                            if (err) throw err; 
                            console.log(`Carpeta creada para usuario: ${user_id}`);
                        });
                    } 
 
                    // Nombre y ruta del archivo
                    let file_name = `file${moment().valueOf()}`; 
                    let path = `${user_id}/${file_name}`;
                     
                    // Almacenar archivo en db
                    let result = await db.sql`USE DATABASE cs; 
                    INSERT INTO FILES (URL, METADATA) 
                    VALUES (${path}, ${JSON.stringify(metadata)})`;
                    
                    // ID generada por la base de datos
                    let file_id = result.lastID;
                  
                    // Crear relacion entre archivo y usuario en db
                    await db.sql`USE DATABASE cs; 
                    INSERT INTO ACCESS (FILE, USER, FILEKEY) 
                    VALUES (${file_id}, ${user_id}, "${AES_key}")`;
  
                    // Almacenar archivo en la carpeta del usuario con ftp
                    const destino = `${ruta_ftp}/${path}`;  
                    await c.put(file_path, destino, async function (err) { 
                        if (err) throw err;

                        console.log(`Archivo ${file_path} subido por ${user_email}(${user_id})`);
                       
                        // Eliminar archivo temporal    
                        eliminarArchivoLocal(file_path); 
                        
                        // Cerrar conexión
                        c.end(); 

                        resolve({status:200, message:'Archivo subido con éxito'});
                    }); 
                });  
            }catch (e) {   
                // Eliminar archivo temporal    
                eliminarArchivoLocal(file_path); 

                console.log(`${e} al subir el archivo: ${file_path} subido por ${user_email}(${user_id})`);
                reject({status:500, message:`Error al subir el archivo: ${e}`});
            }
        });  
        c.connect(datos_ftp); 
    });
} 

//----------------------------------------------
// MODULOS PARA DESCIFRADO DE ARCHIVOS
//----------------------------------------------

// Modulo 11: Obtener archivo junto a su clave AES
// Obtener el archivo cifrado y la clave AES cifrada del servidor FTP
// el modulo deberia devolver el archivo y la clave AES cifrada

async function obtenerArchivoyAES(token, file_id) {
    try {
        //decodificar el token jwt
        const decoded = jwt.verify(token, jwt_secret);
        console.log('Token decodificado:', decoded);
        //buscar el id del usuario y guardarlo en variable
        const res = await db.sql`SELECT ID FROM USERS WHERE EMAIL = ${decoded.email};`;
        console.log('Resultado de búsqueda de usuario:', res);
        
        if(res.length > 0) {
            const user_id = res[0].ID;

            const file = await db.sql`SELECT f.URL, a.FILEKEY FROM FILES f JOIN ACCESS a ON f.ID = a.FILE WHERE a.USER = ${user_id} AND f.ID = ${file_id};`;
            console.log('Archivo del usuario:', file);

            return file;
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error en obtenerArchivosyAES:', error);
        throw error;
    }
 }

// Modulo 12: Devolver la informacion de todos los archivos de un usuario.
// Hay que pasarle el token del usuario y y devuelve la informacion de todos los archivos
// de ese usuario

async function obtenerArchivosUsuario(token) {
    return new Promise((resolve, reject) =>  { 
        let obtener = async () => { 
            try {
                // Verifica el token
                const decoded = jwt.verify(token, jwt_secret);
                console.log('Token decodificado:', decoded);

                const res = await db.sql`SELECT ID FROM USERS WHERE EMAIL = ${decoded.email};`;
                console.log('Resultado de búsqueda de usuario:', res);

                if (res.length > 0) {
                    const user_id = res[0].ID;

                    const files = await db.sql`SELECT f.* FROM FILES f JOIN ACCESS a ON f.ID = a.FILE WHERE a.USER = ${user_id};`;
                    console.log('Archivos del usuario:', files);

                    resolve({status:200, files:files});
                } else {
                    throw new Error('Usuario no encontrado');
                }
            } catch (error) {
                console.error('Error en obtenerArchivosUsuario:', error);
                reject({status:500, message:error});
            }
        }  
        obtener();
    });
}

async function obtenerClavePublica(token) {
    try {
        // Decodificar el token jwt
        const decoded = jwt.verify(token, jwt_secret);
        console.log('Token decodificado:', decoded);

        const res = await db.sql`SELECT k.PUBLIC_KEY FROM KEYS k JOIN USERS u ON k.USER_ID = u.ID WHERE u.EMAIL = ${decoded.email};`;
        return { status: 200, public_key: res[0].PUBLIC_KEY };
    } catch (error) {
        console.error('Error en obtenerClavePublica:', error);
        throw error;
    }
}

async function obtenerArchivo(token, file_id) {
    return new Promise((resolve, reject) =>  { 
        let obtener = async () => { 
            try {
                // Verifica el token
                const decoded = jwt.verify(token, jwt_secret);
                console.log('Token decodificado:', decoded);

                const res = await db.sql`SELECT ID FROM USERS WHERE EMAIL = ${decoded.email};`;
                console.log('Resultado de búsqueda de usuario:', res);

                if (res.length > 0) {
                    const user_id = res[0].ID;
                    
                    const file = await db.sql`SELECT f.* FROM FILES f JOIN ACCESS a ON f.ID = a.FILE WHERE a.USER = ${user_id} AND f.ID = ${file_id};`;
                    console.log('Archivos del usuario:', file);

                    resolve({status:200, file:file});
                } else {
                    throw new Error('Usuario no encontrado');
                }
            } catch (error) {
                console.error('Error en obtenerArchivosUsuario:', error);
                reject({status:500, message:error});
            }
        }  
        obtener();
    });
}

async function emailExiste(email) {
    return new Promise((resolve, reject) => {
    
    try {
        const res = db.sql`SELECT COUNT(*) as count FROM USERS WHERE EMAIL = ${email};`;
        resolve({status:200, found:res[0].count > 0});
    } catch (error) {
        console.error('Error en emailExiste:', error);
        reject({status:500, message:error});
    }
});
}
async function guardarUsuario(email, password, salt, tfasecret) {
    try {
        // Verifica si el usuario ya existe
        const res = await db.sql`SELECT COUNT(*) as count FROM USERS WHERE EMAIL = ${email};`;
        if (res[0].count > 0) {
            throw new Error('El usuario ya existe');
        }

        // Inserta el nuevo usuario en la base de datos
        const insertResult = await db.sql`INSERT INTO USERS (EMAIL, PASSWORD, SALT, TFA) VALUES (${email}, ${password}, ${salt}, ${tfasecret});`;
        console.log('Resultado de la inserción:', insertResult);

        return { status: 200, message: 'Usuario guardado con éxito' };
    } catch (error) {
        console.error('Error en guardarUsuario:', error);
        throw error;
    }
}

async function getUser(email) {
    try {
        const res = await db.sql`SELECT COUNT(*) as count FROM USERS WHERE EMAIL = ${email};`;

        if(res[0].count > 0) {
            const res = await db.sql`SELECT * FROM USERS WHERE EMAIL = ${email};`;
            return { ...res[0], exists: true };
        } else {
            return { exists: false};
        } 
        
    } catch (error) {
        console.error('Error en getUser:', error);
        throw error;
    }
}

module.exports = {
    obtenerClavePublica,
    obtenerArchivosUsuario,
    guardarClavesRSA,
    obtenerArchivo,
    subirArchivo,
    obtenerArchivoyAES,
    obtenerArchivosUsuario,
    emailExiste,
    guardarUsuario,
    getUser,
    generarToken,
    validarToken
};
