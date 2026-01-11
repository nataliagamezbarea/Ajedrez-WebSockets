import { useEffect, useRef } from "react";
import { ScrollText } from "lucide-react";

/**
 * PanelMovimientos
 * ----------------
 * Componente para mostrar el historial de movimientos de una partida de ajedrez.
 * - Agrupa los movimientos de blancas y negras en filas numeradas.
 * - Auto-scroll al último movimiento.
 */
export const PanelMovimientos = ({ historial }) => {
    const referenciaScroll = useRef(null);

    // Agrupa los movimientos de 2 en 2: blancas y negras
    const movimientosAgrupados = [];
    for (let i = 0; i < historial.length; i += 2) {
        movimientosAgrupados.push({
            numero: Math.floor(i / 2) + 1, // Número de jugada
            blancas: historial[i],          // Movimiento de blancas
            negras: historial[i + 1] || "---", // Movimiento de negras o placeholder si no existe
        });
    }

    // Auto-scroll al último movimiento cuando historial cambie
    useEffect(() => {
        if (referenciaScroll.current) {
            referenciaScroll.current.scrollTop = referenciaScroll.current.scrollHeight;
        }
    }, [historial]);

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden self-stretch">
            
            {/* Cabecera del panel */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 shrink-0 flex items-center justify-center gap-2">
                <ScrollText size={14} className="text-blue-500" />
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Historial</h3>
            </div>
            
            {/* Encabezados de columna: número, blancas y negras */}
            <div className="grid grid-cols-[40px_1fr_1fr] px-4 py-2 bg-slate-800/30 border-b border-slate-800 shrink-0 text-center">
                <span className="text-[9px] font-black text-slate-500">#</span>
                <span className="text-[9px] font-black text-slate-300 uppercase">B</span>
                <span className="text-[9px] font-black text-slate-300 uppercase">N</span>
            </div>

            {/* Lista de movimientos */}
            <div ref={referenciaScroll} className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1 min-h-0 scroll-smooth">
                {movimientosAgrupados.map((mov, idx) => (
                    <div key={idx} className="grid grid-cols-[40px_1fr_1fr] items-center py-1 shrink-0 animate-in fade-in slide-in-from-bottom-1">
                        
                        {/* Número de jugada */}
                        <span className="text-[10px] font-mono text-slate-600 text-center">{mov.numero}.</span>
                        
                        {/* Movimiento de blancas */}
                        <div className="bg-white/5 mx-1 py-1.5 rounded-md text-xs font-bold text-white text-center border border-white/5">
                            {mov.blancas}
                        </div>
                        
                        {/* Movimiento de negras */}
                        <div className={`mx-1 py-1.5 rounded-md text-xs font-bold text-center border ${
                            mov.negras !== "---" 
                                ? 'bg-blue-600/20 text-blue-400 border-blue-600/20' 
                                : 'text-slate-600 border-transparent'
                        }`}>
                            {mov.negras}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
