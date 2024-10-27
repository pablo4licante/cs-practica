import aesjs from 'aes-js';

const api = 'http://localhost:3000';

const mytoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXIiOiJwYWJsbyIsImVtYWlsIjoicGFibG9AZXhhbXBsZS5jb20iLCJpYXQiOjE3Mjk5MDc5NzcsImV4cCI6MTcyOTkxMTU3N30.iacG8apqNDPJdScRLnh8vU17oT7E3FHi2YInS0n6vgs";

// Modulo 1: Generar claves RSA
// Generar claves RSA de manera aleatoria usando Web Crypto API
async function generarClavesRSA(contrasenya) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // Las claves pueden exportarse
    ["encrypt", "decrypt"]
  );

  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  // Convertir a formato base64 para JSON
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

  return {
    publica: publicKeyBase64,
    privada: privateKeyBase64,
  };
}

// Modulo 2: Generar clave AES del usuario
function generarClaveAES(pass) {
  const stringBytes = new TextEncoder().encode(pass);
  if (stringBytes.length === 16) {
    var claveAES = aesjs.utils.utf8.toBytes(pass);
    return claveAES;
  } else {
    console.error("Error: El string no tiene exactamente 16 bytes. Operación abortada.");
  }
}

// Modulo 3: Cifrar la clave privada con AES
function cifrarRSAPrivada(RSA_private_key, clave_AES) {
  var RSA_private_key_Bytes = aesjs.utils.utf8.toBytes(RSA_private_key);
  var aesCtr = new aesjs.ModeOfOperation.ctr(clave_AES, new aesjs.Counter(5));
  var RSA_private_key_Bytes_Encrypted = aesCtr.encrypt(RSA_private_key_Bytes);
  var RSA_private_key_Hex_Encrypted = aesjs.utils.hex.fromBytes(RSA_private_key_Bytes_Encrypted);
  return RSA_private_key_Hex_Encrypted;
}

// Modulo 6: Generar clave AES de manera aleatoria usando Web Crypto API
async function generar_Clave_AES_Random() {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 128,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const clave_AES_Bytes = await crypto.subtle.exportKey("raw", key);
  const clave_AES_Array = Array.from(new Uint8Array(clave_AES_Bytes));

  const clave_AES_Hex = Array.from(clave_AES_Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  console.log(clave_AES_Hex);
  return clave_AES_Hex;
}

// Modulo 7: Cifrar archivo con AES
function cifrarArchivo(file, claveAES) {
  var claveAES_Bytes = aesjs.utils.utf8.toBytes(claveAES);
  var aesCtr = new aesjs.ModeOfOperation.ctr(claveAES_Bytes, new aesjs.Counter(5)); 
  const fileBytes = aesjs.utils.utf8.toBytes(file); 
  var fileEncryptedAsBytes = aesCtr.encrypt( fileBytes ); 
  return fileEncryptedAsBytes;
}

// Modulo 10: Guardar clave privada y JWT en localStorage
function guardarDatos(RSA_private_key, token) {
  const ahora = new Date().getTime();
  const tiempo = ahora + 180 * 60000; // 3 horas
  const datos = {
    RSA_private_key: RSA_private_key,
    tokenJWT: token,
    expiracion: tiempo
  };
  localStorage.setItem('authData', JSON.stringify(datos));
}

// Cifrar la clave AES con la clave publica RSA del usuario 
async function cifrarClaveAES(claveAES, RSA_public_key) {
  var claveAES_Bytes = aesjs.utils.utf8.toBytes(claveAES);
  var aesCtr = new aesjs.ModeOfOperation.ctr(claveAES_Bytes, new aesjs.Counter(5));
  var claveRSA_Bytes = aesjs.utils.utf8.toBytes(RSA_public_key); 
  return aesjs.utils.hex.fromBytes(aesCtr.encrypt(claveRSA_Bytes));
}

// Pipeline de registro
async function registro(email, password) {
  console.log("Registrando usuario..."); 
  return new Promise((resolve, reject) =>  { 
    checkUsuarioRegistrado(email).then(existe => {
        if(existe) {
            throw 'Usuario ya registrado';
        } 
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const passwordConSalt = password + btoa(String.fromCharCode(...salt));
        const passwordBytes = new TextEncoder().encode(passwordConSalt);
        
        crypto.subtle.digest('SHA-256', passwordBytes).then(hash => { 
          const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
          const hashMitad1 = hashHex.slice(0, hashHex.length / 2);
          const hashMitad2 = hashHex.slice(hashHex.length / 2);
    
          generarClavesRSA(password).then(RSA_keys => {  
            const privateKeyEncrypted = cifrarRSAPrivada(RSA_keys.privada, aesjs.utils.utf8.toBytes(hashMitad1));
      
            fetch(api + '/guardar-datos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                public_key: RSA_keys.publica,
                private_key: privateKeyEncrypted,
                password: hashMitad2,
                salt: btoa(String.fromCharCode(...salt))
              })
            })
            .then(response => { 
              if(response.status == 200) {
                response.json().then(response => {  
                  console.log(response);
                  resolve('OK');
                });
              }else{ throw "Respuesta " + response.status; }
            })
            .catch(error => { throw error; });
          }).catch(error => { throw error })
        }).catch(error => { reject("Error al registrar usuario: " + error); })
    }).catch(error => { reject(error); })
  }) 
}

// Verificar si el usuario está registrado
async function checkUsuarioRegistrado(email) {
  try {
    const response = await fetch(api + "/obtener-usuario?email=" + email);
    if (response.status === 200) {
      const data = await response.json();
      return data.exists;
    } else {
      console.error("Error: No se pudo verificar el usuario.");
      return false;
    }
  } catch (error) {
    console.error("Error: " + error);
    return false;
  }
}

// Obtener clave publica del usuario logueaado
async function obtenerClavePublica(token) {
  try {
    const response = await fetch(api + "/obtener-clave-publica?token=" + token);
    if (response.status === 200) {
      const data = await response.json();
      return data.public_key;
    } else {
      console.error("Error: No se pudo obtener la clave publica.");
      return false;
    }
  } catch (error) {
    console.error("Error: " + error);
    return false;
  }
}

async function subirArchivo(formData, archivoPlano) {
  const archivoSubido = formData.get("upload");
 
  let clave_AES = await generar_Clave_AES_Random();
  let RSA_public_key = await obtenerClavePublica(mytoken); 
  let archivoCifrado = await cifrarArchivo(archivoPlano, clave_AES);
  let clave_AES_cifrada = await cifrarClaveAES(clave_AES, RSA_public_key);
 
  console.log("creando archivo cifrado");
  let archivo = new Blob([new Uint8Array(archivoCifrado)], { 
    type: archivoSubido.type, 
    name: archivoSubido.name, 
    lastModified: archivoSubido.lastModified
  });

  formData.set("upload", archivo);
  formData.set("claveAES", clave_AES_cifrada);
  
  console.log("subiendo...");
  await fetch(api + '/subir-archivo', {
    method: 'POST',
    headers: {'Authorization': mytoken },
    body: formData
  })
  .then(response => response.json())
  .then(data => console.log('Archivo subido:', data))
  .catch(error => console.error('Error al subir el archivo:', error));
}

export { 
  generarClaveAES,
  cifrarRSAPrivada,
  generar_Clave_AES_Random,
  cifrarArchivo,
  guardarDatos,
  registro,
  checkUsuarioRegistrado,
  obtenerClavePublica,
  subirArchivo
};
