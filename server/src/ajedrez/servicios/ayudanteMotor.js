﻿// Lógica pura de las reglas del ajedrez
const { MOTIVOS_FIN } = require('../utilidades/constantes');

module.exports = {
    verificarFinDeJuego: (motor) => {
        if (motor.isCheckmate()) {
            return { ganador: motor.turn() === 'w' ? 'Negras' : 'Blancas', motivo: MOTIVOS_FIN.CHECKMATE };
        }
        if (motor.isDraw()) {
            let motivo = MOTIVOS_FIN.DRAW;
            if (motor.isStalemate()) motivo = MOTIVOS_FIN.STALEMATE;
            if (motor.isThreefoldRepetition()) motivo = MOTIVOS_FIN.THREEFOLD;
            if (motor.isInsufficientMaterial()) motivo = MOTIVOS_FIN.MATERIAL;
            return { ganador: null, motivo };
        }
        return null;
    }
};