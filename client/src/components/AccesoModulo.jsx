import { LogIn } from "lucide-react";
import PropTypes from 'prop-types';

// Componente de tarjeta para selección de módulos
const AccesoModulo = ({ 
    titulo,
    icono: Icono,
    alHacerClick,
    requiereAutenticacion = false,
    autenticacionActiva = false
}) => {
    
    const estaBloqueado = requiereAutenticacion && !autenticacionActiva;

    const clasesBaseBoton = "group relative bg-white flex flex-col items-center justify-center w-full sm:w-80 aspect-square rounded-[3rem] shadow-xl transition-all border-2 overflow-hidden";
    const clasesBotonBloqueado = "border-slate-100 hover:border-red-400 cursor-pointer";
    const clasesBotonActivo = "hover:shadow-2xl hover:border-blue-500 border-transparent active:scale-95 cursor-pointer";

    const clasesIcono = "mb-6 transition-all duration-300";
    const clasesIconoBloqueado = "text-slate-300 grayscale";
    const clasesIconoActivo = "text-blue-600 group-hover:scale-110 group-hover:rotate-3";

    const clasesTitulo = "font-black uppercase tracking-[0.3em] text-[10px]";
    const clasesTituloBloqueado = "text-slate-400";
    const clasesTituloActivo = "text-slate-600";

    return (
        <button 
            onClick={alHacerClick} 
            type="button" 
            className={`${clasesBaseBoton} ${estaBloqueado ? clasesBotonBloqueado : clasesBotonActivo}`}
        >
            <div className={`${clasesIcono} ${estaBloqueado ? clasesIconoBloqueado : clasesIconoActivo}`}>
                {Icono && <Icono size={64} strokeWidth={1.5} />}
            </div>

            <span className={`${clasesTitulo} ${estaBloqueado ? clasesTituloBloqueado : clasesTituloActivo}`}>
                {titulo}
            </span>

            {estaBloqueado 
                ? <OverlayBloqueado /> 
                : <IndicadorAcceso />
            }
        </button>
    );
};

const OverlayBloqueado = () => (
    <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 group-hover:bg-white/40 transition-colors">
        <div className="bg-red-500 text-white text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-red-200 flex items-center gap-2 animate-pulse group-hover:scale-110 transition-transform">
            <LogIn size={12} />
            Iniciar Sesión
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-3 tracking-tighter">
            Requerido para plataforma.io
        </p>
    </div>
);

const IndicadorAcceso = () => (
    <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">
            Acceder ahora
        </span>
    </div>
);

AccesoModulo.propTypes = {
    titulo: PropTypes.string.isRequired,
    icono: PropTypes.elementType.isRequired,
    alHacerClick: PropTypes.func.isRequired,
    requiereAutenticacion: PropTypes.bool,
    autenticacionActiva: PropTypes.bool
};

export default AccesoModulo;