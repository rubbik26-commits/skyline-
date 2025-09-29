"use client"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  priority: number
  hitCount: number
  lastAccessed: number
  tags: string[]
  size: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalRequests: number
  hitRate: number
  avgResponseTime: number
  memoryUsage: number
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  maxMemoryUsage: number
  enableCompression: boolean
  enablePredictive: boolean
}

export class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    avgResponseTime: 0,
    memoryUsage: 0,
  }
  private config: CacheConfig
  private accessPatterns = new Map<string, number[]>()
  private compressionEnabled = false

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      maxMemoryUsage: config.maxMemoryUsage || 100 * 1024 * 1024, // 100MB
      enableCompression: config.enableCompression || false,
      enablePredictive: config.enablePredictive || true,
    }

    // Initialize compression if available
    if (this.config.enableCompression && typeof window !== "undefined" && "CompressionStream" in window) {
      this.compressionEnabled = true
    }

    // Start background cleanup
    this.startBackgroundCleanup()
  }

  async set<T>(
    key: string,
    data: T,
    options: Partial<{ ttl: number; priority: number; tags: string[] }> = {},
  ): Promise<void> {
    const ttl = options.ttl || this.config.defaultTTL
    const priority = options.priority || 1
    const tags = options.tags || []

    // Calculate data size
    const size = this.calculateSize(data)

    // Check memory limits
    if (this.stats.memoryUsage + size > this.config.maxMemoryUsage) {
      await this.evictByMemoryPressure(size)
    }

    // Check cache size limits
    if (this.cache.size >= this.config.maxSize) {
      await this.evictLowPriority()
    }

    // Compress data if enabled
    let processedData = data
    if (this.compressionEnabled && size > 1024) {
      // Only compress larger objects
      processedData = await this.compressData(data)
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      priority,
      hitCount: 0,
      lastAccessed: Date.now(),
      tags,
      size,
    }

    this.cache.set(key, entry)
    this.stats.memoryUsage += size

    // Track access patterns for predictive caching
    if (this.config.enablePredictive) {
      this.trackAccessPattern(key)
    }

    console.log(`[v0] Cache SET: ${key} (${size} bytes, TTL: ${ttl}ms)`)
  }

  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++
    const startTime = performance.now()

    const entry = this.cache.get(key)
    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      console.log(`[v0] Cache MISS: ${key}`)
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.memoryUsage -= entry.size
      this.stats.misses++
      this.updateHitRate()
      console.log(`[v0] Cache EXPIRED: ${key}`)
      return null
    }

    // Update access statistics
    entry.hitCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    // Decompress if needed
    let data = entry.data
    if (this.compressionEnabled && this.isCompressed(entry.data)) {
      data = await this.decompressData(entry.data)
    }

    const responseTime = performance.now() - startTime
    this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2

    this.updateHitRate()

    // Track access patterns
    if (this.config.enablePredictive) {
      this.trackAccessPattern(key)
      this.predictivePreload(key)
    }

    console.log(`[v0] Cache HIT: ${key} (${responseTime.toFixed(2)}ms)`)
    return data
  }

  invalidate(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.stats.memoryUsage -= entry.size
      console.log(`[v0] Cache INVALIDATE: ${key}`)
      return true
    }
    return false
  }

  invalidateByTag(tag: string): number {
    let invalidated = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        this.stats.memoryUsage -= entry.size
        invalidated++
      }
    }
    console.log(`[v0] Cache INVALIDATE BY TAG: ${tag} (${invalidated} entries)`)
    return invalidated
  }

  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        const entry = this.cache.get(key)!
        this.cache.delete(key)
        this.stats.memoryUsage -= entry.size
        invalidated++
      }
    }
    console.log(`[v0] Cache INVALIDATE BY PATTERN: ${pattern} (${invalidated} entries)`)
    return invalidated
  }

  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.stats.memoryUsage = 0
    this.accessPatterns.clear()
    console.log(`[v0] Cache CLEAR: ${size} entries removed`)
  }

  getStats(): CacheStats & { size: number; memoryUsageFormatted: string } {
    return {
      ...this.stats,
      size: this.cache.size,
      memoryUsageFormatted: this.formatBytes(this.stats.memoryUsage),
    }
  }

  getTopEntries(limit = 10): Array<{ key: string; hits: number; size: number; lastAccessed: string }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        hits: entry.hitCount,
        size: entry.size,
        lastAccessed: new Date(entry.lastAccessed).toLocaleString(),
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit)
  }

  optimize(): Promise<void> {
    return new Promise((resolve) => {
      console.log("[v0] Cache optimization started...")

      // Remove expired entries
      const expired = this.removeExpiredEntries()

      // Optimize memory usage
      const evicted = this.evictLowPriorityEntries()

      // Defragment if needed
      this.defragment()

      console.log(`[v0] Cache optimization completed: ${expired} expired, ${evicted} evicted`)
      resolve()
    })
  }

  private async evictByMemoryPressure(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => {
      // Sort by priority (lower first) and last accessed (older first)
      const priorityDiff = a[1].priority - b[1].priority
      if (priorityDiff !== 0) return priorityDiff
      return a[1].lastAccessed - b[1].lastAccessed
    })

    let freedMemory = 0
    let evicted = 0

    for (const [key, entry] of entries) {
      if (freedMemory >= requiredSize) break

      this.cache.delete(key)
      this.stats.memoryUsage -= entry.size
      freedMemory += entry.size
      evicted++
      this.stats.evictions++
    }

    console.log(`[v0] Memory pressure eviction: ${evicted} entries, ${this.formatBytes(freedMemory)} freed`)
  }

  private async evictLowPriority(): Promise<void> {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => {
      // Sort by priority and hit count
      const priorityDiff = a[1].priority - b[1].priority
      if (priorityDiff !== 0) return priorityDiff
      return a[1].hitCount - b[1].hitCount
    })

    const toEvict = Math.floor(this.config.maxSize * 0.1) // Evict 10%
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      const [key, entry] = entries[i]
      this.cache.delete(key)
      this.stats.memoryUsage -= entry.size
      this.stats.evictions++
    }

    console.log(`[v0] Low priority eviction: ${toEvict} entries`)
  }

  private removeExpiredEntries(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        this.stats.memoryUsage -= entry.size
        removed++
      }
    }

    return removed
  }

  private evictLowPriorityEntries(): number {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].priority - b[1].priority || a[1].hitCount - b[1].hitCount)

    const toEvict = Math.min(10, Math.floor(entries.length * 0.1))
    for (let i = 0; i < toEvict; i++) {
      const [key, entry] = entries[i]
      this.cache.delete(key)
      this.stats.memoryUsage -= entry.size
      this.stats.evictions++
    }

    return toEvict
  }

  private defragment(): void {
    // Simple defragmentation by recreating the map
    const entries = Array.from(this.cache.entries())
    this.cache.clear()
    entries.forEach(([key, entry]) => {
      this.cache.set(key, entry)
    })
  }

  private trackAccessPattern(key: string): void {
    const now = Date.now()
    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, [])
    }

    const pattern = this.accessPatterns.get(key)!
    pattern.push(now)

    // Keep only last 10 accesses
    if (pattern.length > 10) {
      pattern.shift()
    }
  }

  private predictivePreload(key: string): void {
    // Simple predictive logic - preload related keys
    const relatedKeys = Array.from(this.cache.keys()).filter((k) => k.startsWith(key.split(":")[0]))

    relatedKeys.slice(0, 3).forEach((relatedKey) => {
      if (!this.cache.has(relatedKey)) {
        // This would trigger a background fetch in a real implementation
        console.log(`[v0] Predictive preload candidate: ${relatedKey}`)
      }
    })
  }

  private calculateSize(data: any): number {
    // Rough size calculation
    const str = JSON.stringify(data)
    return new Blob([str]).size
  }

  private async compressData(data: any): Promise<any> {
    // Placeholder for compression logic
    return { __compressed: true, data: JSON.stringify(data) }
  }

  private async decompressData(compressedData: any): Promise<any> {
    // Placeholder for decompression logic
    if (compressedData.__compressed) {
      return JSON.parse(compressedData.data)
    }
    return compressedData
  }

  private isCompressed(data: any): boolean {
    return data && typeof data === "object" && data.__compressed === true
  }

  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 ? (this.stats.hits / this.stats.totalRequests) * 100 : 0
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  private startBackgroundCleanup(): void {
    setInterval(() => {
      this.removeExpiredEntries()
    }, 60000) // Clean up every minute
  }
}

// Global cache manager instance
export const advancedCacheManager = new AdvancedCacheManager({
  maxSize: 2000,
  defaultTTL: 300000, // 5 minutes
  maxMemoryUsage: 200 * 1024 * 1024, // 200MB
  enableCompression: true,
  enablePredictive: true,
})

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  ttl = 300000,
  keyGenerator?: (...args: Parameters<T>) => string,
) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: Parameters<T>) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache first
      const cached = await advancedCacheManager.get(key)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)

      // Cache the result
      await advancedCacheManager.set(key, result, { ttl })

      return result
    }

    return descriptor
  }
}
