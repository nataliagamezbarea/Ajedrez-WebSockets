import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AlertCircle, X } from "lucide-react";

import Encabezado from "./componentes/Encabezado";
import BarraLateral from "./componentes/BarraLateral";
import TablaPrincipal from "./componentes/TablaPrincipal";
import Modales from "./componentes/Modales";

/**
 * ModuloSakila - plataforma.io
 * Gestión robusta de búsquedas híbridas (REST/GraphQL) y estado de sesión.
 */
const ModuloSakila = () => {
  const { getAccessTokenSilently } = useAuth0();

  // Estados de navegación y datos
  const [tab, setTab] = useState("clientes");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGraphQL, setIsGraphQL] = useState(false);

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Estados de Modales y Selección
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Estado para Popups de Error Globales (Eliminación, Edición fallida, etc.)
  const [globalError, setGlobalError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const API_URL = `${API_BASE}/api/v1`;
  const GRAPHQL_URL = `${API_BASE}/graphql`;

  /** * FUNCIÓN FETCH API CORREGIDA: 
   * Captura el Status Code para que plataforma.io muestre el feedback visual correcto.
   */
  const fetchAPI = useCallback(async (path, method = "GET", body = null) => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: body ? JSON.stringify(body) : null,
      });

      // Manejo de éxito para DELETE (204 No Content o 200 OK)
      if (res.status === 204 || (res.status === 200 && method === "DELETE")) {
        return { status: res.status, success: true };
      }

      const json = await res.json();

      // Si la respuesta no es exitosa (400, 404, 500, etc.)
      if (!res.ok) {
        return { 
          status: res.status, 
          error: json.error || json.message || "Error en plataforma.io" 
        };
      }

      // Respuesta exitosa: Inyectamos el status para el manejo de UI
      return { ...json, status: res.status };

    } catch (error) {
      console.error("Error crítico plataforma.io:", error);
      return { status: 500, error: "Error de conexión con el servidor de plataforma.io" };
    } finally { 
      setLoading(false); 
    }
  }, [getAccessTokenSilently, API_URL]);

  /** * CARGAR DATOS: Sincroniza la tabla con los cambios del backend.
   */
  const cargarDatos = useCallback(() => {
    setIsGraphQL(false);
    
    const endpoint = tab === "clientes"
      ? `/customers?page=${page}&limit=${limit}`
      : `/rentals?page=${page}&limit=${limit}`;

    fetchAPI(endpoint).then(res => {
      // Si hay error de servidor o no hay datos, limpiamos la tabla
      if (!res || res.status >= 400) {
        setData([]);
        return;
      }

      // Mapeo dinámico según la estructura de respuesta del controlador
      if (res.data) {
        setData(res.data);
        setTotalPages(res.totalPages || 1);
      } else {
        // Fallback para respuestas que devuelven el array directamente
        const arrayResult = Array.isArray(res) ? res : [res];
        setData(arrayResult);
        setTotalPages(1);
      }
    });
  }, [tab, page, limit, fetchAPI]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  /** * ELIMINACIÓN: Ejecuta el borrado y refresca la vista.
   */
  const handleDelete = async (id) => {
    const path = tab === "clientes" ? `/customers/${id}` : `/rentals/${id}`;
    const res = await fetchAPI(path, "DELETE");
    
    // Si el status es 200 (OK), cerramos y refrescamos
    if (res.status === 200 || res.success) {
      setDeleteModalOpen(false);
      setSelectedItem(null);
      cargarDatos();
    } else {
      // CASO ERROR: Mostramos popup si falla (ej: 404, 500)
      setDeleteModalOpen(false);
      setGlobalError({
        type: `ERROR ${res.status || 'DESCONOCIDO'}`,
        message: res.error || res.message || "No se pudo eliminar el registro."
      });
      setTimeout(() => setGlobalError(null), 4000);
    }
  };

  /** * BÚSQUEDA REST (LUPA): Filtra por ID o por términos.
   */
  const handleSearchResults = async (input) => {
    setData([]); 
    
    if (typeof input === "string" || typeof input === "number") {
      const endpoint = tab === "clientes" ? `/customers/${input}` : `/rentals/${input}`;
      const res = await fetchAPI(endpoint);
      
      if (!res || res.status >= 400) {
        setData([]);
        return res; // Devolvemos el error para que el Buscador lo muestre
      }

      // Extraemos la data (considerando que el controlador la envuelve en .data)
      const finalData = res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : (Array.isArray(res) ? res : [res]);
      setData(finalData);
    } 
    else if (input) {
      setData(Array.isArray(input) ? input : [input]);
    }
    
    setTotalPages(1);
    setPage(1);
    return { status: 200 }; // Retorno de éxito
  };

  /** * GRAPHQL: Consulta específica de plataforma.io.
   */
  const fetchGraphQL = async (customerId) => {
    setLoading(true);
    setIsGraphQL(true);
    setData([]); 
    setTab("alquileres"); 

    try {
      const token = await getAccessTokenSilently();
      const query = {
        query: `query Get($id: ID!) { 
          customer(id: $id) { 
            rentals { 
              rental_id rental_date inventory_id customer_id return_date staff_id 
            } 
          } 
        }`,
        variables: { id: customerId },
      };

      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(query),
      });

      const json = await res.json();
      
      // Validación: Si customer es null, el ID no existe
      if (!json.data || !json.data.customer) {
        return { status: 404, error: `El cliente con ID ${customerId} no existe (GQL).` };
      }

      const rentals = json.data?.customer?.rentals || [];
      setData(rentals);
      setTotalPages(1);
      setPage(1);
      return { status: 200 };
    } catch (error) {
      console.error("Error GraphQL plataforma.io:", error);
      setData([]);
      return { status: 500, error: error.message };
    } finally { 
      setLoading(false); 
    }
  };

  /** * ACCIONES DE TABLA: Inicia edición o procesa devolución.
   */
  const handleEditAction = (item) => {
    setSelectedItem(item);
    if (tab === "clientes") {
      setModalOpen(true);
    } else {
      // Proceso de devolución con Status 200
      fetchAPI(`/rentals/${item.rental_id}/return`, "PUT").then((res) => {
          if (res.status === 200) {
            cargarDatos();
          } else {
            setGlobalError({
              type: `ERROR ${res.status || 'ACTUALIZACIÓN'}`,
              message: res.error || res.message || "Fallo al procesar la devolución."
            });
            setTimeout(() => setGlobalError(null), 4000);
          }
      });
    }
  };

  return (
    <>
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center p-4 md:p-10 font-sans">
      <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-700">
        <Encabezado tab={tab} setTab={(t) => { setTab(t); setPage(1); }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <BarraLateral 
            tab={tab}
            setModalOpen={setModalOpen}
            setCustomerSeleccionado={setSelectedItem}
            cargarDatos={cargarDatos}
            handleSearchResults={handleSearchResults}
            fetchGraphQL={fetchGraphQL}
            fetchAPI={fetchAPI}
          />

          <TablaPrincipal 
            data={data}
            loading={loading}
            isGraphQL={isGraphQL}
            tab={tab}
            onEdit={handleEditAction}
            onDelete={(item) => { 
                setSelectedItem(item); 
                setDeleteModalOpen(true); 
            }}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          />
        </div>
      </div>

      <Modales 
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        refresh={cargarDatos}
        fetchAPI={fetchAPI}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        handleDelete={handleDelete}
      />
    </div>

    {/* POPUP GLOBAL DE ERROR (Estilo Tailwind consistente con RentalModal) */}
    {globalError && (
      <div className="fixed bottom-10 right-4 md:right-10 z-[200] bg-red-50 border border-red-100 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
        <AlertCircle className="text-red-500 shrink-0" size={24} />
        <div>
          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{globalError.type}</h4>
          <p className="text-[11px] font-bold text-red-500 leading-tight">{globalError.message}</p>
        </div>
        <button onClick={() => setGlobalError(null)} className="ml-2 text-red-300 hover:text-red-600 transition-colors">
          <X size={16}/>
        </button>
      </div>
    )}
    </>
  );
};

export default ModuloSakila;