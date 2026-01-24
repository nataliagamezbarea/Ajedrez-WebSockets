import React from 'react';

// Mapeo de piezas a recursos SVG
const GALERIA = {
  pw: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  rw: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  nw: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  bw: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  qw: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  kw: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  pb: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  rb: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  nb: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bb: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  qb: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  kb: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
};

// Componente de celda individual
const Casilla = ({ 
  fila, 
  columna, 
  datosPartida, 
  colorJugador, 
  casillaSeleccionada, 
  movimientosPosibles, 
  ultimoMovimiento,
  alHacerClick, 
  config 
}) => {
  const pieza = datosPartida.matrizTablero[fila][columna];
  const piezaId = pieza ? `${pieza.type}${pieza.color}` : null;
  const colorPiezaTraducido = pieza ? config.COLORES.NOMBRES[pieza.color] : null;

  const esMiTurno = datosPartida.turnoActual === colorJugador;
  const esMiPieza = pieza && colorPiezaTraducido === colorJugador;
  const sel = casillaSeleccionada?.columna === columna && casillaSeleccionada?.fila === fila;
  const esMovimientoLegal = movimientosPosibles.some(m => m.fila === fila && m.columna === columna);
  
  const letras = ['a','b','c','d','e','f','g','h'];
  const numeros = ['8','7','6','5','4','3','2','1'];
  const esUltimoMovimiento = ultimoMovimiento && ultimoMovimiento.to === `${letras[columna]}${numeros[fila]}`;
  const esCaptura = esUltimoMovimiento && ultimoMovimiento?.captura;
  const esReyEnJaque = piezaId?.startsWith('k') && colorPiezaTraducido === datosPartida.turnoActual && datosPartida.estaEnJaque;

  // Usamos style inline para garantizar que el color se aplique sobre cualquier clase de Tailwind
  const obtenerEstiloFondo = () => {
    const colorBase = (fila+columna)%2===0 ? '#eeeed2' : '#769656';
    if (sel) return { backgroundColor: '#facc15' }; 
    
    if (esUltimoMovimiento) {
      return { 
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.8) 25%, ' + colorBase + ' 100%)'
      };
    }
    return { backgroundColor: colorBase };
  };

  const obtenerCursor = () => {
    if (!datosPartida.partidaIniciada) return 'cursor-wait';
    if (!esMiTurno) return 'cursor-not-allowed';
    if (esMiPieza || esMovimientoLegal) return 'cursor-pointer';
    return 'cursor-not-allowed';
  };

  return (
    <div 
      onClick={() => esMiTurno && alHacerClick(columna, fila)}
      style={obtenerEstiloFondo()}
      className={`w-full h-full flex items-center justify-center relative transition-colors duration-200
        ${esMovimientoLegal && !pieza ? 'hover:bg-black/10' : ''}
        ${obtenerCursor()}
      `}
    >
      {esMovimientoLegal && (
        <div className={`absolute z-20 rounded-full bg-black/10 shadow-inner 
          ${pieza ? 'w-[85%] h-[85%] border-[4px] border-black/10' : 'w-3 h-3 md:w-5 md:h-5'}`} />
      )}
      {piezaId && GALERIA[piezaId] && (
        <img 
          src={GALERIA[piezaId]} 
          className={`w-[95%] h-[95%] z-10 select-none object-contain transition-transform 
            ${esMiTurno && esMiPieza ? 'hover:scale-110 active:scale-95 cursor-pointer' : ''}
            ${esReyEnJaque ? 'bg-red-500/50 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse' : ''}
          `} alt="" />
      )}
      {/* Animación de Captura (Explosión) */}
      {esCaptura && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-in zoom-in duration-300">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
            <span className="text-2xl drop-shadow-md">💥</span>
        </div>
      )}
    </div>
  );
};

// Componente principal del tablero
export const TableroAjedrez = ({ 
  datosPartida,
  colorJugador,
  casillaSeleccionada,
  alHacerClick,
  ultimoMovimiento,
  movimientosPosibles = [],
  config
}) => {

  if (!datosPartida || !datosPartida.matrizTablero || !config) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-200 rounded-xl font-bold text-slate-400 uppercase tracking-widest">
        Cargando Tablero...
      </div>
    );
  }

  const esBlancas = colorJugador === config.COLORES.NOMBRES[config.COLORES.BLANCO];
  const filas = esBlancas ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const columnas = esBlancas ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const letras = ['a','b','c','d','e','f','g','h'];
  const numeros = ['8','7','6','5','4','3','2','1'];

  return (
    <div className="relative w-full h-full aspect-square bg-slate-800 rounded-lg md:rounded-xl shadow-2xl border-[4px] md:border-[8px] border-slate-800 flex items-center justify-center">

      <div className="absolute -left-6 md:-left-8 top-0 bottom-0 flex flex-col justify-around z-20 pointer-events-none">
        {filas.map(f => (
          <span key={f} className="text-[11px] md:text-sm font-black text-slate-400 uppercase italic">{numeros[f]}</span>
        ))}
      </div>

      <div className="w-full h-full grid grid-cols-8 grid-rows-8 relative overflow-hidden rounded-sm">

        {!datosPartida.partidaIniciada && (
          <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase italic text-center px-4">
              Esperando Rival
            </h2>
          </div>
        )}

        {filas.map(fila =>
          columnas.map(columna => {
            return (
              <Casilla
                key={`${fila}-${columna}`}
                fila={fila}
                columna={columna}
                datosPartida={datosPartida}
                colorJugador={colorJugador}
                casillaSeleccionada={casillaSeleccionada}
                movimientosPosibles={movimientosPosibles}
                ultimoMovimiento={ultimoMovimiento}
                alHacerClick={alHacerClick}
                config={config}
              />
            );
          })
        )}
      </div>

      <div className="absolute -bottom-7 md:-bottom-9 left-0 right-0 flex justify-around z-20 pointer-events-none">
        {columnas.map(c => (
          <span key={c} className="text-[11px] md:text-sm font-black text-slate-400 uppercase italic">{letras[c]}</span>
        ))}
      </div>
    </div>
  );
};