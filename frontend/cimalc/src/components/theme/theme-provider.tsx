/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useEffect, useState } from "react";
type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: "light", toggleTheme: () => undefined });
export function ThemeProvider({ children }: { children: React.ReactNode }) { const [theme, setTheme] = useState<Theme>("light"); useEffect(() => { const saved = window.localStorage.getItem("cimalc-theme") as Theme | null; const preferred = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); setTheme(preferred); document.documentElement.classList.toggle("dark", preferred === "dark"); }, []); function toggleTheme() { const next = theme === "dark" ? "light" : "dark"; setTheme(next); document.documentElement.classList.toggle("dark", next === "dark"); window.localStorage.setItem("cimalc-theme", next); } return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>; }
export function useTheme() { return useContext(ThemeContext); }

