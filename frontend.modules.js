/*
 * Este archivo tendra los diferentes modulos que se utilizaran en
 * el frontend de la aplicacion.
 *
 * En todo el documento AES se refiere a AES128.
 */

var aesjs = require('aes-js');


// ----------------------------------------------
// MODULOS PARA GESTION DE USUARIOS
// ----------------------------------------------

// Modulo 2: Generar clave AES del usuario
// Generar clave AES en base a la password del usuario (TODO form registro/login)
// el modulo deberia devolver la clave AES

// Modulo 3: Cifrar la clave privada
// Cifrar la clave RSA privada (Modulo 1) con la clave AES (Modulo 2)
// el modulo deberia devolver la clave RSA privada cifrada

export function cifrarRSAPrivada() {
  // An example 128-bit key (16 bytes * 8 bits/byte = 128 bits)
  var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  // Convert text to bytes
  var text = "Pepe se ha comido un pollo  al horno con patatas.";
  var textBytes = aesjs.utils.utf8.toBytes(text);

  // The counter is optional, and if omitted will begin at 1
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  var encryptedBytes = aesCtr.encrypt(textBytes);

  // To print or store the binary data, you may convert it to hex
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  console.log(encryptedHex);
  // "a338eda3874ed884b6199150d36f49988c90f5c47fe7792b0cf8c7f77eeffd87
  //  ea145b73e82aefcf2076f881c88879e4e25b1d7b24ba2788"

  // When ready to decrypt the hex string, convert it back to bytes
  var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

  // The counter mode of operation maintains internal state, so to
  // decrypt a new instance must be instantiated.
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  var decryptedBytes = aesCtr.decrypt(encryptedBytes);

  // Convert our bytes back into text
  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  console.log(decryptedText);
  // "Pepe se ha comido un pollo  al horno con patatas."
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
// el modulo deberia devolver una clave AES valida

// Modulo 7: Cifrar archivo
// Cifrar un archivo con una clave AES (Modulo 6)
// el modulo deberia devolver el archivo cifrado

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

// Modulo 14: Mostrar archivo descifrado
// Mostrar el archivo descifrado al usuario