import { createContext, useContext } from "react"
import { theme as fullTheme } from "@/config/theme"

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={fullTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
