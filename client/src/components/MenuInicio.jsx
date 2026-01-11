import { Swords, Database } from "lucide-react";
import AccesoModulo from "./AccesoModulo";
import PropTypes from 'prop-types';

const MenuInicio = ({ 
    setModulo,
    manejarAccesoSakila,
    estaAutenticadoReal
}) => (
  <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
    <div className="w-full max-w-5xl flex flex-col gap-12 animate-in fade-in zoom-in duration-700">
      
      <header className="flex flex-col gap-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-800 uppercase tracking-tighter leading-none">
          Selecciona un <br />
          <span className="text-blue-600">Módulo</span>
        </h1>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">
          Plataforma Integrada • plataforma.io • 2026
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-10">
        
        <AccesoModulo 
          titulo="Jugar Ajedrez" 
          icono={Swords} 
          alHacerClick={() => setModulo("ajedrez")} 
          requiereAutenticacion={false}
        />
        
        <AccesoModulo 
          titulo="Gestión Sakila" 
          icono={Database} 
          alHacerClick={manejarAccesoSakila}
          requiereAutenticacion={true} 
          autenticacionActiva={estaAutenticadoReal} 
        />
      </div>
    </div>
  </div>
);

MenuInicio.propTypes = {
  setModulo: PropTypes.func.isRequired,
  manejarAccesoSakila: PropTypes.func.isRequired,
  estaAutenticadoReal: PropTypes.bool.isRequired,
};

export default MenuInicio;