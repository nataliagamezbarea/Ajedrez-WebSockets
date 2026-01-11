import { Database, Users, Film } from "lucide-react";

/**
 * Header del módulo con título y navegación de pestañas
 */
const Encabezado = ({ tab: pestana, setTab: setPestana }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/70 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
          <Database className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
            plataforma.io<span className="text-blue-600">.</span>sakila
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Management System
          </p>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <nav className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => setPestana("clientes")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-300 ${
            pestana === "clientes"
              ? "bg-white text-blue-600 shadow-md scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users size={16} /> Clientes
        </button>
        <button
          onClick={() => setPestana("alquileres")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-300 ${
            pestana === "alquileres"
              ? "bg-white text-blue-600 shadow-md scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Film size={16} /> Alquileres
        </button>
      </nav>
    </header>
  );
};

export default Encabezado;