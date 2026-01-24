import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';

// Barra superior con información de la partida y controles
export const CabeceraJuego = ({ 
  idSala, 
  partidaIniciada, 
  copiado, 
  alCopiar, 
  alAbandonar, 
  alRendirse, 
  alPedirTablas, 
  alPedirRetroceso,
  tiempo, 
  turnoActual, 
  colorJugador, 
  esperandoTablas,
  esperandoRetroceso,
  esperandoPausa,
  pausada,
  alPausar
}) => {

  const esMiTurno = useMemo(
    () => turnoActual === colorJugador,
    [turnoActual, colorJugador]
  );

  const estiloReloj = useMemo(() => {
    const esCritico =
      tiempo === '0:15' ||
      (tiempo.startsWith('0:0') && tiempo !== '0:00');

    return esCritico
      ? 'text-red-500 animate-pulse'
      : 'text-slate-800';
  }, [tiempo]);

  return (
    <div className="
      flex flex-col sm:flex-row justify-between items-center w-full
      bg-white/70 backdrop-blur-md p-3 sm:p-4 rounded-[2rem] border border-slate-200
      relative z-[40] shadow-sm
      gap-4 sm:gap-0
    ">
      
      {/* Izquierda */}
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[8px] sm:text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">
            plataforma.io
          </span>

          <button 
            onClick={alAbandonar} 
            className="text-[8px] sm:text-[9px] font-bold text-red-400 hover:text-red-600 uppercase transition-colors"
          >
            • Abandonar
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 italic uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">
            {idSala || "----"}
          </h2>

          <button 
            onClick={alCopiar} 
            className={`px-2 py-0.5 rounded-md text-[7px] sm:text-[8px] font-black uppercase transition-all border whitespace-nowrap ${
              copiado 
                ? "bg-green-50 border-green-200 text-green-600" 
                : "bg-slate-100 border-slate-200 text-slate-400 hover:text-blue-600 active:scale-90"
            }`}
          >
            {copiado ? "¡Copiado!" : "Copiar ID"}
          </button>
        </div>
      </div>

      {/* Centro */}
      <div className="
        relative sm:absolute sm:left-1/2 sm:-translate-x-1/2
        flex flex-col items-center
        w-full sm:w-auto
        z-10
      ">

        {partidaIniciada ? (
          <>
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter leading-none transition-colors duration-300 ${estiloReloj} truncate`}
            >
              {tiempo}
            </div>

            <div
              className={`text-[8px] sm:text-[9px] font-black px-3 py-1 rounded-full uppercase mt-2 transition-all duration-500 transform max-w-[120px] text-center ${
                esMiTurno
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-slate-200 text-slate-500 opacity-60 scale-95'
              }`}
            >
              {esMiTurno ? "Tu turno" : "Turno rival"}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Sincronizando...
            </div>
          </div>
        )}
      </div>

      {/* Derecha */}
      <div className="flex gap-2 min-w-[120px] justify-end w-full sm:w-auto flex-wrap">

        {!partidaIniciada ? (
          <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-2xl text-[8px] sm:text-[9px] font-black uppercase border border-slate-100 tracking-widest animate-pulse whitespace-nowrap text-center w-full sm:w-auto">
            Buscando Rival
          </div>

        ) : esperandoTablas ? (
          <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl text-[8px] sm:text-[9px] font-black text-blue-600 uppercase animate-in fade-in zoom-in whitespace-nowrap text-center w-full sm:w-auto">
            Propuesta enviada
          </div>

        ) : esperandoRetroceso ? (
          <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl text-[8px] sm:text-[9px] font-black text-orange-600 uppercase animate-in fade-in zoom-in whitespace-nowrap text-center w-full sm:w-auto">
            Solicitando retroceso...
          </div>

        ) : esperandoPausa ? (
          <div className="px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-2xl text-[8px] sm:text-[9px] font-black text-yellow-600 uppercase animate-in fade-in zoom-in whitespace-nowrap text-center w-full sm:w-auto">
            Solicitando...
          </div>

        ) : (
          <div className="flex gap-2 animate-in slide-in-from-right-4 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
            <button 
              onClick={alPedirRetroceso} 
              className="px-3 py-2.5 bg-white text-slate-500 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              title="Solicitar retroceso"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={alPedirTablas} 
              className="px-4 sm:px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase hover:bg-slate-50 transition-all active:scale-95 shadow-sm whitespace-nowrap"
            >
              Tablas
            </button>
            <button 
              onClick={alPausar}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase transition-all active:scale-95 shadow-sm whitespace-nowrap border ${
                pausada 
                  ? 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600 animate-pulse' 
                  : 'bg-slate-700 text-white border-slate-800 hover:bg-slate-800'
              }`}
            >
              {pausada ? "Reanudar" : "Pausar"}
            </button>
            <button 
              onClick={alRendirse} 
              className="px-4 sm:px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[9px] sm:text-[10px] font-black uppercase hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-200 whitespace-nowrap"
            >
              Rendirse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
