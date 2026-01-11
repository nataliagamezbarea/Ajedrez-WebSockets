import { useAuth0 } from "@auth0/auth0-react";
import { useGestionSalas } from "./hooks/useGestionSalas";
import { useConectorTiempoReal } from "./hooks/useConectorTiempoReal"; 
import { PantallaBienvenida } from "./components/PantallaBienvenida";
import { SeleccionSala } from "./components/SeleccionSala/SeleccionSala";
import { SalaJuego } from "./components/SalaJuego/SalaJuego";

// Componente principal del módulo de Ajedrez
const ModuloAjedrez = ({ usuario, config, modoInvitado, setModoInvitado }) => {
  
  const { isAuthenticated: estaAutenticado, isLoading, user } = useAuth0();
  const { salasPublicas, conectado } = useConectorTiempoReal();

  const { 
    idSala, 
    unido, 
    entrarASala, 
    abandonarPartida, 
    esPrivada, 
    setEsPrivada, 
    setIdSala
  } = useGestionSalas(user, salasPublicas);

  if (isLoading || !conectado) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center w-full">
      <main className={`flex flex-col items-center justify-center w-full transition-all duration-500 ${unido ? 'pt-10 pb-10' : 'mt-32'}`}>
        
        {!unido ? (
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-center border border-slate-100">
            <header className="mb-10 text-4xl font-black text-slate-800 uppercase italic">
              Plataforma<span className="text-blue-600">.</span>io
            </header>
            
            {!estaAutenticado && !modoInvitado ? (
              <PantallaBienvenida setModoInvitado={setModoInvitado} />
            ) : (
              <SeleccionSala 
                idSala={idSala} 
                setIdSala={setIdSala} 
                entrarASala={entrarASala} 
                salasPublicas={salasPublicas} 
                esPrivada={esPrivada} 
                setEsPrivada={setEsPrivada} 
              />
            )}
          </div>
        ) : (
          <SalaJuego 
            idSala={idSala} 
            usuario={usuario} 
            abandonarPartida={abandonarPartida} 
            config={config} 
          />
        )}
      </main>
    </div>
  );
};

export default ModuloAjedrez;