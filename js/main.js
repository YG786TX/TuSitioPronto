// ==========================================
// CONFIGURACIÓN E IMPORTACIONES DE FIREBASE
// ==========================================
import { db } from "./firebase-config.js";
import { collection, doc, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Importación adicional para gestionar el estado de la sesión en el Navbar
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // EXTRA: SUBIDA AUTOMÁTICA EN SEGUNDO PLANO
    // ==========================================
    async function inicializarServiciosEnFirebase() {
        try {
            const serviciosParaSubir = [
                { id: "1", nombre: "Landing Page", precio: 499, categoria: "marketing", descripcion: "Diseño enfocado en conversión" },
                { id: "2", nombre: "Web Corporativa", precio: 3500, categoria: "corporativo", descripcion: "Sitio oficial para tu identidad" },
                { id: "3", nombre: "Tienda Básica", precio: 6000, categoria: "ecommerce", descripcion: "E-commerce listo para vender" }
            ];
            
            console.log("Subiendo productos a Firebase de fondo...");
            for (const servicio of serviciosParaSubir) {
                const { id, ...datos } = servicio;
                await setDoc(doc(collection(db, "servicios"), id), datos);
            }
            console.log("¡Productos guardados exitosamente en Firestore!");
        } catch (error) {
            console.error("Error al inyectar datos iniciales:", error);
        }
    }
    
    // Se quita el 'await' inicial para que no congele el renderizado visual de la página
    inicializarServiciosEnFirebase();


    // ==========================================
    // 1. ANIMACIONES CON INTERSECTION OBSERVER
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.15 });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));


    // ==========================================
    // 2. SISTEMA DE BÚSQUEDA Y FILTRADO PERSISTENTE
    // ==========================================
    const inputBuscar = document.getElementById("search-input");
    const botonesCategoria = document.querySelectorAll(".filter-btn, [data-category]");
    const sliderPrecio = document.getElementById("price-range") || document.querySelector("input[type='range']");
    const textoPrecioMax = document.getElementById("price-value") || document.querySelector("[style*='color: #00ffcc']");
    const mensajeVacio = document.getElementById("no-results-message");

    // 🛡️ PROTECCIÓN CLAVE: Solo ejecutar los filtros si realmente estamos en la página de paquetes
    const esPaginaPaquetes = document.querySelector(".tarjeta-servicio") !== null || document.querySelector(".filter-btn") !== null;

    if (esPaginaPaquetes) {
        // Cargar estados guardados de sessionStorage o usar valores por defecto
        let categoryActive = sessionStorage.getItem("filter_category") || "all";
        let maxPriceActive = sessionStorage.getItem("filter_price") ? parseFloat(sessionStorage.getItem("filter_price")) : (sliderPrecio ? parseFloat(sliderPrecio.value) : 7000);
        let searchTextActive = sessionStorage.getItem("filter_search") || "";

        // Mapeo de respaldo por inconsistencias de atributos HTML
        const listaPreciosAux = {
            "landing page": { precio: 499, categoria: "marketing" },
            "web corporativa": { precio: 3500, categoria: "corporativo" },
            "tienda básica": { precio: 6000, categoria: "ecommerce" }
        };

        function filtrarCatalogoProductos() {
            const tarjetas = document.querySelectorAll(".tarjeta-servicio");
            let elementosVisibles = 0;

            tarjetas.forEach(tarjeta => {
                const h3Element = tarjeta.querySelector("h3");
                const tituloServicio = h3Element ? h3Element.innerText.trim().toLowerCase() : "";
                
                let catTarjeta = tarjeta.getAttribute("data-category") || tarjeta.getAttribute("data-prod-category");
                let precioTarjeta = tarjeta.getAttribute("data-price");

                if (!catTarjeta || !precioTarjeta) {
                    const auxData = listaPreciosAux[tituloServicio] || { precio: 0, categoria: "all" };
                    if (!catTarjeta) catTarjeta = auxData.categoria;
                    if (!precioTarjeta) precioTarjeta = auxData.precio;
                }

                const precioNum = parseFloat(precioTarjeta);
                
                // 🛡️ Evitamos errores si el atributo viene vacío o nulo
                const catClean = catTarjeta ? catTarjeta.toLowerCase().replace(/[^a-z0-9]/g, '') : "all";
                const filterClean = categoryActive.toLowerCase().replace(/[^a-z0-9]/g, '');

                const cumpleBusqueda = tituloServicio.includes(searchTextActive);
                const cumpleCategoria = (filterClean === "all" || filterClean === "todos" || catClean === filterClean);
                const cumplePrecio = (precioNum <= maxPriceActive);

                if (cumpleBusqueda && cumpleCategoria && cumplePrecio) {
                    tarjeta.style.setProperty('display', 'block', 'important');
                    elementosVisibles++;
                } else {
                    tarjeta.style.setProperty('display', 'none', 'important');
                }
            });

            // Mostrar u ocultar mensaje de "No resultados"
            if (mensajeVacio) {
                mensajeVacio.style.display = (elementosVisibles === 0) ? "block" : "none";
            }
        }

        // Aplicar estilos visuales según el botón de categoría activo guardado
        function actualizarVisualBotones() {
            botonesCategoria.forEach(boton => {
                const dataCat = boton.getAttribute("data-category") || "all";
                if (dataCat.toLowerCase() === categoryActive.toLowerCase()) {
                    boton.classList.add("active");
                    boton.style.background = "rgba(0,255,204,0.1)";
                    boton.style.color = "#00ffcc";
                    boton.style.border = "1px solid #00ffcc";
                } else {
                    boton.classList.remove("active");
                    boton.style.background = "#000";
                    boton.style.color = "#8b949e";
                    boton.style.border = "1px solid #333";
                }
            });
        }

        // Inicializar valores de los controles según la sesión guardada
        if (inputBuscar && searchTextActive) {
            inputBuscar.value = searchTextActive;
        }
        if (sliderPrecio) {
            sliderPrecio.value = maxPriceActive;
            if (textoPrecioMax) textoPrecioMax.innerText = `$${maxPriceActive} MXN`;
        }
        actualizarVisualBotones();
        filtrarCatalogoProductos(); // Ejecución inicial con filtros recuperados

        // --- Listeners de Eventos ---
        if (inputBuscar) {
            inputBuscar.addEventListener("input", (e) => {
                searchTextActive = e.target.value.toLowerCase();
                sessionStorage.setItem("filter_search", searchTextActive);
                filtrarCatalogoProductos();
            });
        }

        botonesCategoria.forEach(boton => {
            boton.addEventListener("click", (e) => {
                e.preventDefault();
                const dataCat = boton.getAttribute("data-category");
                categoryActive = dataCat ? dataCat.toLowerCase() : "all";
                
                sessionStorage.setItem("filter_category", categoryActive);
                actualizarVisualBotones();
                filtrarCatalogoProductos();
            });
        });

        if (sliderPrecio) {
            sliderPrecio.addEventListener("input", (e) => {
                maxPriceActive = parseFloat(e.target.value);
                sessionStorage.setItem("filter_price", maxPriceActive);
                if (textoPrecioMax) {
                    textoPrecioMax.innerText = `$${maxPriceActive} MXN`;
                }
                filtrarCatalogoProductos();
            });
        }
    }

    // ==========================================
    // 3. CARRITO DE COMPRAS LÓGICA DE INTERFAZ
    // ==========================================
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    function actualizarNumeroCarrito() {
        const contadorSpan = document.querySelector(".cart-icon span");
        if (contadorSpan) {
            const totalProductos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
            contadorSpan.innerText = totalProductos;
        }
    }
    actualizarNumeroCarrito();


    // ==========================================
    // 5. DETECTAR SESIÓN ACTIVA EN EL NAVBAR
    // ==========================================
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        const navActions = document.querySelector(".nav-actions");

        if (user && navActions) {
            console.log("Sesión activa detectada para:", user.email);
            const nombreUsuario = user.email.split('@')[0];
            
            navActions.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="color: #00ffcc; font-size: 0.95rem; font-weight: 500;">👋 ¡Hola, ${nombreUsuario}!</span>
                    <button id="logout-btn" style="background: transparent; color: #ff4a4a; border: 1px solid #ff4a4a; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; transition: 0.3s;">Cerrar Sesión</button>
                </div>
            `;

            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    signOut(auth).then(() => {
                        console.log("Sesión cerrada.");
                        window.location.href = "index.html";
                    }).catch((error) => {
                        console.error("Error al cerrar sesión:", error);
                    });
                });
            }
        } else {
            console.log("Visitante anónimo o menú de navegación ausente.");
        }
    });


    // ==========================================
    // 6. ENVÍO DEL FORMULARIO "CUÉNTANOS TU IDEA"
    // ==========================================
    const formularioContacto = document.getElementById("contactForm");

    if (formularioContacto) {
        formularioContacto.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const telefono = document.getElementById("telefono").value;
            const idea = document.getElementById("idea").value;

            try {
                // Guarda la información estructurada en la colección 'ideas'
                await addDoc(collection(db, "ideas"), {
                    nombre: nombre,
                    email: email,
                    telefono: telefono,
                    idea: idea,
                    fechaEnvio: new Date().toISOString()
                });

                window.mostrarToastNotificacion("¡Tu idea ha sido enviada con éxito!");
                formularioContacto.reset();
            } catch (error) {
                console.error("Error al guardar la idea en Firestore:", error);
                alert("Ocurrió un error al enviar tu idea. Inténtalo de nuevo.");
            }
        });
    }


    // ==========================================
    // 7. ENVÍO DEL FORMULARIO "TU OPINIÓN NOS IMPORTA" (Optimizado y Corregido)
    // ==========================================
    const formularioOpinion = document.getElementById("opinionForm") || document.querySelector(".opinion-main form");

    if (formularioOpinion) {
        formularioOpinion.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Procesando envío de opinión...");

            // 1. Capturar Radio Button seleccionado para la rapidez (Busca preferentemente por name='rapidez')
            const calificacionSeleccionada = formularioOpinion.querySelector("input[name='rapidez']:checked") || formularioOpinion.querySelector("input[type='radio']:checked");
            const calificacion = calificacionSeleccionada ? calificacionSeleccionada.value : "No especificado";

            // 2. Capturar el Select del servicio de interés (Busca por name='servicio' o la etiqueta select general)
            const selectServicio = formularioOpinion.querySelector("select[name='servicio']") || formularioOpinion.querySelector("select");
            const servicioInteres = selectServicio ? selectServicio.value : "No especificado";

            // 3. Capturar el Textarea de sugerencias (Busca por name='sugerencias' o la etiqueta textarea general)
            const textareaSugerencias = formularioOpinion.querySelector("textarea[name='sugerencias']") || formularioOpinion.querySelector("textarea");
            const sugerencias = textareaSugerencias ? textareaSugerencias.value.trim() : "";

            try {
                // Guarda la información estructurada en la colección 'opiniones'
                await addDoc(collection(db, "opiniones"), {
                    calificacion: calificacion,
                    servicioInteres: servicioInteres,
                    sugerencias: sugerencias,
                    fechaEnvio: new Date().toISOString()
                });

                window.mostrarToastNotificacion("¡Gracias por ayudarnos a mejorar!");
                formularioOpinion.reset();
                console.log("Opinión guardada con éxito en Firestore.");

            } catch (error) {
                console.error("Error al guardar la opinión en Firestore:", error);
                alert("Ocurrió un error al enviar tu percepción. Inténtalo de nuevo: " + error.message);
            }
        });
    }
});

// ==========================================
// 4. LÓGICA GLOBAL DEL CARRITO (Compartida)
// ==========================================
const catalogoServicios = [
    { id: 1, nombre: "Landing Page", precio: 499, descripcion: "Diseño enfocado en conversión" },
    { id: 2, nombre: "Web Corporativa", precio: 3500, descripcion: "Sitio oficial para tu identidad" },
    { id: 3, fontFamilly: "var(--font-texto)", nombre: "Tienda Básica", precio: 6000, descripcion: "E-commerce listo para vender" }
];

window.mostrarToastNotificacion = function(mensaje) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-check-circle" style="color: #00ffcc;"></i> <span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

window.agregarAlCarrito = function(idServicio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoSeleccionado = catalogoServicios.find(s => s.id === idServicio);
    
    if (productoSeleccionado) {
        const productoExiste = carrito.find(item => item.id === idServicio);
        if (productoExiste) {
            productoExiste.cantidad++;
        } else {
            carrito.push({ ...productoSeleccionado, Skin: true, cantidad: 1 });
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarToastNotificacion(`¡${productoSeleccionado.nombre} añadido al carrito!`);
        
        const contadorSpan = document.querySelector(".cart-icon span");
        const totalProductos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        if (contadorSpan) contadorSpan.innerText = totalProductos;
    }
}