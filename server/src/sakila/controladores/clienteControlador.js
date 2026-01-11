// Importamos los modelos necesarios desde el archivo central de plataforma.io
const { Customer, Rental, Payment } = require('../modelos'); 
const { Op } = require('sequelize');

module.exports = {
    
    // 1. POST /api/v1/customers - Crear cliente
    crear: async (req, res) => {
        try {
            const { store_id = 1, first_name, last_name, email = '', address_id = 1 } = req.body;

            // CASO 400: Datos obligatorios ausentes
            if (!first_name || !last_name) {
                return res.status(400).json({ 
                    status: 400, 
                    error: "Bad Request: 'first_name' y 'last_name' son obligatorios." 
                });
            }

            const nuevoCliente = await Customer.create({
                store_id,
                first_name: first_name.toUpperCase(),
                last_name: last_name.toUpperCase(),
                email,
                address_id,
                active: 1,
                create_date: new Date()
            });
            
            // CASO 201: Recurso creado con éxito
            res.status(201).json({ 
                status: 201,
                customer_id: nuevoCliente.customer_id, 
                message: "Cliente creado con éxito en plataforma.io",
                data: nuevoCliente
            });
        } catch (e) {
            // CASO 400: Error de validación de base de datos o duplicados
            res.status(400).json({ status: 400, error: "Error en la petición: " + e.message });
        }
    },

    // 2. GET /api/v1/customers - Listar clientes con paginación y búsqueda
    listar: async (req, res) => {
        try {
            const paginacionSolicitada = req.query.page || req.query.limit;
            const limite = parseInt(req.query.limit) || 10;
            const pagina = parseInt(req.query.page) || 1;
            const desplazamiento = (pagina - 1) * limite;
            const busqueda = req.query.search;

            const columnasRequeridas = [
                'customer_id', 'store_id', 'first_name', 'last_name', 'email', 'address_id', 'active'
            ];

            let queryOptions = {
                attributes: columnasRequeridas,
                order: [['customer_id', 'DESC']]
            };

            // CASO: Filtro de búsqueda activa
            if (busqueda) {
                queryOptions.where = {
                    [Op.or]: [
                        { first_name: { [Op.like]: `%${busqueda}%` } },
                        { last_name: { [Op.like]: `%${busqueda}%` } }
                    ]
                };
            }

            if (paginacionSolicitada) {
                queryOptions.limit = limite;
                queryOptions.offset = desplazamiento;

                const { count, rows } = await Customer.findAndCountAll(queryOptions);

                // CASO 200: Éxito con datos paginados
                return res.status(200).json({
                    status: 200,
                    data: rows,
                    currentPage: pagina,
                    totalPages: Math.ceil(count / limite),
                    totalRecords: count
                });
            } else {
                const clientes = await Customer.findAll(queryOptions);
                // CASO 200: Éxito lista completa (aunque esté vacía)
                return res.status(200).json({ status: 200, data: clientes });
            }
        } catch (e) {
            // CASO 500: Error interno o de conexión
            res.status(500).json({ status: 500, error: "Error de servidor en plataforma.io: " + e.message });
        }
    },

    // 3. GET /api/v1/customers/{customerId} - Obtener cliente por ID
    obtenerPorId: async (req, res) => {
        try {
            const id = req.params.customerId;

            // CASO 400: ID mal formado
            if (isNaN(id)) {
                return res.status(400).json({ status: 400, error: "El ID proporcionado no es un número válido." });
            }

            const cliente = await Customer.findByPk(id, {
                attributes: ['customer_id', 'store_id', 'first_name', 'last_name', 'email', 'address_id', 'active']
            });

            // CASO 404: No encontrado
            if (!cliente) {
                return res.status(404).json({ 
                    status: 404, 
                    message: "Cliente con ID " + id + " no encontrado en plataforma.io" 
                });
            }

            // CASO 200: Encontrado
            res.status(200).json({ status: 200, data: cliente });
        } catch (e) { 
            res.status(500).json({ status: 500, error: e.message }); 
        }
    },

    // 4. PUT /api/v1/customers/{customerId} - Actualizar datos del cliente
    actualizar: async (req, res) => {
        try {
            const id = req.params.customerId;
            const cliente = await Customer.findByPk(id);

            // CASO 404: Intento de actualizar cliente inexistente
            if (!cliente) {
                return res.status(404).json({ 
                    status: 404,
                    message: "No se puede actualizar: El cliente no existe en plataforma.io" 
                });
            }

            const { 
                store_id = cliente.store_id, 
                first_name = cliente.first_name, 
                last_name = cliente.last_name, 
                email = cliente.email, 
                address_id = cliente.address_id, 
                active = cliente.active 
            } = req.body;

            // VALIDACIÓN: Igual que en 'crear', los nombres no pueden estar vacíos
            if (!first_name || !last_name || first_name.trim() === "" || last_name.trim() === "") {
                return res.status(400).json({ 
                    status: 400, 
                    error: "Bad Request: 'first_name' y 'last_name' son obligatorios y no pueden estar vacíos." 
                });
            }

            await cliente.update({
                store_id,
                first_name: first_name.toUpperCase(),
                last_name: last_name.toUpperCase(),
                email,
                address_id,
                active,
                last_update: new Date()
            });
            
            // CASO 200: Actualización exitosa
            res.status(200).json({ 
                status: 200, 
                message: "Cliente actualizado con éxito en plataforma.io",
                data: cliente 
            });
        } catch (e) { 
            // CASO 400: Datos inválidos enviados en el body
            res.status(400).json({ status: 400, error: "Fallo al actualizar: " + e.message }); 
        }
    },

    // 5. DELETE /api/v1/customers/{customerId} - Eliminación total
    eliminar: async (req, res) => {
        try {
            const id = req.params.customerId;

            // CASO 400: ID inválido
            if (isNaN(id)) {
                return res.status(400).json({ status: 400, error: "El ID proporcionado no es válido." });
            }

            const cliente = await Customer.findByPk(id);
            // CASO 404: Intento de borrar algo que no existe
            if (!cliente) {
                return res.status(404).json({ 
                    status: 404,
                    message: "El cliente ya no existe en plataforma.io." 
                });
            }

            // Integridad: Borrar registros relacionados
            await Payment.destroy({ where: { customer_id: id } });
            await Rental.destroy({ where: { customer_id: id } });
            
            // Borrar registro principal
            const deleted = await Customer.destroy({ where: { customer_id: id } });

            // CASO 200: Borrado exitoso
            return res.status(200).json({ 
                status: 200, 
                success: true, 
                message: "Cliente y registros asociados eliminados con éxito de plataforma.io" 
            }); 

        } catch (e) { 
            // CASO 500: Error de integridad o base de datos bloqueada
            res.status(500).json({ status: 500, error: "Error crítico de integridad: " + e.message }); 
        }
    },

    // 9. GET /api/v1/customers/{customerId}/rentals - Listar alquileres de un cliente
    listarAlquileresPorCliente: async (req, res) => {
        try {
            const id = req.params.customerId;
            const cliente = await Customer.findByPk(id);

            // CASO 404: El cliente no existe
            if (!cliente) {
                return res.status(404).json({ 
                    status: 404, 
                    message: "No se pueden listar rentas: Cliente no encontrado." 
                });
            }

            const alquileres = await Rental.findAll({ 
                where: { customer_id: id },
                order: [['rental_date', 'DESC']]
            });

            // CASO: Cliente sin alquileres
            if (!alquileres || alquileres.length === 0) {
                return res.status(200).json({ 
                    status: 200, 
                    message: "Este cliente no tiene alquileres registrados.",
                    data: [] 
                });
            }

            // CASO 200: Éxito (aunque el array sea [], es un 200 válido)
            res.status(200).json({ 
                status: 200, 
                data: alquileres 
            });
        } catch (e) {
            res.status(500).json({ status: 500, error: e.message });
        }
    }
};