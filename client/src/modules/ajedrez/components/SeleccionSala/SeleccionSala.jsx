import { useState } from "react";
import { Hash, Key, ChevronRight, Zap, Users, Lock, AlertCircle, Loader2 } from "lucide-react";
import { SelectorModo } from "./SelectorModo";
import { ListaSalasPublicas } from "./ListaSalasPublicas";

/**
 * SeleccionSala - Componente de gestión de acceso a partidas.
 * Permite alternar entre el modo público (partidas rápidas o personalizadas) 
 * y el modo privado (generación y unión mediante códigos) en plataforma.io.
 */
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const SeleccionSala = ({
  idSala,
  setIdSala,
  entrarASala,
  salasPublicas,
  esPrivada,
  setEsPrivada,
}) => {
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState(null);

  const validarYUnirse = async () => {
    if (!idSala.trim()) return;
    
    setValidando(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/ajedrez/salas/${idSala}`);
      if (res.ok) {
        const data = await res.json();
        if (data.existe) {
          entrarASala();
        } else {
          setError("La sala no existe o ha finalizado.");
        }
      } else {
        setError("No se pudo verificar la sala.");
      }
    } catch (e) {
      setError("Error de conexión con el servidor.");
    } finally {
      setValidando(false);
    }
  };

  return (
  <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">

    {/* SECCIÓN 1: Selector de Categoría (Público / Privado)
        Gestiona el estado global de la vista y limpia el input al cambiar */}
    <SelectorModo esPrivada={esPrivada} setEsPrivada={setEsPrivada} limpiarInput={setIdSala} />

    {/* SECCIÓN 2A: Interfaz de Modo Público
        Renderiza las opciones para entrar a salas visibles para todos los usuarios */}
    {!esPrivada ? (
      <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
        
        {/* Input de identificación: Opcional para nombres de sala semánticos */}
        <div className="relative">
          <Hash size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="NOMBRE DE SALA (OPCIONAL)"
            className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-center font-black uppercase transition-all placeholder:text-slate-300 text-sm tracking-tight"
            value={idSala}
            onChange={(e) => setIdSala(e.target.value)}
          />
        </div>

        {/* Botón de acción dual: 
            - Si hay texto: Crea una sala personalizada.
            - Si está vacío: Lanza una partida rápida aleatoria en plataforma.io */}
        <button
          onClick={() => entrarASala()}
          className={`group w-full font-black py-5 rounded-[1.5rem] transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl active:scale-95
            ${idSala.trim() ? "bg-slate-900 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {idSala.trim() ? <Users size={14} /> : <Zap size={14} />}
          {idSala.trim() ? "Crear Sala Personalizada" : "Lanzar Partida Rápida"}
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    ) : (
      /* SECCIÓN 2B: Interfaz de Modo Privado
         Enfocada en la seguridad y el acceso restringido mediante claves */
      <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
        
        {/* Generación de ID: Llama a entrarASala sin ID previo para que el backend genere uno privado */}
        <button
          onClick={() => {
            const codigoRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
            setIdSala(codigoRandom);
            entrarASala(codigoRandom);
          }}
          className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-100 text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95"
        >
          <Lock size={14} /> Generar Código Privado
        </button>

        {/* Separador Visual Semántico */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">O Únete a una</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Input de Unión: Requiere el código exacto proporcionado por otro jugador */}
        <div className="relative">
          <Key size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="PEGA EL CÓDIGO PRIVADO"
            className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-center font-black uppercase transition-all placeholder:text-slate-300 text-sm tracking-tight"
            value={idSala}
            onChange={(e) => setIdSala(e.target.value)}
          />
        </div>

        {/* Mensaje de Error de Validación */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-wider bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Botón de validación: Deshabilitado hasta que se detecte contenido en el input */}
        <button
          onClick={validarYUnirse}
          disabled={!idSala.trim() || validando}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:bg-black transition-all disabled:opacity-20 disabled:grayscale uppercase shadow-xl text-[10px] tracking-[0.2em] active:scale-95"
        >
          {validando ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Unirse por Código"}
        </button>
      </div>
    )}

    {/* SECCIÓN 3: Explorador de salas (Solo visible en modo público)
        Muestra la actividad actual del servidor en plataforma.io */}
    {!esPrivada && <ListaSalasPublicas salas={salasPublicas} alUnirse={entrarASala} />}
  </div>
  );
};