import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

// Hook principal de lógica de juego
export const useMotorPartida = (idSalaActiva, ejecutarAbandono) => {
    
    const [estadoDeLaPartida, setEstadoDeLaPartida] = useState({ 
        matrizTablero: null,
        turnoActual: 'blancas',
        tiempoRestante: 120,
        partidaIniciada: false,
        estaEnJaque: false
    });

    const [colorAsignadoAlJugador, setColorAsignadoAlJugador] = useState('blancas');
    const [casillaSeleccionadaActual, setCasillaSeleccionadaActual] = useState(null);
    const [movimientosPosiblesEnTablero, setMovimientosPosiblesEnTablero] = useState([]);
    
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
        esperandoTablas: false
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
            setListaDeMensajesRecibidos(prev => [...prev, mensajeEntrante]);
        });

        socket.on("movimientosPermitidos", setMovimientosPosiblesEnTablero);

        socket.on("movimientoRealizado", (datosMovimiento) =>
            setHistorialDeMovimientosSAN(prev => [...prev, datosMovimiento.san])
        );

        socket.on("propuestaTablasRecibida", () =>
            setVentanasEmergentes(prev => ({ ...prev, tablas: true }))
        );
        socket.on("propuestaTablasRechazada", () =>
            setVentanasEmergentes(prev => ({ ...prev, esperandoTablas: false }))
        );

        socket.on("revanchaSolicitada", () => setFaseDeRevanchaActual("recibido"));
        socket.on("revanchaCancelada", () => {
            setFaseDeRevanchaActual(null);
            ejecutarAbandono();
        });
        socket.on("revanchaAceptada", () => {
            setFaseDeRevanchaActual(null);
            setHistorialDeMovimientosSAN([]);
            setVentanasEmergentes({ final: null, tablas: false, rendirse: false, abandonar: false, esperandoTablas: false });
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
    };

    return {
        estadoDeLaPartida,
        colorAsignadoAlJugador,
        casillaSeleccionadaActual,
        setCasillaSeleccionadaActual,
        movimientosPosiblesEnTablero,
        setMovimientosPosiblesEnTablero,
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