"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Building2, BarChart3, Database, TrendingUp } from "lucide-react"

// Skyline Brand Colors matching Skyline Properties
const skylineColors = {
  primary: "#4682B4",
  secondary: "#5B9BD5",
  accent: "#87CEEB",
  success: "#00d4aa",
  warning: "#ff9500",
  gradient: "linear-gradient(135deg, #4682B4 0%, #5B9BD5 100%)",
}

// Manhattan Skyline SVG Animation
const ManhattanSkyline: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 400 100" fill="none">
    <rect
      x="50"
      y="30"
      width="20"
      height="70"
      fill={skylineColors.primary}
      className="animate-in slide-in-from-bottom-full duration-800 delay-100"
    />
    <rect
      x="80"
      y="20"
      width="25"
      height="80"
      fill={skylineColors.accent}
      className="animate-in slide-in-from-bottom-full duration-800 delay-200"
    />
    <rect
      x="115"
      y="10"
      width="30"
      height="90"
      fill={skylineColors.secondary}
      className="animate-in slide-in-from-bottom-full duration-800 delay-300"
    />
    <rect
      x="155"
      y="25"
      width="22"
      height="75"
      fill={skylineColors.primary}
      className="animate-in slide-in-from-bottom-full duration-800 delay-500"
    />
    <rect
      x="185"
      y="15"
      width="28"
      height="85"
      fill={skylineColors.accent}
      className="animate-in slide-in-from-bottom-full duration-800 delay-500"
    />
    <rect
      x="220"
      y="35"
      width="18"
      height="65"
      fill={skylineColors.primary}
      className="animate-in slide-in-from-bottom-full duration-800 delay-600"
    />
    <rect
      x="245"
      y="5"
      width="35"
      height="95"
      fill={skylineColors.secondary}
      className="animate-in slide-in-from-bottom-full duration-800 delay-700"
    />
    <rect
      x="290"
      y="28"
      width="24"
      height="72"
      fill={skylineColors.accent}
      className="animate-in slide-in-from-bottom-full duration-800 delay-800"
    />
    <rect
      x="325"
      y="18"
      width="26"
      height="82"
      fill={skylineColors.primary}
      className="animate-in slide-in-from-bottom-full duration-800 delay-900"
    />
  </svg>
)

// Data Loading Animation
const DataPulse: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-3 h-3 rounded-full bg-[#4682B4] animate-pulse"
        style={{ animationDelay: `${i * 200}ms` }}
      />
    ))}
  </div>
)

// Advanced Progress Ring
const ProgressRing: React.FC<{
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}> = ({ progress, size = 120, strokeWidth = 8, className }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skylineColors.primary} />
            <stop offset="100%" stopColor={skylineColors.accent} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

// Main Skyline Page Loader
export const SkylinePageLoader: React.FC<{
  progress?: number
  stage?: string
  showProgress?: boolean
}> = ({ progress = 0, stage = "Initializing Skyline", showProgress = true }) => {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(stage)

  const loadingStages = [
    "Connecting to Manhattan data...",
    "Loading property analytics...",
    "Processing market trends...",
    "Optimizing dashboard layout...",
    "Finalizing insights...",
  ]

  useEffect(() => {
    if (showProgress) {
      const timer = setInterval(() => {
        setDisplayProgress((prev) => {
          const target = Math.min(progress, 100)
          const newProgress = prev + (target - prev) * 0.1
          return Math.min(newProgress, target)
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [progress, showProgress])

  useEffect(() => {
    const stageIndex = Math.floor((displayProgress / 100) * loadingStages.length)
    const newStage = loadingStages[Math.min(stageIndex, loadingStages.length - 1)]
    if (newStage !== currentStage) {
      setCurrentStage(newStage)
    }
  }, [displayProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-600">
          {/* Skyline Logo Animation */}
          <div className="relative">
            <ManhattanSkyline className="w-48 h-24 mx-auto mb-6" />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 animate-bounce">
              <Building2 className="w-8 h-8 text-[#4682B4]" />
            </div>
          </div>

          {/* Main Title */}
          <div className="animate-in fade-in-0 duration-300 delay-300">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4682B4] to-[#5B9BD5] mb-2">
              Skyline
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Manhattan Office Analytics</p>
          </div>

          {/* Progress Ring */}
          {showProgress && (
            <div className="animate-in zoom-in-0 duration-500 delay-500">
              <ProgressRing progress={displayProgress} />
            </div>
          )}

          {/* Loading Stage */}
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <p className="text-slate-700 dark:text-slate-300 font-medium">{currentStage}</p>
            <DataPulse />
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 animate-in fade-in-0 duration-300 delay-1000">
            {[
              { icon: BarChart3, label: "116 Properties" },
              { icon: Database, label: "25K+ Units" },
              { icon: TrendingUp, label: "Real-time Data" },
            ].map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className="text-center animate-in zoom-in-0 duration-300"
                style={{ animationDelay: `${1200 + index * 100}ms` }}
              >
                <Icon className="w-6 h-6 text-[#4682B4] mx-auto mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget-specific loaders
export const SkylineWidgetLoader: React.FC<{
  title: string
  type?: "chart" | "table" | "metric" | "map"
  className?: string
}> = ({ title, type = "chart", className }) => {
  const icons = {
    chart: BarChart3,
    table: Database,
    metric: TrendingUp,
    map: Building2,
  }

  const Icon = icons[type]

  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 
        p-6 flex items-center justify-center min-h-[200px] animate-in fade-in-0 duration-300 ${className}
      `}
    >
      <div className="text-center space-y-4">
        <div className="animate-spin">
          <Icon className="w-8 h-8 text-[#4682B4] mx-auto" />
        </div>
        <div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Loading {title}</h3>
          <DataPulse />
        </div>
      </div>
    </div>
  )
}

// Smart skeleton components
export const SkylineTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-12 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg animate-pulse animate-in slide-in-from-left-4 duration-300"
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))}
  </div>
)

export const SkylineCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 animate-in fade-in-0 zoom-in-95 duration-300">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
    </div>
  </div>
)
