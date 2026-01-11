import { useState, useEffect } from "react";
import { socket } from "../socket";

// Hook para gestión de salas (creación, unión y validación)
export const useGestionSalas = (usuarioProcesado, salasPublicasInyectadas) => {
  const [idSalaActiva, setIdSalaActiva] = useState("");
  const [estaUnidoASala, setEstaUnidoASala] = useState(false);
  const [esSalaPrivada, setEsSalaPrivada] = useState(false);
  const [errorDeConexion, setErrorDeConexion] = useState("");

  useEffect(() => {
    const manejarError = (mensajeDeError) => {
      setErrorDeConexion(mensajeDeError);
      setEstaUnidoASala(false);
    };
    
    socket.on("errorAlUnirse", manejarError);
    return () => socket.off("errorAlUnirse", manejarError);
  }, []);

  // Procesar solicitud de entrada a sala
  const procesarEntradaASala = (idDeSalaExistente = null) => {
    let nombreFinalDeSala = "";
    const textoEntradaLimpio = idSalaActiva.trim().toUpperCase();

    // Validación de nombre duplicado en salas públicas
    if (!esSalaPrivada && !idDeSalaExistente && textoEntradaLimpio !== "") {
      if (salasPublicasInyectadas.find(sala => sala.id === textoEntradaLimpio)) {
        setErrorDeConexion("Esa sala pública ya existe. Elige otro nombre.");
        return;
      }
    }

    if (idDeSalaExistente) {
      nombreFinalDeSala = idDeSalaExistente.toUpperCase();
    } else if (textoEntradaLimpio !== "") {
      nombreFinalDeSala = textoEntradaLimpio;
    } else {
      const sufijoAleatorio = Math.random().toString(36).substring(2, 12).toUpperCase();
      nombreFinalDeSala = (esSalaPrivada ? "PRIVADA-" : "PUBLICA-") + sufijoAleatorio;
    }

    setIdSalaActiva(nombreFinalDeSala);

    socket.emit("unirseASala", {
      idSala: nombreFinalDeSala,
      esPrivada: idDeSalaExistente ? false : esSalaPrivada,
      usuario: usuarioProcesado 
    });

    setEstaUnidoASala(true);
  };

  const abandonarSalaActual = () => {
    if (idSalaActiva) socket.emit("abandonarSala", idSalaActiva);
    setEstaUnidoASala(false);
    setIdSalaActiva("");
    socket.emit("pedirListaSalas");
  };

  return {
    idSala: idSalaActiva,
    setIdSala: setIdSalaActiva,
    unido: estaUnidoASala,
    esPrivada: esSalaPrivada,
    setEsPrivada: setEsSalaPrivada,
    salasPublicas: salasPublicasInyectadas,
    mensajeError: errorDeConexion,
    setMensajeError: setErrorDeConexion,
    entrarASala: procesarEntradaASala,
    abandonarPartida: abandonarSalaActual
  };
};