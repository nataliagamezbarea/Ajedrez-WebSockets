import TablaDatos from "./TablaDatos";

/**
 * Componente principal de la tabla de datos
 */
const TablaPrincipal = ({
  data: datos,
  loading: cargando,
  isGraphQL: esGraphQL,
  tab: pestana,
  onEdit: alEditar,
  onDelete: alEliminar,
  currentPage: paginaActual,
  totalPages: totalPaginas,
  onPageChange: alCambiarPagina,
  limit: limite,
  onLimitChange: alCambiarLimite
}) => {
  return (
    <main className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px]">
      <TablaDatos 
        datos={datos} 
        cargando={cargando} 
        esGraphQL={esGraphQL} 
        pestana={pestana} 
        alEditar={alEditar}
        alEliminar={alEliminar}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        alCambiarPagina={alCambiarPagina}
        limite={limite}
        alCambiarLimite={alCambiarLimite}
      />
    </main>
  );
};

export default TablaPrincipal;