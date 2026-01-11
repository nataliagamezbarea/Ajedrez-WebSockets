import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const useSesionUsuario = () => {
  const { isAuthenticated: estaAutenticadoReal, user, isLoading } = useAuth0();

  // Estados iniciales sincronizados con localStorage
  const [modoInvitado, setModoInvitado] = useState(() => localStorage.getItem("modoInvitado") === "true");
  const [idInvitado, setIdInvitado] = useState(() => localStorage.getItem("idInvitado"));

  // FUNCIÓN CRÍTICA: Se dispara al pulsar "Continuar como invitado"
  const activarModoInvitado = useCallback(() => {
    // Generamos el ID único para plataforma.io
    const nuevoId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Guardado físico inmediato
    localStorage.setItem("idInvitado", nuevoId);
    localStorage.setItem("modoInvitado", "true");
    
    // Actualización de estado inmediata
    setIdInvitado(nuevoId);
    setModoInvitado(true);
  }, []);

  // Limpieza si el usuario decide entrar con Google (Oficial)
  useEffect(() => {
    if (estaAutenticadoReal) {
      localStorage.removeItem("idInvitado");
      localStorage.setItem("modoInvitado", "false");
      setIdInvitado(null);
      setModoInvitado(false);
    }
  }, [estaAutenticadoReal]);

  // El nombre que consumirá la Navbar y el Perfil
  const nombreUsuario = useMemo(() => {
    if (estaAutenticadoReal && user) return user.name || user.nickname;
    if (modoInvitado && idInvitado) return `Invitado-${idInvitado}`;
    return "Invitado"; 
  }, [estaAutenticadoReal, user, modoInvitado, idInvitado]);

  return { 
    autenticado: estaAutenticadoReal || modoInvitado,
    nombreUsuario, // <--- Este es el que tiene el "Invitado-1234"
    isLoading,
    modoInvitado,
    setModoInvitado: activarModoInvitado 
  };
};