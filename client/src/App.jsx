import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ModuloAjedrez from "./modules/ajedrez/ModuloAjedrez";
import ModuloSakila from "./modules/sakila/ModuloSakila";
import { BarraNavegacion } from "./components/BarraNavegacion";
import MenuInicio from "./components/MenuInicio";
import { useSesionUsuario } from "./hooks/useSesionUsuario";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const VISTAS = {
  MENU: "menu",
  AJEDREZ: "ajedrez",
  SAKILA: "sakila",
};

// Configuración por defecto para carga instantánea (evita esperar al servidor)
const DEFAULT_CONFIG = {
  COLORES: {
    BLANCO: 'w',
    NEGRO: 'b',
    NOMBRES: { w: 'blancas', b: 'negras' }
  }
};

function App() {
  const { loginWithRedirect, isAuthenticated: estaAutenticadoConGoogle } = useAuth0();
  
  /**
   * HOOK DE SESIÓN GLOBAL:
   * 'nombreUsuario' ya contiene la lógica para devolver "Invitado-XXXX" o el nombre de Google.
   * 'setModoInvitado' es la función que genera el ID aleatorio al hacer click.
   */
  const { 
    nombreUsuario, 
    isLoading, 
    modoInvitado, 
    setModoInvitado 
  } = useSesionUsuario();
  
  const [modulo, setModulo] = useState(VISTAS.MENU);
  const [configAjedrez, setConfigAjedrez] = useState(DEFAULT_CONFIG);

  // Carga de configuración inicial
  useEffect(() => {
    fetch(`${API_URL}/api/ajedrez/config`)
      .then((res) => res.json())
      .then((datos) => setConfigAjedrez(datos))
      .catch((err) => console.error("Esperando al servidor...", err));
  }, []);

  // Sistema Keep-Alive SOLO en producción (Vercel):
  // despierta el backend de Render al visitar la web y lo mantiene activo mientras se usa.
  useEffect(() => {
    // En desarrollo (vite dev) no es necesario mantener despierto el servidor local
    if (!import.meta.env.PROD) return;

    const despertarServidor = () => {
      fetch(`${API_URL}/api/ajedrez/config`).catch(() => {});
    };

    // 1) Al abrir la web: despertamos el backend (Render Free se duerme a los 15 min)
    despertarServidor();

    // 2) Ping periódico cada 9 min (por debajo del timeout de 15 min de Render Free)
    const intervalo = setInterval(despertarServidor, 9 * 60 * 1000);

    // 3) Si el usuario vuelve a la pestaña tras un rato, lo despertamos al momento
    const alVolverALaPestanya = () => {
      if (document.visibilityState === "visible") despertarServidor();
    };
    document.addEventListener("visibilitychange", alVolverALaPestanya);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolverALaPestanya);
    };
  }, []);

  const manejarAccesoSakila = () => {
    if (!estaAutenticadoConGoogle) {
      loginWithRedirect();
    } else {
      setModulo(VISTAS.SAKILA);
    }
  };

  // Solo bloqueamos la UI si Auth0 está cargando la sesión del usuario
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Aviso visual si el servidor se está despertando */}
      {!configAjedrez && (
        <div className="bg-blue-600 text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest animate-pulse">
          Cargando...
        </div>
      )}

      {/* NAVBAR: Recibe el 'nombreUsuario' procesado (ej: Invitado-1234) */}
      <BarraNavegacion 
        modoInvitado={modoInvitado} 
        setModulo={setModulo} 
        nombreUsuario={nombreUsuario} 
      />

      <main className="flex-1 w-full pt-20">
        
        {modulo === VISTAS.MENU && (
          <MenuInicio 
            setModulo={setModulo} 
            manejarAccesoSakila={manejarAccesoSakila}
            estaAutenticadoReal={estaAutenticadoConGoogle}
          />
        )}

        <div className="w-full h-full">
          {modulo === VISTAS.AJEDREZ && (
            // Renderizado condicional: Esperamos a que el servidor responda antes de cargar el juego
            configAjedrez ? (
              <ModuloAjedrez 
                usuario={nombreUsuario} // Enviará el string final con número
                config={configAjedrez}
                modoInvitado={modoInvitado}
                /**
                 * IMPORTANTE: Pasamos 'setModoInvitado' del hook global.
                 * Al pulsar el botón en la PantallaBienvenida, se activará 
                 * esta función que genera el ID y actualiza todo el sistema.
                 */
                setModoInvitado={setModoInvitado} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold uppercase tracking-widest">Cargando...</p>
              </div>
            )
          )}
          
          {modulo === VISTAS.SAKILA && estaAutenticadoConGoogle && (
            <div className="p-8 animate-in fade-in duration-500">
               <ModuloSakila />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;