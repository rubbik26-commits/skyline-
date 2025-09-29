"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Skyline Theme System
export type SkylineTheme = "light" | "dark" | "manhattan" | "financial" | "system"

export interface SkylineThemeConfig {
  theme: SkylineTheme
  setTheme: (theme: SkylineTheme) => void
  accentColor: string
  setAccentColor: (color: string) => void
  animations: boolean
  setAnimations: (enabled: boolean) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
}

const SkylineThemeContext = createContext<SkylineThemeConfig | undefined>(undefined)

// Professional color schemes for different contexts
const skylineThemes = {
  light: {
    primary: "#4682B4",
    secondary: "#5B9BD5",
    accent: "#87CEEB",
    background: "#FFFFFF",
    foreground: "#0F172A",
    muted: "#F1F5F9",
    border: "#E2E8F0",
    card: "#FFFFFF",
    success: "#00D4AA",
    warning: "#FF9500",
    error: "#EF4444",
  },
  dark: {
    primary: "#5B9BD5",
    secondary: "#4682B4",
    accent: "#87CEEB",
    background: "#0F172A",
    foreground: "#F1F5F9",
    muted: "#334155",
    border: "#334155",
    card: "#1E293B",
    success: "#00D4AA",
    warning: "#FF9500",
    error: "#DC2626",
  },
  manhattan: {
    primary: "#2C5F7C",
    secondary: "#4A90A4",
    accent: "#6BB6C7",
    background: "#FAFBFC",
    foreground: "#1A202C",
    muted: "#EDF2F7",
    border: "#CBD5E0",
    card: "#FFFFFF",
    success: "#38A169",
    warning: "#D69E2E",
    error: "#E53E3E",
  },
  financial: {
    primary: "#1A365D",
    secondary: "#2D3748",
    accent: "#4299E1",
    background: "#F7FAFC",
    foreground: "#1A202C",
    muted: "#EDF2F7",
    border: "#E2E8F0",
    card: "#FFFFFF",
    success: "#38A169",
    warning: "#D69E2E",
    error: "#E53E3E",
  },
}

export function SkylineThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SkylineTheme>(() => {
    if (typeof window === "undefined") return "system"
    try {
      return (localStorage.getItem("skyline-theme") as SkylineTheme) || "system"
    } catch {
      return "system"
    }
  })

  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window === "undefined") return "#4682B4"
    try {
      return localStorage.getItem("skyline-accent") || "#4682B4"
    } catch {
      return "#4682B4"
    }
  })

  const [animations, setAnimations] = useState(() => {
    if (typeof window === "undefined") return true
    try {
      return localStorage.getItem("skyline-animations") !== "false"
    } catch {
      return true
    }
  })

  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("skyline-contrast") === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const root = document.documentElement

    // Apply theme
    const resolvedTheme =
      theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme

    const colors = skylineThemes[resolvedTheme] || skylineThemes.light

    // Set CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--skyline-${key}`, value)
    })

    root.style.setProperty("--skyline-accent-custom", accentColor)

    // Apply classes
    root.classList.remove("light", "dark", "manhattan", "financial", "high-contrast", "no-animations")
    root.classList.add(resolvedTheme)

    if (highContrast) root.classList.add("high-contrast")
    if (!animations) root.classList.add("no-animations")

    // Save preferences
    try {
      localStorage.setItem("skyline-theme", theme)
      localStorage.setItem("skyline-accent", accentColor)
      localStorage.setItem("skyline-animations", animations.toString())
      localStorage.setItem("skyline-contrast", highContrast.toString())
    } catch (error) {
      console.warn("Failed to save Skyline theme preferences:", error)
    }
  }, [theme, accentColor, animations, highContrast])

  const value: SkylineThemeConfig = {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    animations,
    setAnimations,
    highContrast,
    setHighContrast,
  }

  return <SkylineThemeContext.Provider value={value}>{children}</SkylineThemeContext.Provider>
}

export function useSkylineTheme() {
  const context = useContext(SkylineThemeContext)
  if (context === undefined) {
    throw new Error("useSkylineTheme must be used within a SkylineThemeProvider")
  }
  return context
}

// Theme Selector Component
export const SkylineThemeSelector: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor, animations, setAnimations, highContrast, setHighContrast } =
    useSkylineTheme()

  const themes: { value: SkylineTheme; label: string; description: string }[] = [
    { value: "light", label: "Light", description: "Clean and bright" },
    { value: "dark", label: "Dark", description: "Easy on the eyes" },
    { value: "manhattan", label: "Manhattan", description: "Professional blue" },
    { value: "financial", label: "Financial", description: "Corporate style" },
    { value: "system", label: "System", description: "Follow device" },
  ]

  const accentColors = ["#4682B4", "#0066CC", "#2563EB", "#7C3AED", "#DC2626", "#EA580C", "#059669", "#0891B2"]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Theme Settings</h3>

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`
                p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105
                ${
                  theme === value
                    ? "border-[#4682B4] bg-[#4682B4]/10 text-[#4682B4]"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                }
              `}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs opacity-70">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Accent Color</label>
        <div className="flex flex-wrap gap-2">
          {accentColors.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110
                ${accentColor === color ? "border-slate-400 scale-110" : "border-slate-200"}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Accessibility</h4>

        <label className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">Enable Animations</span>
          <button
            onClick={() => setAnimations(!animations)}
            className={`
              relative w-11 h-6 rounded-full transition-colors duration-200
              ${animations ? "bg-[#4682B4]" : "bg-slate-300 dark:bg-slate-600"}
            `}
          >
            <div
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200
                ${animations ? "translate-x-5" : "translate-x-0.5"}
              `}
            />
          </button>
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">High Contrast</span>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`
              relative w-11 h-6 rounded-full transition-colors duration-200
              ${highContrast ? "bg-[#4682B4]" : "bg-slate-300 dark:bg-slate-600"}
            `}
          >
            <div
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200
                ${highContrast ? "translate-x-5" : "translate-x-0.5"}
              `}
            />
          </button>
        </label>
      </div>
    </div>
  )
}
