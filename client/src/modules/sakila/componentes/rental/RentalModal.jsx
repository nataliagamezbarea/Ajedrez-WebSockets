import { useState } from 'react';
import { Plus, X, Save, Film, User, Contact, PartyPopper, AlertCircle, Globe } from 'lucide-react';

/**
 * RentalModal - plataforma.io
 * Gestión de alquileres con detección de estados HTTP (201, 400, 404, 500)
 */
const RentalModal = ({ refresh, fetchAPI }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [statusInfo, setStatusInfo] = useState({ code: null, type: "" });
    
    const [form, setForm] = useState({ inventory_id: "", customer_id: "", staff_id: "" });
    const [errors, setErrors] = useState({});

    /**
     * Detección de campo culpable basada en la respuesta de plataforma.io
     */
    const detectarCampoError = (mensaje) => {
        if (!mensaje) return null;
        const msg = mensaje.toLowerCase();
        
        if (msg.includes("customer") || msg.includes("cliente")) return "customer_id";
        if (msg.includes("inventory") || msg.includes("inventario") || msg.includes("item")) return "inventory_id";
        if (msg.includes("staff") || msg.includes("empleado")) return "staff_id";
        
        return null;
    };

    const handleSave = async () => {
        setServerError(null);
        setStatusInfo({ code: null, type: "" });
        setErrors({}); 
        
        // Enviamos los datos tal cual al backend de plataforma.io para validar allí
        const rentalData = {
            inventory_id: form.inventory_id ? Number(form.inventory_id) : null,
            customer_id: form.customer_id ? Number(form.customer_id) : null,
            staff_id: form.staff_id ? Number(form.staff_id) : null
        };

        const res = await fetchAPI("/rentals", "POST", rentalData);

        // --- MANEJO DE TODOS LOS CÓDIGOS DE ESTADO ---
        if (res?.status >= 400) {
            const code = res.status;
            let type = "ERROR";
            
            if (code === 400) type = "DATOS INVÁLIDOS (400)";
            if (code === 404) type = "NO ENCONTRADO (404)";
            if (code === 500) type = "SERVIDOR (500)";

            setStatusInfo({ code, type });
            setServerError(res.error || "Error inesperado");

            // Iluminamos el input si el error es de integridad o falta de datos
            const campoCulpable = detectarCampoError(res.error || res.message);
            if (campoCulpable) {
                setErrors({ [campoCulpable]: true });
            }
            return;
        }

        // --- CASO ÉXITO (201) ---
        const generatedId = res?.rental_id || res?.insertId || (res?.data && res.data.rental_id);
        if (generatedId) {
            setSuccessData(generatedId);
            refresh(); 

            setTimeout(() => {
                setForm({ inventory_id: "", customer_id: "", staff_id: "" });
                setIsOpen(false);
                setSuccessData(null);
                setServerError(null);
                setStatusInfo({ code: null, type: "" });
            }, 2500);
        } else {
            setServerError("Respuesta inesperada del servidor de plataforma.io");
        }
    };

    return (
        <div className="space-y-4 w-full text-left">
            <button 
                onClick={() => { setIsOpen(true); setServerError(null); setErrors({}); setStatusInfo({code: null, type: ""}); }}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-[1.2rem] font-black py-4 flex items-center justify-center gap-3 shadow-xl transition-all duration-300 active:scale-95"
            >
                <div className="bg-white/20 p-1 rounded-lg"><Plus size={18} /></div>
                NUEVO ALQUILER
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">

                    {/* Feedback de Éxito Visual (201) */}
                    {successData && (
                        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-blue-600/95 backdrop-blur-md rounded-[2.5rem] p-8 text-center animate-in zoom-in duration-300 text-white">
                            <div className="space-y-4">
                                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <PartyPopper size={40} />
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic">¡REGISTRADO!</h3>
                                <div className="bg-white text-blue-600 px-8 py-5 rounded-[2rem] shadow-2xl inline-block">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">rental_id generado</p>
                                    <p className="text-5xl font-black italic tracking-tighter">#{successData}</p>
                                </div>
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] pt-4 animate-pulse">Sincronizado con plataforma.io</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
                        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Registrar Renta</h2>
                                <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1.5">plataforma.io • Gestión</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-all text-left">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-5">
                            {/* Alerta de Error Dinámica según Status Code (400, 404, 500) */}
                            {serverError && (
                                <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 border ${statusInfo.code === 500 ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-50 border-red-100'}`}>
                                    {statusInfo.code === 500 ? <Globe className="text-blue-400" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.code === 500 ? 'text-blue-400' : 'text-red-600'}`}>{statusInfo.type}</p>
                                        <p className={`text-[11px] font-bold leading-tight ${statusInfo.code === 500 ? 'text-slate-300' : 'text-red-500'}`}>{serverError}</p>
                                    </div>
                                </div>
                            )}

                            {[
                                { id: "inventory_id", label: "ID Inventario", icon: Film },
                                { id: "customer_id", label: "ID Cliente", icon: User },
                                { id: "staff_id", label: "ID Staff (Empleado)", icon: Contact }
                            ].map((field) => {
                                const Icon = field.icon;
                                return (
                                    <div className="space-y-1" key={field.id}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{field.label} *</label>
                                        <div className="relative">
                                            <Icon className={`absolute left-3 top-3 ${errors[field.id] ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                                            <input 
                                                type="number" 
                                                placeholder="Introduce ID..." 
                                                value={form[field.id]} 
                                                onChange={e => {
                                                    setForm({...form, [field.id]: e.target.value});
                                                    setErrors({...errors, [field.id]: false}); 
                                                }} 
                                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all font-bold text-sm ${errors[field.id] ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-blue-400'}`} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setIsOpen(false)} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600 transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                                <Save size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Guardar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalModal;