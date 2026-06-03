// ==========================================
// CONFIGURACIÓN E IMPORTACIONES DE FIREBASE
// ==========================================
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const registroForm = document.getElementById('registroForm');
const notificationContainer = document.getElementById('notification-container');

// FUNCIÓN REUTILIZABLE PARA MOSTRAR NOTIFICACIONES ELEGANTES
function showNotification(message, type = 'success', duration = 2500) {
    if (!notificationContainer) return;

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type === 'error' ? 'error' : ''}`;
    
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    notificationContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    return new Promise((resolve) => {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                resolve();
            }, 400);
        }, duration);
    });
}

if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtenemos los valores de los inputs
        const nombre = document.getElementById('reg-nombre').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        // 1. Validar que ambas contraseñas coincidan localmente
        if (password !== confirmPassword) {
            showNotification("Las contraseñas no coinciden. Por favor, verifícalas.", "error");
            return; 
        }

        // 2. Validar longitud mínima requerida por seguridad
        if (password.length < 6) {
            showNotification("La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        try {
            // Enviamos la petición a Firebase Authentication para crear el usuario
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ==========================================
            // GUARDAR PERFIL CON ROL EN FIRESTORE
            // ==========================================
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                email: user.email,
                rol: "cliente",
                fechaRegistro: new Date().toISOString()
            });

            // Notificación personalizada de éxito con retardo controlado
            await showNotification(`¡Cuenta creada con éxito! Bienvenido, ${nombre || user.email}`, 'success');
            
            // Redirigir al index con la sesión iniciada automáticamente
            window.location.href = 'index.html';

        } catch (error) {S
            console.error("Error al registrar usuario:", error.code);

            // Control de errores de autenticación comunes
            let errorMsg = 'Error al intentar registrar la cuenta.';
            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'Este correo electrónico ya está registrado con otra cuenta.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = 'El formato de correo electrónico ingresado no es válido.';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = 'La contraseña elegida es muy débil.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMsg = 'El registro por correo y contraseña no está habilitado.';
            }

            showNotification(errorMsg, 'error');
        }
    });
}