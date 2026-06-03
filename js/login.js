import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const notificationContainer = document.getElementById('notification-container');

// FUNCIÓN REUTILIZABLE PARA MOSTRAR NOTIFICACIONES ELEGANTES
function showNotification(message, type = 'success', duration = 2500) {
    if (!notificationContainer) return;

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type === 'error' ? 'error' : ''}`;
    
    // Asignación de iconos dinámicos según el tipo de respuesta
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    notificationContainer.appendChild(toast);

    // Pequeño retardo para activar la transición CSS de entrada
    setTimeout(() => toast.classList.add('show'), 10);

    // Retiro del elemento una vez cumplido el tiempo expuesto
    return new Promise((resolve) => {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                resolve();
            }, 400); // Espera que termine la animación de salida
        }, duration);
    });
}

// 1. LÓGICA PARA INICIAR SESIÓN EN FIREBASE
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Notificación personalizada de éxito
            await showNotification(`¡Bienvenido! Acceso concedido para: ${user.email}`, 'success');
            window.location.href = 'index.html'; 

        } catch (error) {
            console.error("Error al iniciar sesión:", error.code);
            
            // Manejo estructurado con diseño de errores
            let errorMsg = 'Ocurrió un error al intentar acceder.';
            if (error.code === 'auth/user-not-found') {
                errorMsg = 'El correo electrónico no está registrado.';
            } else if (error.code === 'auth/wrong-password') {
                errorMsg = 'La contraseña que ingresaste es incorrecta.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = 'El formato de correo no es válido.';
            } else if (error.code === 'auth/internal-error' || error.code === 'auth/invalid-credential') {
                errorMsg = 'Credenciales inválidas. Verifica tus datos.';
            }

            showNotification(errorMsg, 'error');
        }
    });
}

// 2. LÓGICA PARA CERRAR SESIÓN
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', async () => {
        try {
            await signOut(auth);
            await showNotification('Has cerrado tu sesión de forma segura.', 'success');
            window.location.href = 'index.html';
        } catch (error) {
            showNotification('Error al intentar cerrar sesión: ' + error.message, 'error');
        }
    });
}

// 3. Monitoreo de estado en consola
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuario actualmente activo en el portal:", user.email);
    } else {
        console.log("Ningún usuario ha iniciado sesión.");
    }
});