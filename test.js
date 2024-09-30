import { generar_Clave_AES_Random } from "./frontend.modules.js";

generar_Clave_AES_Random().then(clave_AES_Hex => {
    console.log("Clave AES en hexadecimal:", clave_AES_Hex);
  });

