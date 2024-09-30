/*
 * Este archivo tendra los diferentes modulos que se utilizaran en
 * el frontend de la aplicacion.
 *
 * En todo el documento AES se refiere a AES128.
 */

import aesjs from 'aes-js';

// ----------------------------------------------
// MODULOS PARA GESTION DE USUARIOS
// ----------------------------------------------

// Modulo 2: Generar clave AES del usuario
// Generar clave AES en base a la password del usuario (TODO form registro/login)
// la entrada debe ser un string de 16 bytes
// el modulo deberia devolver la clave AES 
// MAXIMO

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




// Modulo 5: Pipeline de registro
// Realizar el pipeline de registro de un usuario (Modulos 1, 2, 3 , 4, 10)
// el modulo deberia devolver un mensaje de confirmacion

// Modulo 10: Almacenar clave privada y JWT en local storage (LOGIN)
// Almacenar la clave privada RSA descifrada y el JWT en local storage de manera temporal

// ----------------------------------------------
// MODULOS PARA CIFRADO DE ARCHIVOS
// ----------------------------------------------

// Modulo 6: Generar clave AES con seed aleatoria
// Generar claves AES de manera aleatoria para cifrar archivos posteriormente
// el modulo deberia devolver una clave AES valida (en hexadecimal)

export async function generar_Clave_AES_Random() {
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
// el modulo deberia devolver el archivo cifrado
// MAXIMO

export function cifrarArchivo() {

}

// Modulo 8: Cifrar la clave AES con clave publica RSA
// Cifrar la clave AES (Modulo 6) con la clave publica RSA del usuario (Modulo 1)
// el modulo deberia devolver la clave AES cifrada

//----------------------------------------------
// MODULOS PARA DESCIFRADO DE ARCHIVOS
//----------------------------------------------

// Modulo 12: Descifrar clave AES con clave privada RSA
// Descifrar la clave AES cifrada con la clave privada RSA descifrada (Modulo 10)
// el modulo deberia devolver la clave AES descifrada

// Modulo 13: Descifrar archivo
// Descifrar el archivo con la clave AES descifrada (Modulo 12)
// el modulo deberia devolver el archivo descifrado
// MAXIMO

// Modulo 14: Mostrar archivo descifrado
// Mostrar el archivo descifrado al usuario