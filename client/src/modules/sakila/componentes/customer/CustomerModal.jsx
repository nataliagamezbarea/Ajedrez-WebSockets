import { useState, useEffect } from 'react';
import { X, Save, User, Mail, MapPin, Store, ShieldAlert, CheckCircle2, PartyPopper, AlertCircle, Globe } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, customer, refresh, fetchAPI }) => {
  const initialForm = { 
    store_id: 1, 
    first_name: "", 
    last_name: "", 
    email: "", 
    address_id: 1, 
    active: 1 
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [statusInfo, setStatusInfo] = useState({ code: null, type: "" });

  useEffect(() => {
    if (customer) setForm(customer);
    else setForm(initialForm);
    setErrors({});
    setSuccessData(null);
    setServerError(null);
    setStatusInfo({ code: null, type: "" });
  }, [customer, isOpen]);

  if (!isOpen) return null;

  // --- FUNCIÓN PARA IDENTIFICAR QUÉ CAMPO ILUMINAR SEGÚN EL ERROR DEL BACKEND ---
  const detectarCampoError = (mensaje) => {
    if (!mensaje) return null;
    const msg = mensaje.toLowerCase();
    if (msg.includes("first_name") || msg.includes("nombre")) return "first_name";
    if (msg.includes("last_name") || msg.includes("apellido")) return "last_name";
    if (msg.includes("email")) return "email";
    return null;
  };

  const handleSave = async () => {
    // Reset de estados antes de la petición
    setServerError(null);
    setStatusInfo({ code: null, type: "" });
    setErrors({});

    const path = customer ? `/customers/${customer.customer_id}` : "/customers";
    const method = customer ? "PUT" : "POST";

    // Enviamos directamente a plataforma.io sin validación previa en el cliente
    const res = await fetchAPI(path, method, form);

    // --- MANEJO DE RESPUESTAS DEL BACKEND ---
    if (res?.status >= 400) {
      const code = res.status;
      let type = "ERROR";
      if (code === 400) type = "DATOS INVÁLIDOS (400)";
      if (code === 404) type = "NO ENCONTRADO (404)";
      if (code === 500) type = "SERVIDOR (500)";

      setStatusInfo({ code, type });
      setServerError(res.error || "Error inesperado en plataforma.io");

      // Iluminamos el campo que causó el error en el backend
      const campoCulpable = detectarCampoError(res.error || res.message);
      if (campoCulpable) setErrors({ [campoCulpable]: true });
      return;
    }

    if (res && !res.error) {
      const newId = res.customer_id || (customer ? customer.customer_id : "ID");
      setSuccessData(newId);
      refresh();

      setTimeout(() => {
        onClose();
        setSuccessData(null);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300 text-left">

      {/* OVERLAY DE ÉXITO (STATUS 201) */}
      {successData && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-blue-600/95 backdrop-blur-md rounded-[2.5rem] p-8 text-center animate-in zoom-in duration-300">
          <div className="text-white space-y-4">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <PartyPopper size={40} />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter italic">¡Éxito!</h3>
            <div className="bg-white text-blue-600 px-8 py-5 rounded-[2rem] shadow-2xl inline-block border-4 border-blue-400/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">customer_id generado</p>
              <p className="text-5xl font-black italic tracking-tighter">#{successData}</p>
            </div>
          </div>
        </div>
      )}

      {/* CUERPO DEL MODAL */}
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 relative">
        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">{customer ? "Actualizar Cliente" : "Nuevo Cliente"}</h2>
            <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1.5">plataforma.io • Sakila CRM</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-5">
          
          {/* ALERTA DE ERROR DEL BACKEND */}
          {serverError && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 border ${statusInfo.code === 500 ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-50 border-red-100'}`}>
                {statusInfo.code === 500 ? <Globe className="text-blue-400" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.code === 500 ? 'text-blue-400' : 'text-red-600'}`}>{statusInfo.type}</p>
                    <p className={`text-[11px] font-bold leading-tight ${statusInfo.code === 500 ? 'text-slate-300' : 'text-red-500'}`}>{serverError}</p>
                </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">nombre *</label>
              <div className="relative">
                <User className={`absolute left-3 top-3 ${errors.first_name ? 'text-red-400' : 'text-slate-300'}`} size={18} />
                <input 
                  type="text" 
                  value={form.first_name} 
                  onChange={e => setForm({...form, first_name: e.target.value.toUpperCase()})} 
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none font-bold ${errors.first_name ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'}`} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">apellido *</label>
              <input 
                type="text" 
                value={form.last_name} 
                onChange={e => setForm({...form, last_name: e.target.value.toUpperCase()})} 
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none font-bold ${errors.last_name ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'}`} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">email</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-3 ${errors.email ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input 
                type="email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none ${errors.email ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'}`} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-50">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><Store size={12}/> tienda</label>
              <input type="number" value={form.store_id} onChange={e => setForm({...form, store_id: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><MapPin size={12}/> dirección</label>
              <input type="number" value={form.address_id} onChange={e => setForm({...form, address_id: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><CheckCircle2 size={12}/> activo</label>
              <select value={form.active} onChange={e => setForm({...form, active: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                <option value={1}>Si (1)</option>
                <option value={0}>No (0)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase">Cancelar</button>
          <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Save size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;