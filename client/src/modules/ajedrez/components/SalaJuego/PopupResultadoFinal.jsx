import { 
  Trophy, Handshake, Skull, RefreshCcw, Hourglass, 
  CheckCircle2, XCircle, Home, AlertTriangle, User 
} from "lucide-react";
import { ModalBase } from "./ModalBase";

// Modal que se muestra al finalizar una partida (Victoria, Derrota, Tablas)
export const PopupResultadoFinal = ({
  resultado: resultadoProp,
  estadoRevancha,
  timerRevancha,
  alSolicitar,
  alAceptar,
  alCancelar,
  alRechazar
}) => {
  if (!resultadoProp) return null;

  // Detectamos si es abandono antes de generar el título por defecto
  const esAbandonoDetectado = 
    resultadoProp.motivo?.toLowerCase().includes("abandon") || 
    resultadoProp.motivo?.toLowerCase().includes("desconectado");

  // Adaptador: Si el servidor envía solo { ganador, motivo }, generamos el formato de UI aquí
  const resultado = {
    ...resultadoProp,
    titulo: resultadoProp.titulo || (esAbandonoDetectado ? "VICTORIA" : (resultadoProp.ganador ? `LAS ${resultadoProp.ganador.toUpperCase()} HAN GANADO` : "TABLAS")),
    color: resultadoProp.color || ((resultadoProp.ganador || esAbandonoDetectado) ? "text-green-600" : "text-blue-600")
  };

  const esVictoria = resultado.titulo.includes("GANADO") || resultado.titulo === "VICTORIA";
  const esTablas = resultado.titulo.includes("TABLAS");
  
  const esAbandono =
    resultado.motivo?.toLowerCase().includes("abandon") ||
    resultado.motivo?.toLowerCase().includes("desconectado");

  const manejarNoRevancha = () => {
    if (alRechazar) alRechazar();
    if (alCancelar) alCancelar();
  };

  return (
    <ModalBase abierto={!!resultado} zIndex="z-[10000]">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce
        ${esVictoria ? "bg-green-100 text-green-600" : esTablas ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
        {esVictoria ? <Trophy size={40} /> : esTablas ? <Handshake size={40} /> : <Skull size={40} />}
      </div>

      <h3 className={`text-4xl font-black italic uppercase mb-2 tracking-tighter leading-none ${resultado.color}`}>
        {resultado.titulo}
      </h3>

      <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase mb-8">
        {resultado.motivo}
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {!estadoRevancha && !esAbandono && (
          <button
            onClick={alSolicitar}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg uppercase text-[10px] tracking-widest active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} /> Solicitar Revancha
          </button>
        )}

        {esAbandono && (
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100">
            <AlertTriangle size={14} /> El rival ha dejado la sala
          </div>
        )}

        {estadoRevancha === "enviado" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={manejarNoRevancha}
              className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl animate-pulse uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2"
            >
              <Hourglass size={14} /> Esperando rival ({timerRevancha}s)
            </button>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
              Pulsa para cancelar y salir ambos
            </p>
          </div>
        )}

        {estadoRevancha === "recibido" && (
          <div className="flex flex-col gap-2 animate-in zoom-in duration-300">
            <div className="flex gap-2">
              <button
                onClick={alAceptar}
                className="flex-[2] bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} /> Aceptar ({timerRevancha}s)
              </button>
              <button
                onClick={manejarNoRevancha}
                className="flex-1 bg-red-100 text-red-600 font-black py-4 rounded-2xl hover:bg-red-200 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <XCircle size={14} /> No
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Resultado Final
        </p>
        <p className="text-lg font-black text-slate-800 uppercase leading-tight flex items-center justify-center gap-2">
          {resultado.ganador ? (
            <>
              <User size={16} className="text-blue-600" />
              Ganador: {resultado.ganador}
            </>
          ) : (
            "Tablas Reglamentarias"
          )}
        </p>
      </div>

      <button
        onClick={manejarNoRevancha}
        className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl uppercase text-[10px] tracking-[0.2em] active:scale-95 flex items-center justify-center gap-2"
      >
        <Home size={14} /> Volver al menú principal
      </button>
    </ModalBase>
  );
};