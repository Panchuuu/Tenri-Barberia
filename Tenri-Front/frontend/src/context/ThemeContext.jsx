import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ============================================================
// 🎨 THEME CONTEXT
// ============================================================
// Maneja el modo claro/oscuro de forma centralizada.
//  - Lee preferencia inicial desde localStorage o sistema
//  - Aplica clase "dark" al <html> automáticamente
//  - Expone toggle y setter directo
// ============================================================

const ThemeContext = createContext(null);

const STORAGE_KEY = "theme";

function obtenerTemaInicial() {
  if (typeof window === "undefined") return "dark";

  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado === "light" || guardado === "dark") return guardado;

  // Si no hay preferencia, seguimos el sistema. Si tampoco, dark por default.
  const prefiereDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefiereDark ? "dark" : "dark"; // El proyecto está pensado para dark-first
}

export function ThemeProvider({ children }) {
  const [tema, setTemaState] = useState(obtenerTemaInicial);

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const toggleTema = useCallback(() => {
    setTemaState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTema = useCallback((nuevo) => {
    if (nuevo === "light" || nuevo === "dark") setTemaState(nuevo);
  }, []);

  const value = {
    tema,
    esOscuro: tema === "dark",
    esClaro:  tema === "light",
    toggleTema,
    setTema,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de un <ThemeProvider>");
  return ctx;
}
