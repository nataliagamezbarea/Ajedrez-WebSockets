// Este archivo solo guarda los datos, es nuestra "Base de Datos" en memoria
let salasDeJuego = {}; 

module.exports = {
    getSalas: () => salasDeJuego,
    getSala: (id) => salasDeJuego[id],
    setSala: (id, data) => { salasDeJuego[id] = data; },
    deleteSala: (id) => { delete salasDeJuego[id]; }
};
