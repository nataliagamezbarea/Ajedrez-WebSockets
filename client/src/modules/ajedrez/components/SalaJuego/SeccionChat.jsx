import { MessageSquare, Send, Radio } from "lucide-react";

export const SeccionChat = ({ 
  listaMensajes, 
  usuario,
  mensajeChat, 
  setMensajeChat, 
  alEnviar, 
  chatFinalRef 
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 self-stretch min-h-0">

      <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-blue-500" />
          <h3 className="text-white text-[10px] font-black uppercase tracking-widest">
            Chat en vivo • plataforma.io
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700/50">
          <Radio size={10} className="text-green-500 animate-pulse" />
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-900/30 min-h-0">
        {listaMensajes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-tighter leading-relaxed">
              No hay mensajes aún.<br />¡Saluda a tu oponente!
            </p>
          </div>
        ) : (
          listaMensajes.map((m, i) => {
            const esMio = m.idEmisor === usuario || m.usuario === usuario;

            return (
              <div 
                key={i} 
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 px-1">
                  {esMio ? 'Tú' : (m.nombre || 'Rival')}
                </span>
                
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed 
                  ${esMio 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}
                >
                  {m.texto}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatFinalRef} />
      </div>

      <div className="p-3 md:p-4 bg-slate-950 shrink-0 border-t border-slate-800">
        <form 
          onSubmit={alEnviar} 
          className="flex items-center gap-2 bg-slate-800 rounded-full p-1 pl-4 focus-within:ring-2 ring-blue-500 transition-all shadow-inner"
        >
          <input 
            value={mensajeChat} 
            onChange={e => setMensajeChat(e.target.value)} 
            placeholder="Escribe un mensaje..." 
            className="flex-1 bg-transparent border-none text-white text-sm outline-none py-2 placeholder:text-slate-500"
          />
          <button 
            type="submit" 
            disabled={!mensajeChat.trim()}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white transition-all active:scale-90 hover:bg-blue-500 disabled:opacity-50 shadow-lg"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};