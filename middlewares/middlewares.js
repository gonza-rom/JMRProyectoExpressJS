const express = require('express');

// Función para configurar todos los middlewares
const setupMiddlewares = (server) => {
    // Procesar cuerpos de solicitudes JSON
    server.use(express.json());

    // Procesar cuerpos de solicitudes en formato 'text/plain'
    server.use(express.text());

    // Procesar cuerpos de solicitudes URL-encoded (formularios HTML)
    server.use(express.urlencoded({ extended: false }));

    // Sirve archivos estáticos (HTML, CSS, JS, imágenes)
    server.use(express.static("frontend"));
};

module.exports = setupMiddlewares;
