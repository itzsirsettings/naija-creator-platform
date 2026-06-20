"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark"

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("tehilla_theme")
    if (stored === "light" || stored === "dark") return stored
  } catch { /* noop */ }
  return "dark"
}

interface ThemeContextValue {
  theme: Theme
  isLight: boolean
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }
    try { localStorage.setItem("tehilla_theme", theme) } catch { /* storage full or unavailable */ }
  }, [theme])

  const value = useMemo(() => ({
    theme,
    isLight: theme === "light",
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((current) => (current === "light" ? "dark" : "light")),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
