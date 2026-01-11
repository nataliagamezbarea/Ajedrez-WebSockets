const express = require('express');
const router = express.Router();
const alquilerControlador = require('../controladores/alquilerControlador');

// Crear alquiler
router.post('/', alquilerControlador.crear);

// Obtener alquiler por ID
router.get('/:rentalId', alquilerControlador.obtenerPorId);

// Registrar devolución
router.put('/:rentalId/return', alquilerControlador.marcarDevolucion);

// Listar alquileres
router.get('/', alquilerControlador.listar);

module.exports = router;