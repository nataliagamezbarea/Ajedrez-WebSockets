import { useState, useEffect } from "react";
import { socket } from "../socket";

// Hook para gestionar la conexión global y el lobby de salas
export const useConectorTiempoReal = () => {
  const [salasPublicas, setSalasPublicas] = useState([]);
  const [conectado, setConectado] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const alConectar = () => setConectado(true);
    const alDesconectar = () => setConectado(false);
    const alRecibirListaSalas = (datos) => setSalasPublicas(datos || []);

    // Suscripción a eventos
    socket.on("connect", alConectar);
    socket.on("disconnect", alDesconectar);
    socket.on("listaSalas", alRecibirListaSalas);

    // Solicitar estado inicial
    socket.emit("pedirListaSalas");

    return () => {
      socket.off("connect", alConectar);
      socket.off("disconnect", alDesconectar);
      socket.off("listaSalas", alRecibirListaSalas);
    };
  }, []);

  return { salasPublicas, conectado };
};