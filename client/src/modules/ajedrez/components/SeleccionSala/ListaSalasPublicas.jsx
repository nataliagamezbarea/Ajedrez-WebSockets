import { Radio, Users, ChevronRight, Ban } from "lucide-react";

export const ListaSalasPublicas = ({ salas, alUnirse }) => (
  <div className="pt-6 border-t border-slate-100 text-left animate-in fade-in duration-300">

    {/* Encabezado */}
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Radio size={12} className="text-blue-500 animate-pulse" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Salas en vivo
        </h3>
      </div>
      <span className="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
        Live
      </span>
    </div>

    {/* Lista de salas */}
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar min-h-0">

      {/* No hay salas */}
      {(!salas || salas.length === 0) ? (
        <div className="py-8 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase italic tracking-widest">
            No hay salas disponibles
          </p>
        </div>
      ) : (

        // Salas disponibles
        salas.map((sala) => {
          const estaOcupada = sala.estaOcupada;
          return (
            <div 
              key={sala.id} 
              className="flex items-center justify-between p-4 bg-white rounded-[1.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">

                {/* Icono de estado */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors 
                  ${estaOcupada ? 'bg-slate-50 text-slate-300' : 'bg-blue-50 text-blue-600'}`}>
                  {estaOcupada ? <Ban size={18} /> : <Users size={18} />}
                </div>

                {/* Información de sala */}
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                    {sala.id}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1
                    ${estaOcupada ? 'text-red-400' : 'text-slate-400'}`}>
                    {estaOcupada ? 'Ocupada' : `${sala.jugadores}/2 Jugadores`}
                  </span>
                </div>
              </div>

              {/* Botón de unirse */}
              <button 
                disabled={estaOcupada} 
                aria-disabled={estaOcupada}
                onClick={() => alUnirse(sala.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-xl border transition-all flex items-center gap-2
                  ${estaOcupada
                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600 shadow-md active:scale-95'
                  }`}
              >
                {estaOcupada 
                  ? 'Full' 
                  : <>
                      Unirse <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                }
              </button>

            </div>
          );
        })
      )}
    </div>
  </div>
);
