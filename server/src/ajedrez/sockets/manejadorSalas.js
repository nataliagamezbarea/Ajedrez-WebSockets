const JuegoServicio = require('../servicios/juegoServicio');
const crypto = require('crypto');

module.exports = (io, socket, sincronizar) => {
    const actualizarGlobalLista = () => io.emit('listaSalas', JuegoServicio.obtenerSalasPublicas());

    socket.on('pedirListaSalas', () => socket.emit('listaSalas', JuegoServicio.obtenerSalasPublicas()));

    socket.on('unirseASala', ({ idSala, esPrivada, usuario }) => {
        let idFinal = idSala ? idSala.toUpperCase() : crypto.randomBytes(4).toString('hex').toUpperCase();
        const sala = JuegoServicio.crearSala(idFinal, esPrivada);
        
        const yaEstabaEnSala = sala.jugadores.find(j => j.id === socket.id);
        
        if (sala.jugadores.length >= 2 && !yaEstabaEnSala) {
            socket.emit('errorAlUnirse', 'La sala está ocupada');
            return;
        }

        socket.join(idFinal);

        if (!yaEstabaEnSala) {
            let colorAsignado = 'w';
            
            if (sala.jugadores.length === 1) {
                const jugadorExistente = sala.jugadores[0];
                colorAsignado = jugadorExistente.color === 'w' ? 'b' : 'w';
            }
            
            sala.jugadores.push({ id: socket.id, nombre: usuario, color: colorAsignado });
            socket.emit('colorAsignado', colorAsignado);
            
            io.to(idFinal).emit('nuevoJugador', { nombre: usuario, color: colorAsignado });
        } else {
            socket.emit('colorAsignado', yaEstabaEnSala.color);
        }

        sincronizar(idFinal);
        actualizarGlobalLista();
    });

    // Abandono de sala
    socket.on('abandonarSala', (idSala) => {
        const res = JuegoServicio.manejarAbandono(socket.id);
        
        if (res) {
            if (res.borrar) {
                io.to(idSala).emit('partidaFinalizada', { 
                    ganador: null, 
                    motivo: "El oponente abandonó la partida." 
                });
                JuegoServicio.eliminarSala(idSala);
            } else if (res.quedaAlguien) {
                io.to(idSala).emit('rivalAbandono');
                sincronizar(idSala);
            }
        }
        
        socket.leave(idSala);
        actualizarGlobalLista();
    });
};