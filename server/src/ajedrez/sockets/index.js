const manejadorSalas = require('./manejadorSalas');
const manejadorJuego = require('./manejadorJuego');
const manejadorAcciones = require('./manejadorAcciones');
const JuegoServicio = require('../servicios/juegoServicio');

module.exports = (io, socket) => {
    
    // Sincroniza el estado de la sala con todos los clientes conectados
    const sincronizar = (idSala) => {
        const sala = JuegoServicio.obtenerSala(idSala);
        if (!sala) return;
        
        io.to(idSala).emit('estadoJuego', {
            matrizTablero: sala.motorAjedrez.board(),
            turnoActual: sala.motorAjedrez.turn(),
            estaEnJaque: sala.motorAjedrez.inCheck(),
            tiempoRestante: sala.tiempoRestante,
            partidaIniciada: sala.jugadores.length === 2,
            votosRevancha: Array.from(sala.votosRevancha || [])
        });
    };

    // Inicialización de manejadores de eventos
    manejadorSalas(io, socket, sincronizar);
    manejadorJuego(io, socket, sincronizar);
    manejadorAcciones(io, socket, sincronizar);

    // Gestión de desconexión
    socket.on('disconnect', () => {
        const resultado = JuegoServicio.manejarAbandono(socket.id);
        
        if (resultado) {
            const { idSala, borrar, quedaAlguien, motivo } = resultado;

            if (borrar) {
                // La sala se elimina (partida en curso o vacía)
                if (idSala) {
                    io.to(idSala).emit('partidaFinalizada', { 
                        ganador: null, 
                        motivo: motivo || "Rival desconectado. Sala cerrada." 
                    });
                    JuegoServicio.eliminarSala(idSala);
                }
            } else if (quedaAlguien) {
                // El rival espera en la sala (antes de iniciar partida)
                io.to(idSala).emit('rivalAbandono');
                io.to(idSala).emit('revanchaCancelada'); 
                sincronizar(idSala);
            }

            // Actualizar lista de salas en el lobby
            io.emit('listaSalas', JuegoServicio.obtenerSalasPublicas());
        }
    });
};