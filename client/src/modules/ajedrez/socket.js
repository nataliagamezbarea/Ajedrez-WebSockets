import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const socketInstance = io(URL, {
  autoConnect: false,
  // Forzamos el uso de websockets para evitar problemas de CORS en Render
  transports: ['websocket', 'polling']
});

export const socket = socketInstance;
export default socketInstance;