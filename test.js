import { guardarClavesRSA } from './backend.modules.js';

(async () => {
    try {
        const mensaje = await guardarClavesRSA('pablo@example.com', 'mi_public_key', 'mi_private_key');
        console.log(mensaje);
    } catch (error) {
        console.error('Error:', error);
    }
})();
