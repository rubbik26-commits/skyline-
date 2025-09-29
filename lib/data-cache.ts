import { unstable_cache } from "next/cache"

export interface CacheConfig {
  revalidate?: number
  tags?: string[]
}

// Cache configuration for different data types
export const CACHE_CONFIGS = {
  properties: { revalidate: 300, tags: ["properties"] }, // 5 minutes
  marketData: { revalidate: 600, tags: ["market-data"] }, // 10 minutes
  analytics: { revalidate: 180, tags: ["analytics"] }, // 3 minutes
  comprehensive: { revalidate: 900, tags: ["comprehensive"] }, // 15 minutes
} as const

// Generic cached data fetcher
export function createCachedFetcher<T>(fetchFn: () => Promise<T>, cacheKey: string, config: CacheConfig = {}) {
  return unstable_cache(fetchFn, [cacheKey], {
    revalidate: config.revalidate || 300,
    tags: config.tags || [cacheKey],
  })
}

// Cached property data fetcher
export const getCachedProperties = unstable_cache(
  async (filters?: Record<string, any>) => {
    // Import here to avoid circular dependencies
    const { comprehensiveNYCPropertyData } = await import("@/data/comprehensive-nyc-property-data")

    let filtered = comprehensiveNYCPropertyData

    if (filters) {
      if (filters.borough && filters.borough !== "all") {
        filtered = filtered.filter((p) => p.borough === filters.borough)
      }
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter((p) => p.propertyCategory === filters.category)
      }
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter((p) => p.status === filters.status)
      }
    }

    return {
      properties: filtered,
      analytics: {
        totalValue: filtered.reduce((sum, p) => sum + (p.askingPrice || 0), 0),
        avgPricePerSF:
          filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / filtered.length : 0,
        avgCapRate: filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.capRate || 0), 0) / filtered.length : 0,
      },
      timestamp: new Date().toISOString(),
    }
  },
  ["properties"],
  CACHE_CONFIGS.properties,
)

// Cached market data fetcher
export const getCachedMarketData = unstable_cache(
  async () => {
    // Simulate external API calls with caching
    const marketData = {
      nyc_construction: {
        permits_issued: 1247,
        permits_pending: 892,
        average_processing_time: 45,
        trend: "increasing",
      },
      economic_indicators: {
        construction_spending: 2.4e9,
        commercial_loans: 1.8e9,
        interest_rates: 0.0525,
        unemployment: 0.034,
      },
      real_estate_market: {
        median_rent: 4200,
        vacancy_rate: 0.08,
        price_per_sqft: 1250,
        market_velocity: 0.72,
      },
      conversion_metrics: {
        success_rate: 0.87,
        average_timeline: 24,
        cost_per_unit: 185000,
        roi_projection: 0.15,
      },
    }

    return {
      data: marketData,
      timestamp: new Date().toISOString(),
    }
  },
  ["market-data"],
  CACHE_CONFIGS.marketData,
)

// Cache invalidation utilities
export async function invalidateCache(tags: string[]) {
  const { revalidateTag } = await import("next/cache")
  tags.forEach((tag) => revalidateTag(tag))
}

export async function invalidatePropertyCache() {
  await invalidateCache(["properties", "analytics"])
}

export async function invalidateMarketDataCache() {
  await invalidateCache(["market-data"])
}

// Performance monitoring utilities
export function trackDatasetGrowth() {
  return {
    totalProperties: 0, // Will be populated by actual data
    lastUpdated: new Date().toISOString(),
    buildDuration: process.env.VERCEL_BUILD_DURATION,
    cacheMetrics: {
      hitRate: 0.85, // Simulated cache hit rate
      missRate: 0.15,
    },
  }
}
