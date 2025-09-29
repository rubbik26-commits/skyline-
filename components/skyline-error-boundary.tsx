"use client"

import type React from "react"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, Building2, BarChart3, Database } from "lucide-react"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: "page" | "component" | "widget" | "chart"
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  isRecovering: boolean
}

export class SkylineErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private recoveryTimeoutId: NodeJS.Timeout | null = null

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isRecovering: false,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🏙️ Skyline Error in ${this.props.context || "Unknown"}:`, error, errorInfo)

    this.setState({ error, errorInfo })

    // Advanced error reporting
    this.reportError(error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Enhanced error tracking for Skyline
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: this.props.context,
      level: this.props.level,
      componentStack: errorInfo.componentStack,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
      sessionId: this.generateSessionId(),
    }

    // In production, send to your error tracking service
    if (process.env.NODE_ENV === "production") {
      console.log("🚨 Production Error Report:", errorReport)
    }
  }

  private generateSessionId = (): string => {
    return typeof window !== "undefined"
      ? `skyline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : "ssr_session"
  }

  private handleRetry = async () => {
    const maxRetries = 5

    if (this.state.retryCount >= maxRetries) {
      console.warn("🏙️ Skyline: Maximum retry attempts reached")
      return
    }

    this.setState((prevState) => ({
      retryCount: prevState.retryCount + 1,
      isRecovering: true,
    }))

    // Progressive retry delays (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000)

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
      })
    }, delay)
  }

  private handleReload = () => {
    if (typeof window !== "undefined") {
      // Smooth reload with loading indicator
      this.setState({ isRecovering: true })
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }

  private renderSkylineErrorUI = () => {
    const { level = "page", context = "Unknown Component" } = this.props
    const { retryCount, isRecovering, error } = this.state
    const maxRetries = 5

    const errorIcons = {
      page: Building2,
      component: BarChart3,
      widget: Database,
      chart: BarChart3,
    }

    const ErrorIcon = errorIcons[level] || AlertTriangle

    return (
      <div
        className={`
          ${level === "page" ? "min-h-[60vh]" : "min-h-[200px]"} 
          flex items-center justify-center p-6
          bg-gradient-to-br from-slate-50 to-blue-50 
          dark:from-slate-900 dark:to-blue-950 
          border border-slate-200 dark:border-slate-700 rounded-xl
          animate-in fade-in-0 zoom-in-95 duration-300
        `}
      >
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className={isRecovering ? "animate-spin" : ""}>
            <ErrorIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🏙️ Skyline {level === "page" ? "Dashboard" : context} Issue
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {level === "page"
                ? "Our Manhattan analytics encountered a temporary issue. Don't worry - your data is safe."
                : `The ${context} component needs a moment to recover. This won't affect other dashboard features.`}
            </p>

            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
                <summary className="cursor-pointer font-medium text-sm">🔧 Developer Info</summary>
                <pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 overflow-auto">{error.message}</pre>
              </details>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleRetry}
              disabled={retryCount >= maxRetries || isRecovering}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#4682B4] text-white rounded-lg hover:bg-[#5B9BD5] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isRecovering ? "animate-spin" : ""}`} />
              {isRecovering
                ? "Recovering..."
                : retryCount >= maxRetries
                  ? "Recovery limit reached"
                  : `Retry ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ""}`}
            </button>

            {level === "page" && (
              <button
                onClick={this.handleReload}
                disabled={isRecovering}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              >
                <Home className="w-4 h-4" />
                Refresh Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  public componentWillUnmount() {
    if (this.retryTimeoutId) clearTimeout(this.retryTimeoutId)
    if (this.recoveryTimeoutId) clearTimeout(this.recoveryTimeoutId)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return this.renderSkylineErrorUI()
    }

    return this.props.children
  }
}

// Specialized Error Boundaries for Skyline
export const SkylinePageBoundary: React.FC<Omit<Props, "level">> = (props) => (
  <SkylineErrorBoundary {...props} level="page" context="Dashboard" />
)

export const SkylineWidgetBoundary: React.FC<Omit<Props, "level"> & { widgetName: string }> = ({
  widgetName,
  ...props
}) => <SkylineErrorBoundary {...props} level="widget" context={widgetName} />

export const SkylineChartBoundary: React.FC<Omit<Props, "level"> & { chartName: string }> = ({
  chartName,
  ...props
}) => <SkylineErrorBoundary {...props} level="chart" context={chartName} />
