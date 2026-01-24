import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useMotorPartida } from "../../hooks/useMotorPartida";
import { PanelMovimientos } from "./PanelMovimientos";
import { CabeceraJuego } from "./CabeceraJuego";
import { TableroAjedrez } from "./TableroAjedrez";
import { SeccionChat } from "./SeccionChat";
import { PopupAccion } from "./PopupAccion";
import { PopupResultadoFinal } from "./PopupResultadoFinal";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Vista principal de la partida
export const SalaJuego = ({ idSala, usuario, abandonarPartida, config, creando }) => {
    const {
        estadoDeLaPartida: datosPartida,
        colorAsignadoAlJugador: colorJugador,
        casillaSeleccionadaActual: casillaSeleccionada,
        setCasillaSeleccionadaActual: setCasillaSeleccionada,
        movimientosPosiblesEnTablero: movimientosPosibles,
        setMovimientosPosiblesEnTablero: setMovimientosPosibles,
        ultimoMovimiento,
        textoMensajeChat: mensajeChat,
        setTextoMensajeChat: setMensajeChat,
        listaDeMensajesRecibidos: listaMensajes,
        historialDeMovimientosSAN: historial,
        ventanasEmergentes: popups,
        setVentanasEmergentes: setPopups,
        referenciaFinalDelChat: chatFinalRef,
        faseDeRevanchaActual: estadoRevancha,
        conteoAtrasRevancha: timerRevancha,
        setFaseDeRevanchaActual: setEstadoRevancha,
        acciones,
        miIdSocket
    } = useMotorPartida(idSala, abandonarPartida);

    // Estado local para manejar el feedback visual al copiar el ID de la sala
    const [copiado, setCopiado] = useState(false);
    const [salaNoEncontrada, setSalaNoEncontrada] = useState(false);

    // Verificar si la sala existe al intentar entrar
    useEffect(() => {
        // Si estamos creando la sala, no verificamos existencia (evita 404 antes de que el socket conecte)
        if (creando) return;

        fetch(`${API_URL}/api/ajedrez/salas/${idSala}`)
            .then(res => {
                if (res.status === 404) setSalaNoEncontrada(true);
            })
            .catch(err => console.error("Error verificando sala:", err));
    }, [idSala, creando]);

    // Autocorrección: Si el socket conecta y recibe datos, la sala existe (corrige falsos 404)
    useEffect(() => {
        if (datosPartida) setSalaNoEncontrada(false);
    }, [datosPartida]);

    if (salaNoEncontrada) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="text-red-500 w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">¡Sala no encontrada!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        El código <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{idSala}</span> no existe o la partida ha finalizado.
                    </p>
                    <button 
                        onClick={abandonarPartida}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-200"
                    >
                        Volver y Generar Uno Nuevo
                    </button>
                </div>
            </div>
        );
    }

    if (!datosPartida || !datosPartida.matrizTablero || !config) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black uppercase text-slate-400 tracking-widest text-[10px]">
                    Cargando...
                </p>
            </div>
        );
    }

    const manejarCopiar = () => {
        if (!idSala) return;
        navigator.clipboard.writeText(idSala);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const manejarClickCasilla = (columna, fila) => {
        if (casillaSeleccionada) {
            acciones.moverPieza(casillaSeleccionada, { columna, fila });
            setCasillaSeleccionada(null);
            setMovimientosPosibles([]);
        } else {
            // Selección de pieza propia
            const pieza = datosPartida.matrizTablero?.[fila][columna];
            if (pieza) {
                const colorPiezaLimpio = config.COLORES.NOMBRES[pieza.color];
                // Solo permitimos seleccionar si es el turno del jugador y la pieza es suya
                if (colorPiezaLimpio === colorJugador && datosPartida.turnoActual === colorJugador) {
                    setCasillaSeleccionada({ columna, fila });
                    acciones.seleccionarCasilla({ columna, fila });
                }
            }
        }
    };

    const cancelarYSalirTotal = () => {
        acciones.cancelarRevancha();
        abandonarPartida();
    };

    const esMiTurno = datosPartida.turnoActual === colorJugador;
    const puedePedirRetroceso = esMiTurno || popups.esperandoRetroceso;

    return (
        <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-500">
            
            <div className="w-full max-w-[1900px] px-6 relative">
                <CabeceraJuego
                    idSala={idSala}
                    partidaIniciada={datosPartida.partidaIniciada}
                    tiempo={`${Math.floor(datosPartida.tiempoRestante / 60)}:${(datosPartida.tiempoRestante % 60).toString().padStart(2,'0')}`}
                    turnoActual={datosPartida.turnoActual}
                    colorJugador={colorJugador}
                    esperandoTablas={popups.esperandoTablas}
                    esperandoRetroceso={popups.esperandoRetroceso}
                    esperandoPausa={popups.esperandoPausa}
                    pausada={datosPartida.pausada}
                    alPausar={() => {
                        if (popups.esperandoPausa) {
                            setPopups(p => ({ ...p, esperandoPausa: false }));
                        } else {
                            setPopups(p => ({ ...p, esperandoPausa: true }));
                            acciones.solicitarPausa();
                        }
                    }}
                    copiado={copiado}
                    alCopiar={manejarCopiar}
                    alAbandonar={() => setPopups(p => ({ ...p, abandonar: true }))}
                    alRendirse={() => setPopups(p => ({ ...p, rendirse: true }))}
                    alPedirTablas={() => {
                        setPopups(p => ({ ...p, esperandoTablas: true })); 
                        acciones.pedirTablas();
                    }}
                    alPedirRetroceso={() => {
                        if (!puedePedirRetroceso) return;
                        if (popups.esperandoRetroceso) {
                            setPopups(p => ({ ...p, esperandoRetroceso: false }));
                        } else {
                            setPopups(p => ({ ...p, esperandoRetroceso: true }));
                            acciones.solicitarRetroceso();
                        }
                    }}
                    retrocesoDeshabilitado={!puedePedirRetroceso}
                />
            </div>

            <div className="w-full max-w-[1900px] px-6 flex flex-wrap lg:flex-nowrap gap-12 justify-center items-start">
                
                <section className="flex-[2] min-w-[320px] flex justify-center">
                    <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white w-full max-w-[80vh] aspect-square relative flex items-center justify-center">
                        <TableroAjedrez
                            datosPartida={datosPartida}
                            colorJugador={colorJugador}
                            casillaSeleccionada={casillaSeleccionada}
                            movimientosPosibles={movimientosPosibles}
                            ultimoMovimiento={ultimoMovimiento}
                            alHacerClick={manejarClickCasilla}
                            config={config}
                        />
                    </div>
                </section>

                <aside className="flex-1 min-w-[380px] md:min-w-[450px] flex flex-col gap-6 h-[80vh] min-h-[600px]">
                    <div className="flex-1 min-h-0 shadow-xl rounded-[2.5rem]">
                        <PanelMovimientos historial={historial} />
                    </div>
                    <div className="flex-[1.5] min-h-0 shadow-xl rounded-[2.5rem]">
                        <SeccionChat
                            listaMensajes={listaMensajes}
                            usuario={miIdSocket} 
                            mensajeChat={mensajeChat}
                            setMensajeChat={setMensajeChat}
                            alEnviar={(e) => {
                                e.preventDefault();
                                if (mensajeChat.trim()) {
                                    acciones.enviarMensaje(mensajeChat, usuario);
                                    setMensajeChat("");
                                }
                            }}
                            chatFinalRef={chatFinalRef}
                        />
                    </div>
                </aside>
            </div>

            <PopupResultadoFinal
                resultado={popups.final}
                estadoRevancha={estadoRevancha}
                timerRevancha={timerRevancha}
                alSolicitar={() => { 
                    setEstadoRevancha("enviado"); 
                    acciones.solicitarRevancha();
                }}
                alAceptar={acciones.aceptarRevancha}
                alCancelar={cancelarYSalirTotal}
                alRechazar={cancelarYSalirTotal}
            />
            
            {/* --- POPUPS DE ESPERA (SOLICITANTE) --- */}
            <PopupAccion
                abierto={popups.esperandoTablas}
                titulo="Solicitando Tablas"
                mensaje="Esperando respuesta del oponente..."
                colorBtn="bg-slate-500"
                textoBtn="Cancelar Solicitud"
                alConfirmar={() => setPopups(p => ({ ...p, esperandoTablas: false }))}
                alCancelar={() => setPopups(p => ({ ...p, esperandoTablas: false }))}
            />

            {/* --- POPUPS DE ACCIÓN (RECEPTOR) --- */}
            <PopupAccion
                abierto={popups.tablas}
                titulo="¿Aceptar Tablas?"
                mensaje="Tu oponente propone un empate en plataforma.io. ¿Deseas terminar?"
                colorBtn="bg-blue-600"
                textoBtn="Aceptar Empate"
                alConfirmar={() => acciones.responderTablas(true)}
                alCancelar={() => { 
                    acciones.responderTablas(false);
                    setPopups(p => ({ ...p, tablas: false })); 
                }}
            />

            <PopupAccion
                abierto={popups.peticionRetroceso}
                titulo="¿Retroceder?"
                mensaje="Tu oponente quiere deshacer el último movimiento."
                colorBtn="bg-orange-500"
                textoBtn="Permitir Retroceso"
                alConfirmar={() => {
                    acciones.responderRetroceso(true);
                    setPopups(p => ({ ...p, peticionRetroceso: false }));
                }}
                alCancelar={() => { 
                    acciones.responderRetroceso(false);
                    setPopups(p => ({ ...p, peticionRetroceso: false })); 
                }}
            />

            <PopupAccion
                abierto={popups.peticionPausa}
                titulo={datosPartida.pausada ? "¿Reanudar Partida?" : "¿Pausar Partida?"}
                mensaje={datosPartida.pausada 
                    ? "Tu oponente quiere reanudar el juego." 
                    : "Tu oponente quiere pausar el juego."}
                colorBtn="bg-yellow-500"
                textoBtn={datosPartida.pausada ? "Reanudar" : "Pausar"}
                alConfirmar={() => {
                    acciones.responderPausa(true);
                    setPopups(p => ({ ...p, peticionPausa: false }));
                }}
                alCancelar={() => { 
                    acciones.responderPausa(false);
                    setPopups(p => ({ ...p, peticionPausa: false })); 
                }}
            />

            <PopupAccion
                abierto={popups.rendirse}
                titulo="¿Rendirse?"
                mensaje="La partida finalizará y el rival ganará."
                colorBtn="bg-red-600"
                textoBtn="Rendirse"
                alConfirmar={acciones.rendirse}
                alCancelar={() => setPopups(p => ({ ...p, rendirse: false }))}
            />

            <PopupAccion
                abierto={popups.abandonar}
                titulo="¿Abandonar?"
                mensaje="Saldrás al menú principal de plataforma.io."
                colorBtn="bg-slate-900"
                textoBtn="Abandonar"
                alConfirmar={abandonarPartida}
                alCancelar={() => setPopups(p => ({ ...p, abandonar: false }))}
            />
        </div>
    );
};