interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  priority: number
  hitCount: number
}

interface RateLimitEntry {
  tokens: number
  lastRefill: number
  requests: number[]
}

export class SkylineCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 1000
  private hitCount = 0
  private missCount = 0

  set<T>(key: string, data: T, ttl = 300000, priority = 1): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLowPriority()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      priority,
      hitCount: 0,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.missCount++
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    entry.hitCount++
    this.hitCount++
    return entry.data
  }

  private evictLowPriority(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].priority - b[1].priority || a[1].hitCount - b[1].hitCount)

    const toEvict = entries.slice(0, Math.floor(this.maxSize * 0.1))
    toEvict.forEach(([key]) => this.cache.delete(key))
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount),
      hitCount: this.hitCount,
      missCount: this.missCount,
    }
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

export class SkylineRateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private defaultLimit = 100
  private windowMs = 60000

  isAllowed(key: string, limit: number = this.defaultLimit): boolean {
    const now = Date.now()
    let entry = this.limits.get(key)

    if (!entry) {
      entry = {
        tokens: limit,
        lastRefill: now,
        requests: [],
      }
      this.limits.set(key, entry)
    }

    // Refill tokens
    const timePassed = now - entry.lastRefill
    const tokensToAdd = Math.floor(timePassed / (this.windowMs / limit))
    entry.tokens = Math.min(limit, entry.tokens + tokensToAdd)
    entry.lastRefill = now

    // Clean old requests
    entry.requests = entry.requests.filter((time) => now - time < this.windowMs)

    if (entry.tokens > 0) {
      entry.tokens--
      entry.requests.push(now)
      return true
    }

    return false
  }

  getStats(key: string) {
    const entry = this.limits.get(key)
    if (!entry) return null

    return {
      tokens: entry.tokens,
      requests: entry.requests.length,
      nextRefill: entry.lastRefill + this.windowMs / this.defaultLimit,
    }
  }
}

export class SkylineAPIOrchestrator {
  private cache = new SkylineCache()
  private rateLimiter = new SkylineRateLimiter()
  private metrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    lastError: null as string | null,
  }

  async fetchWithCache<T>(url: string, options: RequestInit = {}, cacheKey?: string, ttl = 300000): Promise<T> {
    const key = cacheKey || `fetch:${url}:${JSON.stringify(options)}`

    // Check cache first
    const cached = this.cache.get<T>(key)
    if (cached) {
      return cached
    }

    // Check rate limit
    if (!this.rateLimiter.isAllowed(url)) {
      throw new Error("Rate limit exceeded")
    }

    const startTime = Date.now()
    this.metrics.requests++

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "Skyline-Manhattan-Dashboard/1.0",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful response
      this.cache.set(key, data, ttl, 2)

      // Update metrics
      const responseTime = Date.now() - startTime
      this.metrics.avgResponseTime = (this.metrics.avgResponseTime + responseTime) / 2

      return data
    } catch (error) {
      this.metrics.errors++
      this.metrics.lastError = error instanceof Error ? error.message : "Unknown error"
      throw error
    }
  }

  async fetchMarketData(source = "all") {
    return this.fetchWithCache(
      `/api/market-data?source=${source}`,
      {},
      `market-data:${source}`,
      600000, // 10 minutes
    )
  }

  async fetchProperties(filters: Record<string, string> = {}) {
    const params = new URLSearchParams(filters)
    return this.fetchWithCache(
      `/api/properties?${params}`,
      {},
      `properties:${params.toString()}`,
      300000, // 5 minutes
    )
  }

  async fetchAnalytics(timeframe = "30d") {
    return this.fetchWithCache(
      `/api/analytics?timeframe=${timeframe}`,
      {},
      `analytics:${timeframe}`,
      900000, // 15 minutes
    )
  }

  getMetrics() {
    return {
      ...this.metrics,
      cache: this.cache.getStats(),
      rateLimiter: {
        active: this.rateLimiter.getStats("default"),
      },
    }
  }

  invalidateCache(pattern?: string) {
    if (pattern) {
      this.cache.invalidatePattern(pattern)
    } else {
      this.cache.invalidatePattern(".*")
    }
  }
}

// Global instance
export const skylineAPI = new SkylineAPIOrchestrator()
