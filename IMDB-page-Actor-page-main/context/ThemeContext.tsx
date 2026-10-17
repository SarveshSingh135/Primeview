"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext<any>(null)

export const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState("dark")

  // load from localStorage
 useEffect(() => {
  const saved = localStorage.getItem("theme")
  if (saved === "light" || saved === "dark") {
    setTheme(saved)
  } else {
    setTheme("dark") // default dark
  }
}, [])

  // apply theme
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)

    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)