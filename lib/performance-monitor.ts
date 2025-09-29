"use client"

import React from "react"

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
  apiResponseTimes: Record<string, number>
  componentRenderCounts: Record<string, number>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    apiResponseTimes: {},
    componentRenderCounts: {},
  }

  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    if (typeof window === "undefined") return

    // Navigation timing observer
    if ("PerformanceObserver" in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming
            const loadTime = navEntry.loadEventEnd - navEntry.navigationStart

            // Only update if we have valid timing data
            if (loadTime > 0 && !isNaN(loadTime) && isFinite(loadTime)) {
              this.metrics.loadTime = loadTime
              console.log("[v0] Page load time:", this.metrics.loadTime, "ms")
            }
          }
        })
      })
      navObserver.observe({ entryTypes: ["navigation"] })
      this.observers.push(navObserver)

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes("/api/")) {
            const apiName = entry.name.split("/api/")[1].split("?")[0]
            this.metrics.apiResponseTimes[apiName] = entry.duration
            console.log(`[v0] API ${apiName} response time:`, entry.duration, "ms")
          }
        })
      })
      resourceObserver.observe({ entryTypes: ["resource"] })
      this.observers.push(resourceObserver)
    }
  }

  trackComponentRender(componentName: string) {
    this.metrics.componentRenderCounts[componentName] = (this.metrics.componentRenderCounts[componentName] || 0) + 1

    console.log(`[v0] Component ${componentName} rendered ${this.metrics.componentRenderCounts[componentName]} times`)
  }

  trackMemoryUsage() {
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize
      console.log("[v0] Memory usage:", (memory.usedJSHeapSize / 1024 / 1024).toFixed(2), "MB")
    }
  }

  getMetrics(): PerformanceMetrics {
    this.trackMemoryUsage()
    return { ...this.metrics }
  }

  logSummary() {
    const metrics = this.getMetrics()
    console.group("[v0] Performance Summary")
    console.log("Load Time:", metrics.loadTime, "ms")
    console.log("Memory Usage:", (metrics.memoryUsage / 1024 / 1024).toFixed(2), "MB")
    console.log("API Response Times:", metrics.apiResponseTimes)
    console.log("Component Render Counts:", metrics.componentRenderCounts)
    console.groupEnd()
  }

  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    performanceMonitor.trackComponentRender(componentName)
  })

  React.useEffect(() => {
    return () => {
      if (componentName === "Dashboard") {
        performanceMonitor.logSummary()
      }
    }
  }, [componentName])
}

// Utility for measuring function execution time
export function measureExecutionTime<T>(fn: () => T, label: string): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`[v0] ${label} execution time:`, (end - start).toFixed(2), "ms")
  return result
}

// Utility for debouncing expensive operations
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
