
     // Función para realizar la solicitud POST
     async function post() {
        // Datos a enviar
        const datos = {
            email : document.getElementById(email).value,
            password : document.getElementById(password).value,
        };

        // Solicitud POST
        await post(`http://localhost:3000/guardar-datos`, datos)
            .then(response => {
                console.log('Datos guardados exitosamente:', response);
                fileExplorerDiv.textContent = 'Datos guardados exitosamente.';
            });
    } 