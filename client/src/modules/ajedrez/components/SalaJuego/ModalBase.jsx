// Componente base reutilizable para todos los diálogos modales
export const ModalBase = ({ children, abierto, zIndex = "z-[9998]" }) => {
  if (!abierto) return null;

  return (
    <div
      className={`fixed inset-0 min-h-screen w-screen ${zIndex} flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300`}
    >
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-sm w-full text-center border-2 border-slate-100 animate-in zoom-in duration-300">
        {children}
      </div>
    </div>
  );
};