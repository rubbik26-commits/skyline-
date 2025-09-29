import { type NextRequest, NextResponse } from "next/server"
import { performanceMonitor } from "@/lib/performance-monitor"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get("detailed") === "true"

    console.log("[v0] Performance analytics request:", { detailed })

    const metrics = performanceMonitor.getMetrics()

    const response = {
      timestamp: new Date().toISOString(),
      performance: {
        loadTime: metrics.loadTime,
        memoryUsage: metrics.memoryUsage,
        apiResponseTimes: metrics.apiResponseTimes,
        componentRenderCounts: metrics.componentRenderCounts,
      },
      system: {
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      },
      recommendations: generatePerformanceRecommendations(metrics),
    }

    if (detailed) {
      response.performance = {
        ...response.performance,
        ...metrics,
      }
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("[v0] Performance analytics error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function generatePerformanceRecommendations(metrics: any) {
  const recommendations = []

  if (metrics.loadTime > 3000) {
    recommendations.push({
      type: "warning",
      message: "Page load time is above 3 seconds. Consider optimizing images and reducing bundle size.",
      priority: "high",
    })
  }

  if (metrics.memoryUsage > 50 * 1024 * 1024) {
    // 50MB
    recommendations.push({
      type: "warning",
      message: "Memory usage is high. Consider implementing virtual scrolling for large datasets.",
      priority: "medium",
    })
  }

  const avgApiTime =
    Object.values(metrics.apiResponseTimes).reduce((sum: number, time: any) => sum + time, 0) /
    Object.keys(metrics.apiResponseTimes).length

  if (avgApiTime > 1000) {
    recommendations.push({
      type: "info",
      message: "API response times are slow. Consider implementing caching strategies.",
      priority: "medium",
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      message: "Performance metrics are within acceptable ranges.",
      priority: "low",
    })
  }

  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "clear") {
      // Reset performance metrics
      console.log("[v0] Clearing performance metrics")
      return NextResponse.json({
        success: true,
        message: "Performance metrics cleared",
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "summary") {
      performanceMonitor.logSummary()
      return NextResponse.json({
        success: true,
        message: "Performance summary logged to console",
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        error: "Invalid action. Supported actions: clear, summary",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] Performance analytics POST error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
