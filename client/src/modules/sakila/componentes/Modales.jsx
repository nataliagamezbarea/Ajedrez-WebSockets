import CustomerModal from "./customer/CustomerModal";
import RentalModal from "./rental/RentalModal"; // Asumimos existencia para soportar edición de alquileres
import ModalConfirmarEliminacion from "./ModalConfirmarEliminacion";

/**
 * Componente que renderiza todos los modales de la app - plataforma.io
 * Gestiona la visibilidad de los formularios y diálogos de confirmación.
 */
const Modales = ({
  modalOpen: modalAbierto,
  setModalOpen: setModalAbierto,
  selectedItem: itemSeleccionado,
  refresh: refrescar,
  fetchAPI: obtenerAPI,
  deleteModalOpen: modalEliminarAbierto,
  setDeleteModalOpen: setModalEliminarAbierto,
  handleDelete: manejarEliminacion
}) => (
  <>
    {/* 1. Modal para Crear/Actualizar (Dinámico según tipo de dato) */}
    {itemSeleccionado?.rental_id || (itemSeleccionado && !itemSeleccionado.customer_id) ? (
      <RentalModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        rental={itemSeleccionado} 
        refresh={refrescar}
        fetchAPI={obtenerAPI}
      />
    ) : (
      <CustomerModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        customer={itemSeleccionado} 
        refresh={refrescar}
        fetchAPI={obtenerAPI}
      />
    )}

    {/* 2. Modal para Confirmar Eliminación:
        Aquí el estado de éxito del borrado (Status 200) se gestiona en 'manejarEliminacion'.
    */}
    <ModalConfirmarEliminacion 
      estaAbierto={modalEliminarAbierto} 
      alCerrar={() => setModalEliminarAbierto(false)} 
      alConfirmar={() => {
        // Validación de seguridad para asegurar que el ID existe antes de la petición
        if (itemSeleccionado?.customer_id) {
          manejarEliminacion(itemSeleccionado.customer_id);
        } else if (itemSeleccionado?.rental_id) {
          // Soporte para eliminar alquileres si fuera necesario
          manejarEliminacion(itemSeleccionado.rental_id);
        } else {
          console.error("Error en plataforma.io: Intento de eliminación sin ID seleccionado.");
        }
      }} 
    />
  </>
);

export default Modales;