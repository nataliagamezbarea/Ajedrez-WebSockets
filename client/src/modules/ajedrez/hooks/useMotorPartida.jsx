import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

// Hook principal de lógica de juego
export const useMotorPartida = (idSalaActiva, ejecutarAbandono) => {
    
    const [estadoDeLaPartida, setEstadoDeLaPartida] = useState({ 
        matrizTablero: null,
        turnoActual: 'blancas',
        tiempoRestante: 120,
        partidaIniciada: false,
        estaEnJaque: false,
        pausada: false
    });

    const [colorAsignadoAlJugador, setColorAsignadoAlJugador] = useState('blancas');
    const [casillaSeleccionadaActual, setCasillaSeleccionadaActual] = useState(null);
    const [movimientosPosiblesEnTablero, setMovimientosPosiblesEnTablero] = useState([]);
    const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
    
    const [textoMensajeChat, setTextoMensajeChat] = useState("");
    const [listaDeMensajesRecibidos, setListaDeMensajesRecibidos] = useState([]);
    const [historialDeMovimientosSAN, setHistorialDeMovimientosSAN] = useState([]);

    const [faseDeRevanchaActual, setFaseDeRevanchaActual] = useState(null);
    const [conteoAtrasRevancha, setConteoAtrasRevancha] = useState(10);

    const [ventanasEmergentes, setVentanasEmergentes] = useState({
        final: null,
        tablas: false,
        rendirse: false,
        abandonar: false,
        esperandoTablas: false,
        peticionRetroceso: false,
        esperandoRetroceso: false,
        peticionPausa: false,
        esperandoPausa: false
    });

    const referenciaIntervaloRevancha = useRef(null);
    const referenciaFinalDelChat = useRef(null);

    // Gestión del temporizador de revancha
    useEffect(() => {
        if (faseDeRevanchaActual) {
            setConteoAtrasRevancha(10);
            referenciaIntervaloRevancha.current = setInterval(() => {
                setConteoAtrasRevancha(prev => {
                    if (prev <= 1) {
                        clearInterval(referenciaIntervaloRevancha.current);
                        socket.emit("cancelarRevancha", idSalaActiva);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(referenciaIntervaloRevancha.current);
    }, [faseDeRevanchaActual, idSalaActiva]);

    // Suscripción a eventos del socket
    useEffect(() => {
        socket.on("colorAsignado", (colorRecibido) => {
            setColorAsignadoAlJugador(colorRecibido === 'w' ? 'blancas' : 'negras');
        });

        socket.on("estadoJuego", (nuevosDatos) => {
            if (nuevosDatos.turnoActual) {
                nuevosDatos.turnoActual = nuevosDatos.turnoActual === 'w' ? 'blancas' : 'negras';
            }
            setEstadoDeLaPartida(prev => ({ ...prev, ...nuevosDatos }));
        });

        socket.on("updateTimer", (tiempoServidor) =>
            setEstadoDeLaPartida(prev => ({ ...prev, tiempoRestante: tiempoServidor }))
        );

        socket.on("nuevoMensaje", (mensajeEntrante) => {
            const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setListaDeMensajesRecibidos(prev => [...prev, { ...mensajeEntrante, hora }]);
        });

        socket.on("movimientosPermitidos", setMovimientosPosiblesEnTablero);

        socket.on("movimientoRealizado", (datosMovimiento) => {
            setHistorialDeMovimientosSAN(prev => [...prev, datosMovimiento.san]);
            // Corrección: Verificamos que existan los datos para evitar errores si el servidor envía solo SAN
            if (datosMovimiento.from && datosMovimiento.to) {
                setUltimoMovimiento({ 
                    from: datosMovimiento.from, 
                    to: datosMovimiento.to,
                    captura: datosMovimiento.san.includes('x') // Detectamos captura por la notación
                });
            } else {
                console.warn("Faltan datos 'from'/'to' en movimientoRealizado. Revisa el servidor.");
            }
        });

        socket.on("propuestaTablasRecibida", () =>
            setVentanasEmergentes(prev => ({ ...prev, tablas: true }))
        );
        socket.on("propuestaTablasRechazada", () =>
            setVentanasEmergentes(prev => ({ ...prev, esperandoTablas: false }))
        );

        socket.on("retrocesoSolicitado", () => 
            setVentanasEmergentes(prev => ({ ...prev, peticionRetroceso: true }))
        );
        socket.on("retrocesoRechazado", () => 
            setVentanasEmergentes(prev => ({ ...prev, esperandoRetroceso: false }))
        );
        socket.on("retrocesoRealizado", () => {
            setHistorialDeMovimientosSAN(prev => prev.slice(0, -1));
            setUltimoMovimiento(null);
            setVentanasEmergentes(prev => ({ 
                ...prev, peticionRetroceso: false, esperandoRetroceso: false 
            }));
        });

        socket.on("pausaSolicitada", () => 
            setVentanasEmergentes(prev => ({ ...prev, peticionPausa: true }))
        );
        socket.on("pausaRechazada", () => 
            setVentanasEmergentes(prev => ({ ...prev, esperandoPausa: false }))
        );
        socket.on("pausaAccionada", () => {
            setVentanasEmergentes(prev => ({ ...prev, peticionPausa: false, esperandoPausa: false }));
        });

        socket.on("revanchaSolicitada", () => setFaseDeRevanchaActual("recibido"));
        socket.on("revanchaCancelada", () => {
            setFaseDeRevanchaActual(null);
            ejecutarAbandono();
        });
        socket.on("revanchaAceptada", () => {
            setFaseDeRevanchaActual(null);
            setHistorialDeMovimientosSAN([]);
            setUltimoMovimiento(null);
            setVentanasEmergentes({ final: null, tablas: false, rendirse: false, abandonar: false, esperandoTablas: false, peticionRetroceso: false, esperandoRetroceso: false, peticionPausa: false, esperandoPausa: false });
        });

        socket.on("partidaFinalizada", (resultado) => {
            const victoriaConfirmada =
                (resultado.ganador === 'Blancas' && colorAsignadoAlJugador === 'blancas') ||
                (resultado.ganador === 'Negras' && colorAsignadoAlJugador === 'negras');

            setVentanasEmergentes(prev => ({
                ...prev,
                esperandoTablas: false,
                tablas: false,
                final: {
                    titulo: !resultado.ganador ? "TABLAS" : (victoriaConfirmada ? "HAS GANADO" : "HAS PERDIDO"),
                    motivo: resultado.motivo,
                    color: !resultado.ganador ? "text-blue-600" : (victoriaConfirmada ? "text-green-600" : "text-red-600"),
                    ganador: resultado.ganador
                }
            }));
        });

        return () => {
            socket.off("colorAsignado");
            socket.off("estadoJuego");
            socket.off("nuevoMensaje");
            socket.off("updateTimer");
            socket.off("movimientosPermitidos");
            socket.off("movimientoRealizado");
            socket.off("propuestaTablasRecibida");
            socket.off("propuestaTablasRechazada");
            socket.off("retrocesoSolicitado");
            socket.off("retrocesoRechazado");
            socket.off("retrocesoRealizado");
            socket.off("pausaSolicitada");
            socket.off("pausaRechazada");
            socket.off("pausaAccionada");
            socket.off("revanchaSolicitada");
            socket.off("revanchaCancelada");
            socket.off("revanchaAceptada");
            socket.off("partidaFinalizada");
        };
    }, [idSalaActiva, colorAsignadoAlJugador, ejecutarAbandono]);

    useEffect(() => {
        referenciaFinalDelChat.current?.scrollIntoView({ behavior: "smooth" });
    }, [listaDeMensajesRecibidos]);

    const accionesDeJuego = {
        moverPieza: (origen, destino) => socket.emit("moverPieza", { idSala: idSalaActiva, origen, destino }),
        seleccionarCasilla: (casilla) => socket.emit("obtenerMovimientos", { idSala: idSalaActiva, casilla }),
        enviarMensaje: (texto, usuarioNombre) => socket.emit("enviarMensaje", { 
            idSala: idSalaActiva, texto, usuario: usuarioNombre, idEmisor: socket.id 
        }),
        pedirTablas: () => socket.emit("pedirTablas", idSalaActiva),
        responderTablas: (aceptado) => socket.emit("responderTablas", { idSala: idSalaActiva, aceptado }),
        rendirse: () => socket.emit("rendirse", { idSala: idSalaActiva }),
        solicitarRevancha: () => socket.emit("solicitarRevancha", idSalaActiva),
        aceptarRevancha: () => socket.emit("aceptarRevancha", idSalaActiva),
        cancelarRevancha: () => socket.emit("cancelarRevancha", idSalaActiva),
        solicitarPausa: () => socket.emit("solicitarPausa", idSalaActiva),
        responderPausa: (aceptado) => socket.emit("responderPausa", { idSala: idSalaActiva, aceptado }),
        solicitarRetroceso: () => socket.emit("solicitarRetroceso", idSalaActiva),
        responderRetroceso: (aceptado) => socket.emit("responderRetroceso", { idSala: idSalaActiva, aceptado }),
    };

    return {
        estadoDeLaPartida,
        colorAsignadoAlJugador,
        casillaSeleccionadaActual,
        setCasillaSeleccionadaActual,
        movimientosPosiblesEnTablero,
        setMovimientosPosiblesEnTablero,
        ultimoMovimiento,
        textoMensajeChat,
        setTextoMensajeChat,
        listaDeMensajesRecibidos,
        historialDeMovimientosSAN,
        faseDeRevanchaActual,
        setFaseDeRevanchaActual,
        conteoAtrasRevancha,
        ventanasEmergentes,
        setVentanasEmergentes,
        referenciaFinalDelChat,
        acciones: accionesDeJuego,
        miIdSocket: socket.id
    };
};
