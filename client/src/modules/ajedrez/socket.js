import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false,
  // Forzamos el uso de websockets para evitar problemas de CORS en Render
  transports: ['websocket', 'polling']
});