// Importamos los modelos necesarios desde el archivo central de plataforma.io
const { Rental, Customer, Inventory } = require('../modelos');

module.exports = {
    
    // 6. POST /api/v1/rentals - Registrar/Crear un nuevo Alquiler
    crear: async (req, res) => {
        try {
            const { inventory_id, customer_id, staff_id } = req.body;

            // CASO 400: Faltan datos obligatorios en plataforma.io
            if (!inventory_id || !customer_id || !staff_id) {
                return res.status(400).json({ 
                    status: 400, 
                    error: "Bad Request: Faltan datos obligatorios (inventory_id, customer_id o staff_id)" 
                });
            }

            // CASO 404: Verificar si el cliente existe antes de permitir el alquiler
            const clienteExiste = await Customer.findByPk(customer_id);
            if (!clienteExiste) {
                return res.status(404).json({ 
                    status: 404, 
                    error: `El cliente con ID ${customer_id} no existe. No se puede crear el alquiler.` 
                });
            }

            // Opcional: Podrías verificar si el inventory_id existe aquí también

            const nuevoAlquiler = await Rental.create({
                rental_date: new Date(),
                inventory_id,
                customer_id,
                staff_id,
                last_update: new Date()
            });
            
            // CASO 201: Alquiler creado con éxito
            res.status(201).json({ 
                status: 201,
                rental_id: nuevoAlquiler.rental_id, 
                message: "Alquiler registrado con éxito en plataforma.io",
                data: nuevoAlquiler
            });

        } catch (e) {
            // CASO 400: Error de base de datos o integridad (FK fallida)
            res.status(400).json({ 
                status: 400, 
                error: "Error al registrar alquiler: " + e.message 
            });
        }
    },

    // 7. GET /api/v1/rentals/{rentalId} - Leer/Consultar detalles de un Alquiler
    obtenerPorId: async (req, res) => {
        try {
            const id = req.params.rentalId || req.params.id;

            // CASO 400: ID no es un número
            if (isNaN(id)) {
                return res.status(400).json({ status: 400, error: "El ID proporcionado debe ser numérico." });
            }

            const alquiler = await Rental.findByPk(id);

            // CASO 404: Alquiler no encontrado
            if (!alquiler) {
                return res.status(404).json({ 
                    status: 404, 
                    message: "No se encontró ningún alquiler con el ID: " + id 
                });
            }

            // CASO 200: Éxito
            res.status(200).json({ status: 200, data: alquiler });
        } catch (e) {
            res.status(500).json({ status: 500, error: "Error interno: " + e.message });
        }
    },

    // 8. PUT /api/v1/rentals/{rentalId}/return - Actualizar estado para marcar devolución
    marcarDevolucion: async (req, res) => {
        try {
            const id = req.params.rentalId || req.params.id;

            // CASO 400: ID inválido
            if (isNaN(id)) {
                return res.status(400).json({ status: 400, error: "El ID proporcionado debe ser numérico." });
            }

            const alquiler = await Rental.findByPk(id);

            // CASO 404: No existe el registro para actualizar
            if (!alquiler) {
                return res.status(404).json({ 
                    status: 404, 
                    message: "No se puede procesar la devolución: Alquiler inexistente." 
                });
            }

            // CASO 400: El alquiler ya había sido devuelto (lógica de negocio)
            if (alquiler.return_date) {
                return res.status(400).json({ 
                    status: 400, 
                    message: "Este alquiler ya fue devuelto anteriormente el " + alquiler.return_date 
                });
            }

            await alquiler.update({
                return_date: new Date(),
                last_update: new Date()
            });

            // CASO 200: Éxito en la actualización
            res.status(200).json({ 
                status: 200, 
                message: "Devolución registrada correctamente en plataforma.io",
                data: alquiler 
            });
        } catch (e) {
            res.status(500).json({ status: 500, error: e.message });
        }
    },

    // 9. PUT /api/v1/rentals/{rentalId} - Actualización genérica de alquiler
    actualizar: async (req, res) => {
        try {
            const id = req.params.rentalId || req.params.id;

            if (isNaN(id)) return res.status(400).json({ status: 400, error: "ID inválido" });

            const alquiler = await Rental.findByPk(id);

            // CASO 404
            if (!alquiler) {
                return res.status(404).json({ status: 404, message: "Alquiler no encontrado." });
            }

            const { inventory_id, customer_id, staff_id, return_date } = req.body;

            // Determinamos los valores finales (si no vienen en el body, mantenemos los actuales)
            const finalInventoryId = inventory_id !== undefined ? inventory_id : alquiler.inventory_id;
            const finalCustomerId = customer_id !== undefined ? customer_id : alquiler.customer_id;
            const finalStaffId = staff_id !== undefined ? staff_id : alquiler.staff_id;

            // VALIDACIÓN: Estricta como en 'crear'. No permitimos IDs nulos o inválidos (0)
            if (!finalInventoryId || !finalCustomerId || !finalStaffId) {
                return res.status(400).json({ 
                    status: 400, 
                    error: "Bad Request: Faltan datos obligatorios (inventory_id, customer_id o staff_id)" 
                });
            }

            await alquiler.update({
                inventory_id: finalInventoryId,
                customer_id: finalCustomerId,
                staff_id: finalStaffId,
                return_date: return_date !== undefined ? return_date : alquiler.return_date,
                last_update: new Date()
            });

            // CASO 200
            res.status(200).json({ status: 200, message: "Alquiler actualizado.", data: alquiler });

        } catch (e) {
            res.status(500).json({ status: 500, error: "Error al actualizar alquiler: " + e.message });
        }
    },

    // 11. DELETE /api/v1/rentals/{rentalId} - Eliminar alquiler
    eliminar: async (req, res) => {
        try {
            const id = req.params.rentalId || req.params.id;

            if (isNaN(id)) return res.status(400).json({ status: 400, error: "ID inválido" });

            const alquiler = await Rental.findByPk(id);

            if (!alquiler) {
                return res.status(404).json({ 
                    status: 404, 
                    message: "No se puede eliminar: El alquiler no existe." 
                });
            }

            // Eliminación física
            await alquiler.destroy();

            res.status(200).json({ 
                status: 200, 
                message: "Alquiler eliminado correctamente." 
            });
        } catch (e) {
            res.status(500).json({ status: 500, error: "Error al eliminar alquiler: " + e.message });
        }
    },

    // 10. GET /api/v1/rentals - Obtener lista de todos los Alquileres (Paginación/Filtros)
    listar: async (req, res) => {
        try {
            const paginacionSolicitada = req.query.page || req.query.limit;
            const limite = parseInt(req.query.limit) || 10;
            const pagina = parseInt(req.query.page) || 1;
            const desplazamiento = (pagina - 1) * limite;

            const customerId = req.query.customer_id;
            const inventoryId = req.query.inventory_id;

            let opcionesBusqueda = {
                where: {},
                order: [['rental_id', 'DESC']]
            };

            // CASO: Filtros por query params
            if (customerId) opcionesBusqueda.where.customer_id = customerId;
            if (inventoryId) opcionesBusqueda.where.inventory_id = inventoryId;

            if (paginacionSolicitada) {
                opcionesBusqueda.limit = limite;
                opcionesBusqueda.offset = desplazamiento;

                const { count, rows } = await Rental.findAndCountAll(opcionesBusqueda);

                // CASO 200: Éxito paginado
                return res.status(200).json({
                    status: 200,
                    data: rows,
                    currentPage: pagina,
                    totalPages: Math.ceil(count / limite),
                    totalRecords: count
                });
            } else {
                const alquileres = await Rental.findAll(opcionesBusqueda);
                // CASO 200: Lista completa
                return res.status(200).json({ status: 200, data: alquileres });
            }
        } catch (e) {
            res.status(500).json({ status: 500, error: "Fallo en plataforma.io: " + e.message });
        }
    }
};