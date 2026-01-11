import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, LogIn } from "lucide-react";

// Barra de navegación principal y gestión de sesión
export const BarraNavegacion = ({ modoInvitado, setModulo, nombreUsuario }) => {
  const { 
    user: usuarioAuth0, 
    isAuthenticated: estaAutenticado, 
    loginWithRedirect, 
    logout: cerrarSesionAuth0 
  } = useAuth0();

  // Determinación del nombre a mostrar (Auth0 o Invitado local)
  const nombreAMostrar = estaAutenticado 
    ? (usuarioAuth0?.name || "Usuario") 
    : (nombreUsuario || `Invitado-${localStorage.getItem("idInvitado") || ""}`);

  const finalizarSesion = () => {
    localStorage.removeItem("idInvitado");
    localStorage.removeItem("modoInvitado");
    
    if (estaAutenticado) {
      cerrarSesionAuth0({ logoutParams: { returnTo: window.location.origin } });
    } else {
      window.location.href = window.location.origin;
    }
  };

  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50">
      
      <div className="flex items-center gap-8">
        <button
          onClick={() => setModulo("menu")}
          className="text-sm font-black text-slate-800 tracking-tighter uppercase italic hover:scale-105 transition-transform"
        >
          Plataforma<span className="text-blue-600">.</span>io
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">

            {(estaAutenticado || modoInvitado) ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-800 uppercase leading-none">
                    {nombreAMostrar}
                  </p>
                  <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${estaAutenticado ? 'text-blue-500' : 'text-amber-500'}`}>
                    {estaAutenticado ? "Oficial" : "Sesión Invitado"}
                  </p>
                </div>
                
                <div className={`w-9 h-9 rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0 uppercase text-[10px] font-black text-white ${estaAutenticado ? 'bg-slate-200' : 'bg-amber-500'}`}>
                  {estaAutenticado && usuarioAuth0?.picture ? (
                    <img src={usuarioAuth0.picture} alt="Perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{nombreAMostrar.includes("-") ? nombreAMostrar.split("-")[1][0] : "I"}</span>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => loginWithRedirect()} 
                className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                <LogIn size={16} />
                <span>Entrar</span>
              </button>
            )}

            {(estaAutenticado || modoInvitado) && (
              <button 
                onClick={finalizarSesion} 
                className="p-2 text-slate-400 hover:text-red-500 transition-colors border-l border-slate-200 ml-2 pl-4"
                title="Salir"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};