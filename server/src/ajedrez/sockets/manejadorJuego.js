const JuegoServicio = require('../servicios/juegoServicio');

module.exports = (io, socket, sincronizar) => {
    socket.on('obtenerMovimientos', ({ idSala, casilla }) => {
        const sala = JuegoServicio.obtenerSala(idSala);
        if (!sala) return;
        const posicion = String.fromCharCode(97 + casilla.columna) + (8 - casilla.fila);
        const movimientosLegales = sala.motorAjedrez.moves({ square: posicion, verbose: true });
        socket.emit('movimientosPermitidos', movimientosLegales.map(m => ({
            columna: m.to.charCodeAt(0) - 97,
            fila: 8 - parseInt(m.to[1])
        })));
    });

    socket.on('moverPieza', ({ idSala, origen, destino }) => {
        const sala = JuegoServicio.obtenerSala(idSala);
        if (!sala || sala.jugadores.length < 2) return;
        const desde = String.fromCharCode(97 + origen.columna) + (8 - origen.fila);
        const hasta = String.fromCharCode(97 + destino.columna) + (8 - destino.fila);
        try {
            const mov = sala.motorAjedrez.move({ from: desde, to: hasta, promotion: 'q' });
            if (mov) {
                io.to(idSala).emit('movimientoRealizado', { san: mov.san });
                sala.tiempoRestante = 120;
                sincronizar(idSala);
                const fin = JuegoServicio.verificarFinDeJuego(sala.motorAjedrez);
                if (fin) io.to(idSala).emit('partidaFinalizada', fin);
            }
        } catch (e) { socket.emit('errorMovimiento', 'Inválido'); }
    });
};