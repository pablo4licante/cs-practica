async function login(evt){
    evt.preventDefault();

    const userEmail = document.getElementById("email").value;
    
    try {
        await fetch(`http://localhost:3000/generar-token?usuario=${userEmail}`).then(response => {
            if(!response.ok){
                throw new Error("No se ha podido conectar con el servidor.");
            }
            return response.json();
        }).then(token => {
            sessionStorage.setItem('token', token);

        });
    } catch(error) {
        console.error("Ha fallado.")
    }
}