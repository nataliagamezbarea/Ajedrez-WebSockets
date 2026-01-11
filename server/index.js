require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');

// Configuración ORM y Modelos
const sequelizeORM = require('./src/compartido/db_orm');
const { Customer, Rental } = require('./src/sakila/modelos'); 

// Servicios y Rutas
const constantes = require('./src/ajedrez/utilidades/constantes');
const registrarHandlersAjedrez = require('./src/ajedrez/sockets'); 
const JuegoServicio = require('./src/ajedrez/servicios/juegoServicio');
const clienteRutas = require('./src/sakila/rutas/clienteRutas');
const alquilerRutas = require('./src/sakila/rutas/alquilerRutas');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint de configuración
app.get('/api/ajedrez/config', (req, res) => { res.json(constantes); });

// Esquema GraphQL (Definición de tipos para Clientes y Alquileres)
const typeDefs = gql`
    type Customer { 
        customer_id: ID!, 
        first_name: String!, 
        last_name: String!, 
        email: String, 
        rentals: [Rental] 
    }
    type Rental { 
        rental_id: ID!, 
        rental_date: String, 
        return_date: String, 
        inventory_id: Int, 
        customer_id: Int, 
        staff_id: Int, 
        last_update: String 
    }
    type Query { 
        customer(id: ID!): Customer 
    }
`;

// Resolvers GraphQL (Lógica de obtención de datos)
const resolvers = {
    Query: {
        customer: async (_, { id }) => {
            return await Customer.findByPk(id);
        }
    },
    Customer: {
        rentals: async (parent) => {
            return await parent.getRentals({ order: [['rental_date', 'DESC']] });
        }
    }
};

// Inicialización del servidor principal
async function iniciarServidor() {
    
    // Conexión a la base de datos mediante el ORM
    try {
        await sequelizeORM.authenticate();
        console.log('Conexion Sequelize lista para plataforma.io');
    } catch (error) {
        console.error('Error al conectar el ORM:', error);
    }

    // Configuración y arranque de Apollo Server (GraphQL)
    const serverGraph = new ApolloServer({ typeDefs, resolvers, introspection: true });
    await serverGraph.start();
    serverGraph.applyMiddleware({ app, path: '/graphql' });

    // Rutas de la API REST
    app.use('/api/v1/customers', clienteRutas);
    app.use('/api/v1/rentals', alquilerRutas);

    // --- CONFIGURACIÓN DE SERVIDOR HTTP Y SOCKET.IO ---
    const server = http.createServer(app);
    
    /**
     * Configuración optimizada para Render:
     * 1. transports ['websocket']: Evita el retraso inicial del polling.
     * 2. pingTimeout: 60s permite que si la sesión de Google expira y el usuario refresca, 
     * no se elimine su estado de la sala inmediatamente.
     */
    const io = new Server(server, { 
        cors: { 
            origin: "*", 
            methods: ["GET", "POST"] 
        },
        transports: ['websocket', 'polling'], 
        pingTimeout: 60000, 
        pingInterval: 25000 
    });

    // Manejo de conexiones de sockets en plataforma.io
    io.on('connection', (socket) => { 
        // Enviamos la lista inicial de salas públicas al conectar
        socket.emit('listaSalas', JuegoServicio.obtenerSalasPublicas());
        
        // Registramos todos los eventos de ajedrez (movimientos, chats, etc.)
        registrarHandlersAjedrez(io, socket); 
    });

    /**
     * LOOP DE JUEGO (Tick Rate 1s)
     * Se encarga de actualizar los cronómetros de todas las partidas activas
     * y notificar cuando una partida finaliza por tiempo.
     */
    setInterval(() => {
        JuegoServicio.actualizarSalasPorTick(
            (idSala, tiempoActual) => { 
                // Actualiza el reloj en los clientes de la sala
                io.to(idSala).emit('updateTimer', tiempoActual); 
            },
            (idSala, resultado) => { 
                // Notifica el fin de la partida y actualiza el lobby
                io.to(idSala).emit('partidaFinalizada', resultado);
                io.emit('listaSalas', JuegoServicio.obtenerSalasPublicas());
            }
        );
    }, 1000);

    // Inicio de escucha en el puerto configurado (por defecto 3000)
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => { 
        console.log(`Servidor plataforma.io listo en puerto: ${PORT}`); 
    });
}

// Captura de errores críticos en el arranque
iniciarServidor().catch(err => { 
    console.error('Error critico al arrancar plataforma.io:', err); 
});

module.exports = app;