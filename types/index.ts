import type React from "react"
export interface PropertyData {
  address: string
  submarket?: string
  units?: number
  gsf?: number
  type?: string
  status?: string
  notes?: string
  eligible?: boolean
  pressLink?: string
  lat?: number
  lng?: number
}

export interface APIResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: string
  timestamp: number
  cached?: boolean
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export interface RateLimiter {
  canMakeRequest(): boolean
  recordRequest(): void
  getWaitTime(): number
}

export interface FilterOptions {
  search?: string
  submarket?: string
  type?: string
  status?: string
  minUnits?: number
  maxUnits?: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface MarketData {
  manhattan: {
    medianSalePrice: number
    medianRentPrice: number
    priceChange: number
    rentChange: number
    inventory: number
    daysOnMarket: number
    pricePerSqFt: number
  }
  trends: {
    salesVolume: number
    newListings: number
    priceReductions: number
    closedSales: number
  }
}

export interface ZHVIData {
  manhattan: {
    currentValue: number
    monthlyChange: number
    yearlyChange: number
    forecast: {
      oneMonth: number
      threeMonth: number
      sixMonth: number
      oneYear: number
    }
  }
  rentIndex: {
    currentRent: number
    monthlyChange: number
    yearlyChange: number
  }
}

export interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export interface NotificationProps {
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}
