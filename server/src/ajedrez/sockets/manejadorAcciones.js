const JuegoServicio = require('../servicios/juegoServicio');
const { Chess } = require('chess.js');

module.exports = (io, socket, sincronizar) => {
    
    // Chat: Envío de mensajes con identificación de emisor
    socket.on('enviarMensaje', (data) => {
        if (data.texto && data.texto.trim()) {
            io.to(data.idSala).emit('nuevoMensaje', { 
                texto: data.texto, 
                usuario: data.usuario,
                idEmisor: socket.id,
                id: Math.random().toString(36).substr(2, 9)
            });
        }
    });

    // Rendición
    socket.on('rendirse', ({ idSala }) => {
        const sala = JuegoServicio.obtenerSala(idSala);
        if (!sala) return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (jugador) {
            const ganador = jugador.color === 'w' ? 'Negras' : 'Blancas';
            io.to(idSala).emit('partidaFinalizada', { ganador, motivo: 'Rendición' });
        }
    });

    // Gestión de tablas (Empate)
    socket.on("pedirTablas", (idSala) => {
        socket.to(idSala).emit("propuestaTablasRecibida");
    });

    socket.on("responderTablas", ({ idSala, aceptado }) => {
        if (aceptado) {
            io.to(idSala).emit("partidaFinalizada", { ganador: null, motivo: "Tablas por acuerdo" });
        } else {
            socket.to(idSala).emit("propuestaTablasRechazada");
        }
    });

    // Sistema de Revancha
    socket.on('solicitarRevancha', (idSala) => {
        socket.to(idSala).emit('revanchaSolicitada'); 
    });

    socket.on('aceptarRevancha', (idSala) => {
        const sala = JuegoServicio.obtenerSala(idSala);
        if (sala) {
            sala.motorAjedrez = new Chess();
            sala.tiempoRestante = 120;
            
            sala.jugadores.forEach(j => {
                j.color = (j.color === 'w' ? 'b' : 'w');
                io.to(j.id).emit('colorAsignado', j.color);
            });
            io.to(idSala).emit('revanchaAceptada');
            sincronizar(idSala);
        }
    });

    // Cancelación de revancha y limpieza
    socket.on('cancelarRevancha', (idSala) => {
        io.to(idSala).emit('revanchaCancelada');
        
        setTimeout(() => {
            JuegoServicio.eliminarSala(idSala);
            io.emit('listaSalas', JuegoServicio.obtenerSalasPublicas());
        }, 100);
    });
};