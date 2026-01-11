import { 
    Pencil, Trash2, Calendar, AlertCircle, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Undo2
} from 'lucide-react'; 

const TablaDatos = ({ 
    datos = [], 
    cargando, 
    pestana, 
    alEditar, 
    alEliminar, 
    paginaActual = 1, 
    totalPaginas = 1, 
    alCambiarPagina,
    limite = 10,
    alCambiarLimite
}) => {
    
    if (cargando) return (
        <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center border border-slate-100 animate-pulse">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">Sincronizando con plataforma.io...</p>
        </div>
    );

    if (datos.length === 0) return (
        <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center justify-center border border-slate-100 text-center">
            <AlertCircle size={40} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-sm italic">No hay registros para mostrar.</p>
        </div>
    );

    const paginasTotalesSeguras = Math.max(totalPaginas, 1);
    const esModoCliente = pestana === "clientes";

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {esModoCliente ? (
                                <>
                                    <th className="p-5">customer_id</th>
                                    <th className="p-5">store_id</th>
                                    <th className="p-5">first_name</th>
                                    <th className="p-5">last_name</th>
                                    <th className="p-5">email</th>
                                    <th className="p-5">address_id</th>
                                    <th className="p-5">active</th>
                                    <th className="p-5 text-right font-black">actions</th>
                                </>
                            ) : (
                                <>
                                    <th className="p-5">rental_id</th>
                                    <th className="p-5">rental_date</th>
                                    <th className="p-5">inventory_id</th>
                                    <th className="p-5">customer_id</th>
                                    <th className="p-5">return_date</th>
                                    <th className="p-5">staff_id</th>
                                    <th className="p-5 text-right font-black">status / return</th>
                                </>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                        {datos.map((item, index) => {
                            const idUnico = esModoCliente ? (item.customer_id || `idx-${index}`) : (item.rental_id || `idx-${index}`);
                            const claveItem = esModoCliente ? `cust-${idUnico}` : `rent-${idUnico}`;

                            return (
                                <tr key={claveItem} className="hover:bg-slate-50/80 transition-all group">
                                    {esModoCliente ? (
                                        <>
                                            <td className="p-5 text-blue-600 font-black">#{item.customer_id}</td>
                                            <td className="p-5">{item.store_id || item.storeId || '-'}</td>
                                            
                                            <td className="p-5 uppercase">{item.first_name || item.firstName || 'N/A'}</td>
                                            <td className="p-5 uppercase">{item.last_name || item.lastName || 'N/A'}</td>
                                            
                                            <td className="p-5 font-normal text-slate-400">{item.email || 'sin email'}</td>
                                            <td className="p-5">{item.address_id || item.addressId || '-'}</td>
                                            <td className="p-5">
                                                <span className={`px-2 py-1 rounded-md ${(item.active == 1 || item.active === true) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {(item.active == 1 || item.active === true) ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => alEditar(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                        <Pencil size={14} />
                                                    </button>
                                                    {/* CORRECCIÓN AQUÍ: Pasamos el item completo, no solo el ID */}
                                                    <button onClick={() => alEliminar(item)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-5 text-blue-600 font-black">#{item.rental_id}</td>
                                            <td className="p-5 font-normal text-slate-400">{item.rental_date || item.rentalDate}</td>
                                            <td className="p-5">{item.inventory_id || item.inventoryId}</td>
                                            <td className="p-5">{item.customer_id || item.customerId}</td>
                                            <td className="p-5">
                                                {(item.return_date || item.returnDate) ? (
                                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-normal">{item.return_date || item.returnDate}</span>
                                                ) : (
                                                    <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md animate-pulse">PENDING</span>
                                                )}
                                            </td>
                                            <td className="p-5">{item.staff_id || item.staffId}</td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end items-center gap-3">
                                                    {!(item.return_date || item.returnDate) ? (
                                                        <button 
                                                            onClick={() => alEditar(item)} 
                                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 transition-all active:scale-95"
                                                        >
                                                            <Undo2 size={12} />
                                                            Return
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-[9px] uppercase pr-4">Completed</span>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">limit</span>
                    <select 
                        value={limite}
                        onChange={(e) => alCambiarLimite(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => alCambiarPagina(1)} disabled={paginaActual <= 1} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-20 active:scale-90 transition-all">
                        <ChevronsLeft size={18} />
                    </button>
                    <button onClick={() => alCambiarPagina(paginaActual - 1)} disabled={paginaActual <= 1} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-20 active:scale-90 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="bg-white border border-slate-200 px-5 py-2 rounded-2xl text-xs font-black text-blue-600 shadow-inner">
                        {paginaActual} / {paginasTotalesSeguras}
                    </div>
                    <button onClick={() => alCambiarPagina(paginaActual + 1)} disabled={paginaActual >= paginasTotalesSeguras} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-20 active:scale-90 transition-all">
                        <ChevronRight size={18} />
                    </button>
                    <button onClick={() => alCambiarPagina(paginasTotalesSeguras)} disabled={paginaActual >= paginasTotalesSeguras} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-20 active:scale-90 transition-all">
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablaDatos;