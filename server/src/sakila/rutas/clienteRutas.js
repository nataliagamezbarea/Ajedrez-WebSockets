const express = require('express');
const router = express.Router();
const clienteControlador = require('../controladores/clienteControlador');

/**
 * ENRUTADOR: Módulo de Clientes (Customers) - plataforma.io
 */

// 1. Crear Cliente (POST /api/v1/customers)
router.post('/', clienteControlador.crear); 

// 2. Listar Clientes (GET /api/v1/customers)
router.get('/', clienteControlador.listar); 

// 3. Obtener Cliente por ID (GET /api/v1/customers/:customerId)
router.get('/:customerId', clienteControlador.obtenerPorId); 

// 4. Actualizar Cliente (PUT /api/v1/customers/:customerId)
router.put('/:customerId', clienteControlador.actualizar); 

// 5. Eliminar Cliente (DELETE /api/v1/customers/:customerId)
router.delete('/:customerId', clienteControlador.eliminar); 

/**
 * CONSULTA DE RELACIONES:
 * IMPORTANTE: Usamos 'clienteControlador' porque la función 
 * 'listarAlquileresPorCliente' la definimos en ese archivo.
 */
router.get('/:customerId/rentals', clienteControlador.listarAlquileresPorCliente); 

module.exports = router;