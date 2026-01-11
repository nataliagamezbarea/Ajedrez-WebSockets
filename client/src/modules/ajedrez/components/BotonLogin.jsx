import { useAuth0 } from "@auth0/auth0-react";
import { LogIn } from "lucide-react";

// Botón de inicio de sesión con Auth0
export const BotonLogin = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button 
      onClick={() => loginWithRedirect()} 
      className="group w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-blue-700 active:scale-[0.98] transition-all uppercase shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
    >
      <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
      
      <span className="text-[11px] font-black tracking-[0.2em]">
        Iniciar sesión en plataforma.io
      </span>
    </button>
  );
};