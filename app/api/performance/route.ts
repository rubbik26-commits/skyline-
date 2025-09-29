"use client"

import { type NextRequest, NextResponse } from "next/server"
import { advancedCacheManager } from "@/lib/advanced-cache-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "stats"

    switch (action) {
      case "stats":
        const stats = advancedCacheManager.getStats()
        const topEntries = advancedCacheManager.getTopEntries(10)

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          cache: {
            ...stats,
            topEntries,
          },
          system: {
            memory: process.memoryUsage ? process.memoryUsage() : null,
            uptime: process.uptime ? process.uptime() : null,
            platform: process.platform || "unknown",
            nodeVersion: process.version || "unknown",
          },
          performance: {
            loadTime: 0, // Would be calculated from actual metrics
            renderTime: 0,
            apiResponseTimes: {},
            componentRenderCounts: {},
          },
        })

      case "optimize":
        await advancedCacheManager.optimize()
        return NextResponse.json({
          success: true,
          message: "Cache optimization completed",
          timestamp: new Date().toISOString(),
        })

      case "clear":
        advancedCacheManager.clear()
        return NextResponse.json({
          success: true,
          message: "Cache cleared successfully",
          timestamp: new Date().toISOString(),
        })

      case "health":
        const healthStats = advancedCacheManager.getStats()
        const isHealthy = healthStats.hitRate > 70 && healthStats.memoryUsage < 150 * 1024 * 1024

        return NextResponse.json({
          success: true,
          healthy: isHealthy,
          status: isHealthy ? "operational" : "degraded",
          checks: {
            cacheHitRate: {
              status: healthStats.hitRate > 70 ? "pass" : "fail",
              value: `${healthStats.hitRate.toFixed(1)}%`,
              threshold: "70%",
            },
            memoryUsage: {
              status: healthStats.memoryUsage < 150 * 1024 * 1024 ? "pass" : "fail",
              value: healthStats.memoryUsageFormatted,
              threshold: "150MB",
            },
            cacheSize: {
              status: healthStats.size < 1500 ? "pass" : "warn",
              value: healthStats.size.toString(),
              threshold: "1500",
            },
          },
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported actions: stats, optimize, clear, health",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Performance API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, key, pattern, tag } = body

    switch (action) {
      case "invalidate":
        if (!key) {
          return NextResponse.json({ success: false, error: "Key is required for invalidation" }, { status: 400 })
        }
        const invalidated = advancedCacheManager.invalidate(key)
        return NextResponse.json({
          success: true,
          invalidated,
          message: invalidated ? "Key invalidated successfully" : "Key not found in cache",
        })

      case "invalidateByTag":
        if (!tag) {
          return NextResponse.json({ success: false, error: "Tag is required for tag invalidation" }, { status: 400 })
        }
        const tagInvalidated = advancedCacheManager.invalidateByTag(tag)
        return NextResponse.json({
          success: true,
          invalidated: tagInvalidated,
          message: `${tagInvalidated} entries invalidated by tag`,
        })

      case "invalidateByPattern":
        if (!pattern) {
          return NextResponse.json(
            { success: false, error: "Pattern is required for pattern invalidation" },
            { status: 400 },
          )
        }
        const regex = new RegExp(pattern)
        const patternInvalidated = advancedCacheManager.invalidateByPattern(regex)
        return NextResponse.json({
          success: true,
          invalidated: patternInvalidated,
          message: `${patternInvalidated} entries invalidated by pattern`,
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported actions: invalidate, invalidateByTag, invalidateByPattern",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Performance API POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
