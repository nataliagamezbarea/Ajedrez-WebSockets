import { useState } from 'react';
import { Search, Database, Film, User, AlertCircle, X } from 'lucide-react';

const Buscador = ({ alBuscar, alGraphQL, modo = "clientes" }) => {
    const [id, setId] = useState("");
    const [modalError, setModalError] = useState({ abierto: false, mensaje: "" });

    const lanzarAviso = (msg) => setModalError({ abierto: true, mensaje: msg });

    // 1. Búsqueda REST (Lupa): Busca un único registro (Cliente o Alquiler)
    const manejarBusquedaRest = async () => {
        if (!id || id <= 0) {
            lanzarAviso(`Introduce un ID de ${modo === "clientes" ? "cliente" : "alquiler"} válido.`);
            return;
        }
        // Pasamos el ID al padre para que ejecute handleSearchResults
        const res = await alBuscar(id);
        if (res && res.status >= 400) {
            lanzarAviso(res.error || `No se encontró el registro con ID ${id}`);
        }
    };

    // 2. Búsqueda GraphQL (Base de datos): Trae alquileres de un cliente
    const manejarBusquedaGraphQL = async () => {
        if (!id || id <= 0) {
            lanzarAviso("Introduce un ID de cliente para consultar sus alquileres.");
            return;
        }
        // Pasamos el ID al padre para que ejecute fetchGraphQL
        const res = await alGraphQL(id);
        if (res && res.status >= 400) {
            lanzarAviso(res.error || `No se encontró el cliente con ID ${id}`);
        }
    };

    return (
        <div className="p-4 md:p-6 rounded-[2.5rem] mb-6 flex flex-col gap-4 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 text-left relative w-full overflow-hidden">
            
            <header className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 text-slate-400">
                    <span className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                        {modo === "clientes" ? <User size={12}/> : <Film size={12}/>}
                    </span>
                    Buscador de {modo === "clientes" ? "Clientes" : "Alquileres"}
                </h3>
            </header>
            
            <div className="flex flex-row items-center gap-2 w-full bg-slate-50 p-2 rounded-[1.8rem] border border-slate-100">
                <div className="relative w-24">
                    <input 
                        type="number" 
                        placeholder={`ID ${modo === "clientes" ? "Cli" : "Alq"}`}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full h-14 rounded-2xl text-slate-900 font-black outline-none text-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300 text-center" 
                        value={id}
                        onChange={e => setId(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && manejarBusquedaRest()}
                    />
                </div>
                
                <div className="flex gap-2 flex-1 items-center">
                    {/* BOTÓN LUPA: Ejecuta búsqueda REST normal */}
                    <button 
                        onClick={manejarBusquedaRest} 
                        className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all active:scale-95 group"
                        title="Buscar registro único"
                    >
                        <Search size={22} className="group-hover:scale-110 transition-transform" />
                    </button>

                    {/* BOTÓN GQL: Solo en modo clientes para traer sus alquileres */}
                    {modo === "clientes" && (
                        <button 
                            onClick={manejarBusquedaGraphQL} 
                            className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                            title="Alquileres vía GraphQL"
                        >
                            <Database size={18} />
                            <span className="hidden sm:inline">Alquileres (GQL)</span>
                            <span className="sm:hidden">GQL</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Error */}
            {modalError.abierto && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border border-white text-center">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <AlertCircle size={40} />
                        </div>
                        <h4 className="text-slate-900 font-black uppercase text-2xl mb-3 tracking-tighter italic">¡Atención!</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 px-4">
                            {modalError.mensaje}
                        </p>
                        <button 
                            onClick={() => setModalError({ abierto: false, mensaje: "" })}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] uppercase text-[11px] tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            <X size={16} strokeWidth={3} /> Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buscador;