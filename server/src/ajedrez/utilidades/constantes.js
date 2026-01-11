// backend/src/ajedrez/utilidades/constantes.js
module.exports = {
    TIEMPO_POR_TURNO: 120, 
    COLORES: { 
        BLANCO: 'w', 
        NEGRO: 'b',
        NOMBRES: {
            w: 'blancas',
            b: 'negras'
        }
    },
    MOTIVOS_FIN: {
        CHECKMATE: 'Jaque Mate',
        DRAW: 'Tablas',
        STALEMATE: 'Rey Ahogado',
        THREEFOLD: 'Triple Repetición',
        MATERIAL: 'Material Insuficiente',
        RESIGN: 'Rendición',
        TIMEOUT: 'Tiempo agotado',
        ABANDON: 'Abandono'
    }
};