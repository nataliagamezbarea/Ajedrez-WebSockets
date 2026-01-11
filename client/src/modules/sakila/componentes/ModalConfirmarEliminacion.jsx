import { AlertTriangle, X } from "lucide-react";

const ModalConfirmarEliminacion = ({ estaAbierto, alCerrar, alConfirmar }) => {
  
  if (!estaAbierto) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] animate-in fade-in duration-200"
    >
      <div 
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-slate-100 animate-in zoom-in duration-200"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-3xl text-red-500">
            <AlertTriangle size={40} />
          </div>
        </div>

        <h2 className="text-xl font-black text-center text-slate-800">
          ¿Borrar cliente?
        </h2>

        <p className="text-slate-500 text-center text-sm mt-2 mb-8">
          Esta acción es permanente y eliminará todos sus registros de alquiler asociados.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={alCerrar} 
            className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>

          <button 
            onClick={alConfirmar} 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-red-100 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEliminacion;