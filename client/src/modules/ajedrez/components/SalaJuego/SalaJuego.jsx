import { useState } from "react";
import { useMotorPartida } from "../../hooks/useMotorPartida";
import { PanelMovimientos } from "./PanelMovimientos";
import { CabeceraJuego } from "./CabeceraJuego";
import { TableroAjedrez } from "./TableroAjedrez";
import { SeccionChat } from "./SeccionChat";
import { PopupAccion } from "./PopupAccion";
import { PopupResultadoFinal } from "./PopupResultadoFinal";

// Vista principal de la partida
export const SalaJuego = ({ idSala, usuario, abandonarPartida, config }) => {
    const {
        estadoDeLaPartida: datosPartida,
        colorAsignadoAlJugador: colorJugador,
        casillaSeleccionadaActual: casillaSeleccionada,
        setCasillaSeleccionadaActual: setCasillaSeleccionada,
        movimientosPosiblesEnTablero: movimientosPosibles,
        setMovimientosPosiblesEnTablero: setMovimientosPosibles,
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

    if (!datosPartida || !datosPartida.matrizTablero || !config) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black uppercase text-slate-400 tracking-widest text-[10px]">
                    Sincronizando con plataforma.io...
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

    return (
        <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-500">
            
            <div className="w-full max-w-[1900px] px-6">
                <CabeceraJuego
                    idSala={idSala}
                    partidaIniciada={datosPartida.partidaIniciada}
                    tiempo={`${Math.floor(datosPartida.tiempoRestante / 60)}:${(datosPartida.tiempoRestante % 60).toString().padStart(2,'0')}`}
                    turnoActual={datosPartida.turnoActual}
                    colorJugador={colorJugador}
                    esperandoTablas={popups.esperandoTablas}
                    copiado={copiado}
                    alCopiar={manejarCopiar}
                    alAbandonar={() => setPopups(p => ({ ...p, abandonar: true }))}
                    alRendirse={() => setPopups(p => ({ ...p, rendirse: true }))}
                    alPedirTablas={() => {
                        setPopups(p => ({ ...p, esperandoTablas: true })); 
                        acciones.pedirTablas();
                    }}
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