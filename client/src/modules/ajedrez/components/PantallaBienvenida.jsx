import { BotonLogin } from "./BotonLogin";
import { UserCircle } from "lucide-react";

/**
 * PantallaBienvenida - plataforma.io
 * Punto de entrada principal para la gestión de sesiones.
 */
export const PantallaBienvenida = ({ setModoInvitado }) => (
  <div className="flex flex-col items-center w-full gap-8 animate-in fade-in zoom-in duration-500">
    
    {/* Grupo de acciones de acceso */}
    <div className="flex flex-col w-full gap-3">
      
      {/* ACCESO OFICIAL: Inicia el flujo de Auth0 (Google/Email) */}
      <BotonLogin />

      {/** * ACCESO ANÓNIMO: 
       * Al ejecutar setModoInvitado(true), el hook useSesionUsuario genera 
       * inmediatamente un ID aleatorio (ej: Invitado-8234) y actualiza la Navbar.
       */}
      <button 
        onClick={() => setModoInvitado(true)}
        className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest active:scale-95 border border-slate-200 flex items-center justify-center gap-2"
      >
        <UserCircle size={16} />
        Continuar como invitado
      </button>
      
    </div>
  </div>
);