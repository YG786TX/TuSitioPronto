const formularioContacto = document.querySelector('form') || document.getElementById('registroForm');

if (formularioContacto) {
    formularioContacto.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Referencia al botón de envío para cambiar su texto dinámicamente
        const botonEnviar = formularioContacto.querySelector('button[type="submit"]') || formularioContacto.querySelector('.btn') || formularioContacto.querySelector('input[type="submit"]');
        const textoOriginalBoton = botonEnviar ? botonEnviar.innerText : "ENVIAR MI IDEA";

        // Mapea los inputs de tu formulario
        const nombreInput = document.querySelector('input[type="text"]');
        const emailInput = document.querySelector('input[type="email"]');
        const telefonoInput = document.querySelector('input[type="tel"]') || document.querySelectorAll('input[type="text"]')[1];
        const ideaInput = document.querySelector('textarea');

        const datos = {
            nombre: nombreInput ? nombreInput.value.trim() : "",
            email: emailInput ? emailInput.value.trim() : "",
            telefono: telefonoInput ? telefonoInput.value.trim() : "",
            idea: ideaInput ? ideaInput.value.trim() : ""
        };

        try {
            // Efecto visual de carga en el botón
            if (botonEnviar) {
                botonEnviar.innerText = "Enviando...";
                botonEnviar.disabled = true;
            }

            // Enviando datos mediante FETCH a la API REST de Node.js
            const response = await fetch('http://localhost:3000/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await response.json();

            if (resultado.success) {
                // ÉXITO: El botón cambia temporalmente de color y texto
                if (botonEnviar) {
                    botonEnviar.innerText = "✓ ¡Idea Recibida con Éxito!";
                    botonEnviar.style.backgroundColor = "#28a745"; // Verde estético
                    botonEnviar.style.color = "#ffffff";
                }
                
                formularioContacto.reset();

                // Devuelve el botón a la normalidad tras 4 segundos
                setTimeout(() => {
                    if (botonEnviar) {
                        botonEnviar.innerText = textoOriginalBoton;
                        botonEnviar.disabled = false;
                        botonEnviar.style.backgroundColor = ""; 
                        botonEnviar.style.color = "";
                    }
                }, 4000);

            } else {
                console.error(`Error en Servidor: ${resultado.message}`);
                if (botonEnviar) {
                    botonEnviar.innerText = "Error al enviar";
                    botonEnviar.disabled = false;
                }
            }
        } catch (error) {
            console.error(error);
            if (botonEnviar) {
                botonEnviar.innerText = "Servidor Apagado";
                botonEnviar.disabled = false;
                botonEnviar.style.backgroundColor = "#dc3545"; // Rojo de advertencia
                botonEnviar.style.color = "#ffffff";
                
                setTimeout(() => {
                    botonEnviar.innerText = textoOriginalBoton;
                    botonEnviar.style.backgroundColor = "";
                    botonEnviar.style.color = "";
                }, 4000);
            }
        }
    });
}