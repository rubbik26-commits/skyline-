import { NextResponse } from "next/server"
import { performanceMonitor } from "@/lib/performance-monitor"
import { skylineAPI } from "@/lib/skyline-api-orchestrator"

const moduleStartTime = Date.now()

export async function GET() {
  try {
    const startTime = Date.now()

    // Collect system metrics
    const performanceMetrics = performanceMonitor.getMetrics()
    const apiMetrics = skylineAPI.getMetrics()

    // Check database connectivity (simulated)
    const dbStatus = await checkDatabaseHealth()

    // Check external API connectivity
    const externalApiStatus = await checkExternalAPIs()

    // Calculate overall health score
    const healthScore = calculateHealthScore({
      performance: performanceMetrics,
      api: apiMetrics,
      database: dbStatus,
      externalApis: externalApiStatus,
    })

    const responseTime = Date.now() - startTime

    const healthReport = {
      status: healthScore > 80 ? "healthy" : healthScore > 60 ? "degraded" : "unhealthy",
      score: healthScore,
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        performance: {
          status: performanceMetrics.loadTime < 3000 ? "pass" : "fail",
          loadTime: performanceMetrics.loadTime,
          memoryUsage: performanceMetrics.memoryUsage,
          details: performanceMetrics,
        },
        api: {
          status: apiMetrics.cache.hitRate > 0.7 ? "pass" : "warn",
          cacheHitRate: apiMetrics.cache.hitRate,
          requests: apiMetrics.requests,
          errors: apiMetrics.errors,
          details: apiMetrics,
        },
        database: dbStatus,
        externalApis: externalApiStatus,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime:
          typeof process.uptime === "function" ? process.uptime() : Math.floor((Date.now() - moduleStartTime) / 1000),
        memoryUsage:
          typeof process.memoryUsage === "function"
            ? process.memoryUsage()
            : { rss: 0, heapUsed: 0, heapTotal: 0, external: 0, arrayBuffers: 0 },
        buildTime: process.env.VERCEL_BUILD_DURATION || "unknown",
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local",
      },
    }

    console.log("[v0] Health check completed:", {
      status: healthReport.status,
      score: healthScore,
      responseTime,
    })

    return NextResponse.json(healthReport, {
      status: healthScore > 60 ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("[v0] Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        score: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          performance: { status: "error" },
          api: { status: "error" },
          database: { status: "error" },
          externalApis: { status: "error" },
        },
      },
      { status: 500 },
    )
  }
}

async function checkDatabaseHealth() {
  try {
    // Simulate database health check
    const startTime = Date.now()

    // In a real implementation, this would check actual database connectivity
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))

    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 200 ? "pass" : "warn",
      responseTime,
      connections: Math.floor(Math.random() * 50) + 10,
      details: {
        type: "simulated",
        lastCheck: new Date().toISOString(),
      },
    }
  } catch (error) {
    return {
      status: "fail",
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: null,
    }
  }
}

async function checkExternalAPIs() {
  const apis = [
    { name: "NYC Open Data", url: "https://data.cityofnewyork.us" },
    { name: "Property API", url: process.env.PROPERTY_API_URL || "https://api.example.com" },
  ]

  const results = await Promise.allSettled(
    apis.map(async (api) => {
      const startTime = Date.now()
      try {
        // Simple connectivity check
        const response = await fetch(api.url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        })

        return {
          name: api.name,
          status: response.ok ? "pass" : "fail",
          responseTime: Date.now() - startTime,
          statusCode: response.status,
        }
      } catch (error) {
        return {
          name: api.name,
          status: "fail",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }),
  )

  return results.map((result, index) =>
    result.status === "fulfilled"
      ? result.value
      : {
          name: apis[index].name,
          status: "error",
          error: "Promise rejected",
        },
  )
}

function calculateHealthScore(checks: any): number {
  let score = 100

  // Performance checks (30% weight)
  const loadTime = checks.performance?.loadTime
  if (loadTime && !isNaN(loadTime) && isFinite(loadTime) && loadTime > 3000) {
    score -= 15
  }

  const memoryUsage = checks.performance?.memoryUsage
  if (memoryUsage && !isNaN(memoryUsage) && memoryUsage > 100 * 1024 * 1024) {
    score -= 10 // 100MB
  }

  const renderTime = checks.performance?.renderTime
  if (renderTime && !isNaN(renderTime) && renderTime > 1000) {
    score -= 5
  }

  // API checks (25% weight)
  const cacheHitRate = checks.api?.cache?.hitRate
  if (cacheHitRate !== undefined && !isNaN(cacheHitRate) && cacheHitRate < 0.7) {
    score -= 10
  }

  const apiRequests = checks.api?.requests || 1
  const apiErrors = checks.api?.errors || 0
  const errorRate = apiErrors / Math.max(apiRequests, 1)

  if (!isNaN(errorRate) && isFinite(errorRate) && errorRate > 0.05) {
    score -= 15 // >5% error rate
  }

  // Database checks (25% weight)
  if (checks.database?.status === "fail") {
    score -= 25
  } else if (checks.database?.status === "warn") {
    score -= 10
  }

  // External API checks (20% weight)
  if (Array.isArray(checks.externalApis)) {
    const failedApis = checks.externalApis.filter((api: any) => api.status === "fail").length
    score -= failedApis * 10
  }

  return Math.max(0, Math.min(100, score))
}
