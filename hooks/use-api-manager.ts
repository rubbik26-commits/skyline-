"use client"

import { useState, useCallback, useRef } from "react"
import { APIManager, type APIResponse } from "@/lib/api-clients"

export interface APIState {
  loading: boolean
  error: string | null
  lastUpdated: number | null
  data: {
    dobPermits: APIResponse | null
    acrisRecords: APIResponse | null
    plutoData: APIResponse | null
    commercialLoans: APIResponse | null
    constructionSpending: APIResponse | null
    marketData: APIResponse | null
    zhvi: APIResponse | null
  }
  stats: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    cachedRequests: number
  }
}

export function useAPIManager() {
  const apiManagerRef = useRef<APIManager | null>(null)
  const [state, setState] = useState<APIState>({
    loading: false,
    error: null,
    lastUpdated: null,
    data: {
      dobPermits: null,
      acrisRecords: null,
      plutoData: null,
      commercialLoans: null,
      constructionSpending: null,
      marketData: null,
      zhvi: null,
    },
    stats: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedRequests: 0,
    },
  })

  const initializeAPI = useCallback((options?: { nycAppToken?: string; fredApiKey?: string }) => {
    if (!apiManagerRef.current) {
      apiManagerRef.current = new APIManager(options)
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    if (!apiManagerRef.current) {
      initializeAPI()
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const results = await apiManagerRef.current!.fetchAllData()

      // Calculate stats
      const responses = Object.values(results)
      const totalRequests = responses.length
      const successfulRequests = responses.filter((r) => r.success).length
      const failedRequests = responses.filter((r) => !r.success).length
      const cachedRequests = responses.filter((r) => r.cached).length

      setState((prev) => ({
        ...prev,
        loading: false,
        data: results,
        lastUpdated: Date.now(),
        stats: {
          totalRequests: prev.stats.totalRequests + totalRequests,
          successfulRequests: prev.stats.successfulRequests + successfulRequests,
          failedRequests: prev.stats.failedRequests + failedRequests,
          cachedRequests: prev.stats.cachedRequests + cachedRequests,
        },
      }))

      return results
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }))
      throw error
    }
  }, [initializeAPI])

  const fetchNYCData = useCallback(async () => {
    if (!apiManagerRef.current) {
      initializeAPI()
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const nycClient = apiManagerRef.current!.getNYCClient()
      const [dobPermits, acrisRecords, plutoData] = await Promise.allSettled([
        nycClient.getDOBPermits(),
        nycClient.getACRISRecords(),
        nycClient.getPLUTOData(),
      ])

      const results = {
        dobPermits:
          dobPermits.status === "fulfilled"
            ? dobPermits.value
            : { data: null, success: false, error: "Failed to fetch", source: "DOB", timestamp: Date.now() },
        acrisRecords:
          acrisRecords.status === "fulfilled"
            ? acrisRecords.value
            : { data: null, success: false, error: "Failed to fetch", source: "ACRIS", timestamp: Date.now() },
        plutoData:
          plutoData.status === "fulfilled"
            ? plutoData.value
            : { data: null, success: false, error: "Failed to fetch", source: "PLUTO", timestamp: Date.now() },
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        data: { ...prev.data, ...results },
        lastUpdated: Date.now(),
        stats: {
          ...prev.stats,
          totalRequests: prev.stats.totalRequests + 3,
          successfulRequests: prev.stats.successfulRequests + Object.values(results).filter((r) => r.success).length,
          failedRequests: prev.stats.failedRequests + Object.values(results).filter((r) => !r.success).length,
          cachedRequests: prev.stats.cachedRequests + Object.values(results).filter((r) => r.cached).length,
        },
      }))

      return results
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }))
      throw error
    }
  }, [initializeAPI])

  const fetchMarketData = useCallback(async () => {
    if (!apiManagerRef.current) {
      initializeAPI()
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const fredClient = apiManagerRef.current!.getFREDClient()
      const streetEasyClient = apiManagerRef.current!.getStreetEasyClient()
      const zillowClient = apiManagerRef.current!.getZillowClient()

      const [commercialLoans, constructionSpending, marketData, zhvi] = await Promise.allSettled([
        fredClient.getCommercialRELoans(),
        fredClient.getConstructionSpending(),
        streetEasyClient.getMarketData(),
        zillowClient.getZHVI(),
      ])

      const results = {
        commercialLoans:
          commercialLoans.status === "fulfilled"
            ? commercialLoans.value
            : { data: null, success: false, error: "Failed to fetch", source: "FRED", timestamp: Date.now() },
        constructionSpending:
          constructionSpending.status === "fulfilled"
            ? constructionSpending.value
            : { data: null, success: false, error: "Failed to fetch", source: "FRED", timestamp: Date.now() },
        marketData:
          marketData.status === "fulfilled"
            ? marketData.value
            : { data: null, success: false, error: "Failed to fetch", source: "StreetEasy", timestamp: Date.now() },
        zhvi:
          zhvi.status === "fulfilled"
            ? zhvi.value
            : { data: null, success: false, error: "Failed to fetch", source: "Zillow", timestamp: Date.now() },
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        data: { ...prev.data, ...results },
        lastUpdated: Date.now(),
        stats: {
          ...prev.stats,
          totalRequests: prev.stats.totalRequests + 4,
          successfulRequests: prev.stats.successfulRequests + Object.values(results).filter((r) => r.success).length,
          failedRequests: prev.stats.failedRequests + Object.values(results).filter((r) => !r.success).length,
          cachedRequests: prev.stats.cachedRequests + Object.values(results).filter((r) => r.cached).length,
        },
      }))

      return results
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }))
      throw error
    }
  }, [initializeAPI])

  const clearCache = useCallback(() => {
    if (apiManagerRef.current) {
      // Clear all caches (would need to implement in API clients)
      setState((prev) => ({
        ...prev,
        stats: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          cachedRequests: 0,
        },
      }))
    }
  }, [])

  return {
    ...state,
    fetchAllData,
    fetchNYCData,
    fetchMarketData,
    clearCache,
    initializeAPI,
  }
}
