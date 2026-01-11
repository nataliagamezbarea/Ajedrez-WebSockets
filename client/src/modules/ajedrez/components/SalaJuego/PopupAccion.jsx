import { Zap, CheckCircle2, ChevronLeft } from "lucide-react";
import { ModalBase } from "./ModalBase";

// Modal genérico para confirmaciones (Rendirse, Tablas, Abandonar)
export const PopupAccion = ({
  abierto,
  titulo,
  mensaje,
  colorBtn,
  textoBtn,
  alConfirmar,
  alCancelar
}) => (
  <ModalBase abierto={abierto}>
    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Zap size={24} />
    </div>

    <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2">{titulo}</h3>

    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 leading-relaxed px-4">{mensaje}</p>

    <div className="flex flex-col gap-3">
      <button
        onClick={alConfirmar}
        className={`w-full ${colorBtn} text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase text-[10px] active:scale-95 flex items-center justify-center gap-2`}
      >
        <CheckCircle2 size={14} /> {textoBtn}
      </button>
      <button
        onClick={alCancelar}
        className="w-full bg-slate-100 text-slate-400 font-black py-4 rounded-xl hover:bg-slate-200 transition-all uppercase text-[10px] flex items-center justify-center gap-2"
      >
        <ChevronLeft size={14} /> Cancelar
      </button>
    </div>
  </ModalBase>
);