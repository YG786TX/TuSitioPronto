// Importamos las funciones necesarias desde la versión oficial web de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"; // 🔐 Importación añadida

// Tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkHoiiiPuSm9V-dJxg01fNLwLgKYGA7FY",
  authDomain: "tusitiopronto.firebaseapp.com",
  projectId: "tusitiopronto",
  storageBucket: "tusitiopronto.firebasestorage.app",
  messagingSenderId: "968192362201",
  appId: "1:968192362201:web:6920a004805979b928a0c8",
  measurementId: "G-2WS1BY6G8G"
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas listas para ser usadas en tus otros archivos
export const db = getFirestore(app);
export const auth = getAuth(app); // 🔐 Exportación añadida