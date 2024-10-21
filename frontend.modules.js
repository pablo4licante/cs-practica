/*
 * Este archivo tendra los diferentes modulos que se utilizaran en
 * el frontend de la aplicacion.
 *
 * En todo el documento AES se refiere a AES128.
 */

//TODO CIFRAR LA CLAVE PRIVADA CON LA CLAVE AES y GUARDAR DE LA PASSWORD LA MITAD DEL HASH Y COMPROBAR LA MITAD DEL HASH

import aesjs from 'aes-js';
import crypto from 'crypto';
import { guardarClavesRSA } from './backend.modules';

// Modulo 1: Generar claves RSA
// Generar claves RSA de manera aleatoria 
// el modulo deberia devolver las dos claves en un objeto JSON
function generarClavesRSA(contrasenya){
  var { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,  // Tamaño del módulo (n) en bits
      publicKeyEncoding: {
          type: 'spki',     // Formato de la clave pública
          format: 'pem'     // Codificación en formato PEM (Base64)
      },
      privateKeyEncoding: {
          type: 'pkcs8',    // Formato de la clave privada
          format: 'pem',    // Codificación en formato PEM (Base64)
          cipher: 'aes-256-cbc', // (Opcional) Cifrado para proteger la clave privada
          passphrase: contrasenya // Contraseña para proteger la clave privada (opcional)
      }
  });

  //Devolver JSON
  const claves={publica:publicKey, privada:privateKey};
  return claves;
}


// ----------------------------------------------
// MODULOS PARA GESTION DE USUARIOS
// ----------------------------------------------

// Modulo 2: Generar clave AES del usuario
// Generar clave AES en base a la password del usuario (TODO form registro/login)
// Entrada: un string de 16 bytes
// el modulo deberia devolver la clave AES 

export function generarClaveAES(pass) {
   //var pass = "EstaEsMiPassword" //se necesita un bloque de 16 bytes como este
   const stringBytes = new TextEncoder().encode(pass);
   if (stringBytes.length === 16) {
      // Si cumple, se genera la clave
      var claveAES = aesjs.utils.utf8.toBytes(pass);
      return claveAES;
   } else {
      // Si no cumple, aborta
      console.error("Error: El string no tiene exactamente 16 bytes. Operación abortada.");
   }
}




// Modulo 3: Cifrar la clave privada
// Cifrar la clave RSA privada (Modulo 1) con la clave AES (Modulo 2)
// el modulo deberia devolver la clave RSA privada cifrada

export function cifrarRSAPrivada(RSA_private_key, clave_AES) {
  // todos los text son RSA_private_key y todos los key es clave AES128 (key de 128bits obligatoriamente)
  // rsa en bytes
  var RSA_private_key_Bytes = aesjs.utils.utf8.toBytes(RSA_private_key);

  // contador de 5, se puede quitar y empezaría en 1 (poner el mismo en modulo de descrifrar)
  var aesCtr = new aesjs.ModeOfOperation.ctr(clave_AES, new aesjs.Counter(5));
  var RSA_private_key_Bytes_Encrypted = aesCtr.encrypt(RSA_private_key_Bytes);

  // convertir rsa en hexadecimal para guardarlo asi en la bd
  var RSA_private_key_Hex_Encrypted = aesjs.utils.hex.fromBytes(RSA_private_key_Bytes_Encrypted);
  return RSA_private_key_Hex_Encrypted;
  // devuelve clave RSA cifrada (en hexadecimal)
}


// Modulo 10: Almacenar clave privada y JWT en local storage (LOGIN)
// Almacenar la clave privada RSA descifrada y el JWT en local storage de manera temporal

export function guardarDatos(RSA_private_key, token){
  const ahora = new Date().getTime();
  // 3 horas de tiempo de expiracion
  // pasar minutos a milisegundos
  const tiempo = ahora + 180 * 60000;    
  const datos = {
      RSA_private_key: RSA_private_key,
      tokenJWT: token,
      expiracion: tiempo
  };
    
  // Guardar los datos como string en el localStorage
  localStorage.setItem('authData', JSON.stringify(datos));
}

// ----------------------------------------------
// MODULOS PARA CIFRADO DE ARCHIVOS
// ----------------------------------------------

// Modulo 6: Generar clave AES con seed aleatoria
// Generar claves AES de manera aleatoria para cifrar archivos posteriormente
// el modulo deberia devolver una clave AES valida (en hexadecimal)

async function generar_Clave_AES_Random() {
  // Función que genera una clave AES aleatoria y la devuelve en formato hexadecimal
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM", // AES en modo GCM
      length: 128,     // Longitud de la clave: 128 bits
    },
    true,              // Permite exportar la clave
    ["encrypt", "decrypt"]  // Usos permitidos de la clave
  );
  
  // Exporta la clave en formato binario
  const clave_AES_Bytes = await crypto.subtle.exportKey("raw", key);
  const clave_AES_Array = new Uint8Array(clave_AES_Bytes); // Convierte a Uint8Array para manipularla
  
  // Convierte el Uint8Array a una cadena hexadecimal
  const clave_AES_Hex = Array.from(clave_AES_Array)
    .map(byte => byte.toString(16).padStart(2, '0'))  // Convierte cada byte a hexadecimal
    .join('');                                        // Une todos los bytes en un string


  console.log(clave_AES_Hex);
  return clave_AES_Hex; // Devuelve la clave en formato hexadecimal
}


// Modulo 7: Cifrar archivo
// Cifrar un archivo con una clave AES (Modulo 6)
// Entrada: un archivo en base 64 y la clave AES a utilizar
// el modulo deberia devolver el archivo cifrado

function cifrarArchivo(file, claveAES) {
   var aes = aesjs.AES(claveAES);
   var fileAsBytes = aesjs.utils.utf8.toBytes(file)
   var fileEncryptedAsBytes = aes.encrypt(fileAsBytes);
   var fileEncryptedHex = aesjs.utils.hex.fromBytes(fileEncryptedAsBytes);
   return fileEncryptedHex;
}

// Modulo 8: Cifrar la clave AES con clave publica RSA
// Cifrar la clave AES (Modulo 6) con la clave publica RSA del usuario (Modulo 1)
// el modulo deberia devolver la clave AES cifrada
function cifrarClavesAES(claveAES, clavePublica){
  const AES_encriptada = crypto.publicEncrypt(clavePublica, claveAES);
  return AES_encriptada;
}

//----------------------------------------------
// MODULOS PARA DESCIFRADO DE ARCHIVOS
//----------------------------------------------

// Modulo 12: Descifrar clave AES con clave privada RSA
// Descifrar la clave AES cifrada con la clave privada RSA descifrada (Modulo 10)
// el modulo deberia devolver la clave AES descifrada
function descifrarClaveAES(encriptadaAES, clavePrivada, contrasenya){
  const AES_desencriptada = crypto.privateDecrypt({key: clavePrivada, passphrase: contrasenya}, encriptadaAES);
  return AES_desencriptada;
}

// Modulo 13: Descifrar archivo
// Descifrar el archivo con la clave AES descifrada (Modulo 12)
// Entrada: el archivo cifrado en base64 y la claveAES en bytes
// el modulo deberia devolver el archivo descifrado

export function descifrarArchivo(fileEncryptedHex, claveAES) {
   var aes = new aesjs.AES(claveAES);
   // convierte a bytes para desencriptar
   var fileEncryptedAsBytes = aesjs.utils.hex.toBytes(fileEncryptedHex);
   var fileDecryptedAsBytes = aes.decrypt(fileEncryptedAsBytes);
   // devuelve bytes desencriptados
   return fileDecryptedAsBytes;
}

// Modulo 14: Mostrar archivo descifrado
// Mostrar el archivo descifrado al usuario

// Modulo 15: Generar archivo descargable
// Reconstruir con el nombre y los datos descifrados el archivo original
// Entrada: nombre del archivo en la BD, datos del archivo descifrados
// No debe retornar nada

function generarArchivo(nombre, fileAsBytes){
   // se debe convertir el archivo en bytes a Unit8Array para que funcione con File
   const fileAsArray = new Uint8Array(fileAsBytes); 

   //ver cómo gestionar el archivo con MIME
   const file = new File( fileAsArray, nombre, {type: 'text/plain'});
   
   // se genera una URL temporal para acceder al objeto blob
   const url = URL.createObjectURL(file);
   
   // checkear y cambiar si es necesario
   // crea un <a> auxiliar para descargar el archivo 
   const a = document.createElement('a');
   a.href = url;
   a.download = file.name;
   
   a.click();
   
   // se elimina la URL temporal
   URL.revokeObjectURL(url);
}


// ----------------------------------------------
// PIPELINE REGISTRO
// ----------------------------------------------

// Modulo 5: Pipeline de registro
// Realizar el pipeline de registro de un usuario (Modulos 1, 2, 3 , 4, 10)
// el modulo deberia devolver un mensaje de confirmacion

async function registro(email, password) {
  if(checkUsuarioRegistrado(email) == false) {

    // Generar un salt aleatorio
    const salt = crypto.randomBytes(32).toString('hex');
    // Concatenar el salt con la contraseña
    const passwordConSalt = password + salt;

    // Generar un hash de 256 bits de la contraseña
    const hash = crypto.createHash('sha256').update(passwordConSalt).digest('hex'); // TODO: Mejorar a ARGON2
    // Dividir el hash en dos partes
    const hashMitad1 = hash.slice(0, hash.length / 2); //128bits
    const hashMitad2 = hash.slice(hash.length / 2); // segunda mitad hasheada (lo que seria la contrasenya)

    
    // Generar claves RSA
    const RSA_keys = await generarClavesRSA(); // TODO pasar a implementacion propia (?)
    RSA_keys.privada = cifrarRSAPrivada(RSA_keys.privada, hashMitad1);
    RSA_keys.publica;

    // Enviar datos al endpoint /guardar-datos
    await fetch('/guardar-datos', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      email,
      public_key: RSA_keys.publica,
      private_key: RSA_keys.privada,
      password: hashMitad2,
      salt
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Datos guardados:', data);
    })
    .catch(error => {
      console.error('Error al guardar los datos:', error);
    });


  }
}


async function checkUsuarioRegistrado(email) {
  await fetch("/obtener-usuario?email=" + email).then(response => {
    if (response.status === 200) {
      if(response.found == true) {
        console.log("Error: El usuario ya existe.");
        return true;
      } else {
        return false;
      }
    }
  }).catch(error => {
    console.error("Error: " + error);
  });
}



module.exports = {
    generarClaveAES,
    cifrarRSAPrivada,
    generar_Clave_AES_Random,
    cifrarArchivo,
    cifrarClavesAES,
    descifrarClaveAES,
    descifrarArchivo,
    generarArchivo,
    guardarDatos,
    checkUsuarioRegistrado,
    registro
};
