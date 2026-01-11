import { Plus, RotateCcw } from "lucide-react";
import Buscador from "./Buscador";
import RentalModal from "./rental/RentalModal";

/**
 * Sidebar con botones y buscador según tab activo en plataforma.io
 */
const BarraLateral = ({
  tab: pestana,
  setModalOpen: setModalAbierto,
  setCustomerSeleccionado, 
  cargarDatos,
  handleSearchResults: manejarResultados,
  fetchGraphQL: obtenerGraphQL,
  fetchAPI: obtenerAPI
}) => {

  const manejarNuevoCliente = () => {
    if (setCustomerSeleccionado) setCustomerSeleccionado(null); 
    setModalAbierto(true); 
  };

  return (
    <aside className="lg:col-span-4 space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        {pestana === "clientes" ? (
          <div className="space-y-6">
            {/* Botón Nuevo Cliente - Ahora llama a manejarNuevoCliente */}
            <button 
              onClick={manejarNuevoCliente}
              className="group w-full bg-slate-900 hover:bg-blue-600 text-white rounded-[1.2rem] font-black py-4 flex items-center justify-center gap-3 shadow-xl transition-all duration-300 active:scale-95"
            >
              <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                <Plus size={18} />
              </div>
              NUEVO CLIENTE
            </button>

            {/* Buscador */}
            <Buscador modo="clientes" alBuscar={manejarResultados} alGraphQL={obtenerGraphQL} />
          </div>
        ) : (
          <div className="space-y-6">
            <RentalModal refresh={cargarDatos} fetchAPI={obtenerAPI} />
            <Buscador modo="alquileres" alBuscar={manejarResultados} />
          </div>
        )}
      </div>

      {/* Botón Resetear base */}
      <button 
        onClick={() => { cargarDatos(); }} 
        className="w-full py-4 bg-white hover:bg-slate-50 text-slate-400 border border-slate-200/60 rounded-[1.5rem] text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
      >
        <RotateCcw size={14} className="text-blue-500" /> Resetear Base de Datos
      </button>
    </aside>
  );
};

export default BarraLateral;