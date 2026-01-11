﻿const { TIEMPO_POR_TURNO, MOTIVOS_FIN } = require('../utilidades/constantes');
const store = require('./salaStore');
const ayudanteMotor = require('./ayudanteMotor');
const { Chess } = require('chess.js');

const JuegoServicio = {
    obtenerSalasPublicas: () => {
        const salas = store.getSalas();
        return Object.keys(salas)
            .filter(id => !salas[id].esPrivada)
            .map(id => ({ 
                id, 
                jugadores: salas[id].jugadores.length,
                estaOcupada: salas[id].jugadores.length >= 2 
            }));
    },

    crearSala: (idSala, esPrivada) => {
        let sala = store.getSala(idSala);
        if (!sala) {
            sala = {
                esPrivada,
                jugadores: [],
                motorAjedrez: new Chess(),
                tiempoRestante: TIEMPO_POR_TURNO,
                votosRevancha: new Set() 
            };
            store.setSala(idSala, sala);
        }
        return sala;
    },

    obtenerSala: (idSala) => store.getSala(idSala),

    eliminarSala: (idSala) => store.deleteSala(idSala),

    reiniciarPartida: (idSala) => {
        const sala = store.getSala(idSala);
        if (sala) {
            sala.motorAjedrez = new Chess();
            sala.tiempoRestante = TIEMPO_POR_TURNO;
            sala.votosRevancha.clear();
            return sala;
        }
        return null;
    },

    verificarFinDeJuego: ayudanteMotor.verificarFinDeJuego,

    // Gestión de desconexiones y abandonos
    manejarAbandono: (socketId) => {
        const salas = store.getSalas();
        for (const idSala in salas) {
            const sala = salas[idSala];
            const index = sala.jugadores.findIndex(j => j.id === socketId);
            
            if (index !== -1) {
                const haHabidoMovimientos = sala.motorAjedrez.history().length > 0;

                if (haHabidoMovimientos) {
                    // Partida en curso: eliminar sala
                    store.deleteSala(idSala);
                    return { idSala, borrar: true, motivo: "Partida abandonada en curso" };
                } else {
                    // Partida no iniciada: eliminar jugador
                    sala.jugadores.splice(index, 1);
                    
                    if (sala.jugadores.length === 0) {
                        store.deleteSala(idSala);
                        return { idSala, borrar: true };
                    }

                    // Si queda alguien, reiniciamos para el que espera
                    sala.motorAjedrez = new Chess();
                    sala.tiempoRestante = TIEMPO_POR_TURNO;
                    sala.votosRevancha.clear();
                    return { 
                        idSala, 
                        quedaAlguien: true
                    };
                }
            }
        }
    },

    actualizarSalasPorTick: (callbackSincronizar, callbackFinalizar) => {
        const salas = store.getSalas();
        for (const idSala in salas) {
            const sala = salas[idSala];
            if (sala.jugadores.length === 2 && !sala.motorAjedrez.isGameOver()) {
                sala.tiempoRestante--;
                if (sala.tiempoRestante <= 0) {
                    const ganador = sala.motorAjedrez.turn() === 'w' ? 'Negras' : 'Blancas';
                    callbackFinalizar(idSala, { ganador, motivo: MOTIVOS_FIN.TIMEOUT });
                } else {
                    callbackSincronizar(idSala, sala.tiempoRestante);
                }
            }
        }
    }
};

module.exports = JuegoServicio;