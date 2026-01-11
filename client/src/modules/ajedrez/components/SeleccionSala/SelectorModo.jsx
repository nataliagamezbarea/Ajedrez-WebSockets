import { Globe, Lock } from "lucide-react";

export const SelectorModo = ({ esPrivada, setEsPrivada, limpiarInput }) => (
  <div className="flex items-center justify-center gap-4 mb-2 p-1 bg-slate-100 rounded-[1.5rem] w-fit mx-auto">
    
    {/* Botón Público */}
    <button
      onClick={() => { setEsPrivada(false); limpiarInput(""); }}
      className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black flex items-center gap-2 uppercase tracking-widest transition-all duration-200
        ${!esPrivada 
          ? 'bg-white text-blue-600 shadow-sm cursor-default' 
          : 'bg-transparent text-slate-400 hover:text-slate-600 cursor-pointer hover:bg-white/50'}
      `}
    >
      <Globe size={14} />
      Pública
    </button>
    
    {/* Botón Privado */}
    <button
      onClick={() => { setEsPrivada(true); limpiarInput(""); }}
      className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black flex items-center gap-2 uppercase tracking-widest transition-all duration-200
        ${esPrivada 
          ? 'bg-white text-blue-600 shadow-sm cursor-default' 
          : 'bg-transparent text-slate-400 hover:text-slate-600 cursor-pointer hover:bg-white/50'}
      `}
    >
      <Lock size={14} />
      Privada
    </button>
  </div>
);
