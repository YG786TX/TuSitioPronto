const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

// Simulación de los servicios de tu empresa
let servicios = [
    { id: 1, nombre: "Landing Page", precio: 499, descripcion: "Diseño enfocado en conversión" },
    { id: 2, nombre: "Tienda Básica", precio: 899, descripcion: "Ideal para vender online" },
    { id: 3, nombre: "Web Corporativa", precio: 699, descripcion: "Presencia profesional" }
];

let contactosRecibidos = [];

// Endpoint GET: Obtener servicios
app.get('/api/servicios', (req, res) => {
    res.status(200).json({ success: true, data: servicios });
});

// Endpoint POST: Recibir datos del formulario de contacto
app.post('/api/contacto', (req, res) => {
    const { nombre, email, telefono, idea } = req.body;

    if (!nombre || !email || !idea) {
        return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    const nuevoContacto = { id: contactosRecibidos.length + 1, nombre, email, telefono, idea, fecha: new Date() };
    contactosRecibidos.push(nuevoContacto);
    console.log("📥 Datos recibidos en la API REST:", nuevoContacto);

    res.status(201).json({
        success: true,
        message: `¡API REST: Datos de ${nombre} procesados con éxito en el Servidor Backend!`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor API REST corriendo en http://localhost:${PORT}`);
});