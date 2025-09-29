"use client"

import { useState, useEffect, useCallback } from "react"
import { skylineAPI } from "@/lib/skyline-api-orchestrator"

interface UseDataOptions {
  refreshInterval?: number
  retryCount?: number
  retryDelay?: number
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

export function useSkylineData<T>(fetcher: () => Promise<T>, dependencies: any[] = [], options: UseDataOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const { refreshInterval, retryCount = 3, retryDelay = 1000, onError, onSuccess } = options

  const fetchData = useCallback(
    async (attempt = 1) => {
      try {
        setLoading(true)
        setError(null)

        const result = await fetcher()
        setData(result)
        setLastFetch(new Date())
        onSuccess?.(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")

        if (attempt < retryCount) {
          setTimeout(() => fetchData(attempt + 1), retryDelay * attempt)
          return
        }

        setError(error)
        onError?.(error)
      } finally {
        setLoading(false)
      }
    },
    [fetcher, retryCount, retryDelay, onError, onSuccess],
  )

  useEffect(() => {
    fetchData()
  }, dependencies)

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    lastFetch,
    isStale: lastFetch ? Date.now() - lastFetch.getTime() > 300000 : true,
  }
}

export function useProperties(filters: Record<string, string> = {}) {
  return useSkylineData(
    () => skylineAPI.fetchProperties(filters),
    [JSON.stringify(filters)],
    { refreshInterval: 300000 }, // 5 minutes
  )
}

export function useAnalytics(timeframe = "30d") {
  return useSkylineData(
    () => skylineAPI.fetchAnalytics(timeframe),
    [timeframe],
    { refreshInterval: 900000 }, // 15 minutes
  )
}

export function useMarketData(source = "all") {
  return useSkylineData(
    () => skylineAPI.fetchMarketData(source),
    [source],
    { refreshInterval: 600000 }, // 10 minutes
  )
}
