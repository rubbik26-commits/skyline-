"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Server,
  Database,
  Globe,
} from "lucide-react"
import { useDeploymentOptimization } from "@/lib/deployment-optimizer"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy" | "error"
  score: number
  timestamp: string
  responseTime: number
  checks: {
    performance: any
    api: any
    database: any
    externalApis: any[]
  }
  environment: any
}

export function DeploymentStatusWidget() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { metrics: optimizationMetrics, loading: optimizationLoading } = useDeploymentOptimization()

  const fetchHealthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthStatus(data)
      setLastUpdated(new Date())
      console.log("[v0] Health status updated:", data.status, data.score)
    } catch (error) {
      console.error("[v0] Failed to fetch health status:", error)
      setHealthStatus({
        status: "error",
        score: 0,
        timestamp: new Date().toISOString(),
        responseTime: 0,
        checks: {
          performance: { status: "error" },
          api: { status: "error" },
          database: { status: "error" },
          externalApis: [],
        },
        environment: {},
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "unhealthy":
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "pass":
        return "bg-green-500"
      case "degraded":
      case "warn":
        return "bg-yellow-500"
      case "unhealthy":
      case "fail":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading && !healthStatus) {
    return (
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-sm">
            <Activity className="h-4 w-4 animate-pulse" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-blue-600 text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon(healthStatus?.status || "error")}
            System Health
          </div>
          <Button variant="ghost" size="sm" onClick={fetchHealthStatus} disabled={loading} className="h-6 w-6 p-0">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(healthStatus?.status || "error")}`} />
            <span className="text-sm font-medium capitalize">{healthStatus?.status || "Unknown"}</span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getScoreColor(healthStatus?.score || 0)}`}>
              {healthStatus?.score || 0}/100
            </div>
            <div className="text-xs text-gray-500">{healthStatus?.responseTime}ms</div>
          </div>
        </div>

        {/* Health Score Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Health Score</span>
            <span>{healthStatus?.score || 0}%</span>
          </div>
          <Progress value={healthStatus?.score || 0} className="h-2" />
        </div>

        {/* System Checks */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">System Checks</div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>Performance</span>
              {getStatusIcon(healthStatus?.checks.performance.status)}
            </div>

            <div className="flex items-center gap-2">
              <Server className="h-3 w-3" />
              <span>API</span>
              {getStatusIcon(healthStatus?.checks.api.status)}
            </div>

            <div className="flex items-center gap-2">
              <Database className="h-3 w-3" />
              <span>Database</span>
              {getStatusIcon(healthStatus?.checks.database.status)}
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              <span>External APIs</span>
              {Array.isArray(healthStatus?.checks.externalApis) &&
              healthStatus.checks.externalApis.every((api) => api.status === "pass") ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {/* Optimization Metrics */}
        {optimizationMetrics && !optimizationLoading && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-gray-600">Optimization</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Performance:</span>
                <span className={`ml-1 font-medium ${getScoreColor(optimizationMetrics.performanceScore)}`}>
                  {optimizationMetrics.performanceScore}/100
                </span>
              </div>
              <div>
                <span className="text-gray-500">Cache Hit:</span>
                <span className="ml-1 font-medium">{(optimizationMetrics.cacheHitRate * 100).toFixed(0)}%</span>
              </div>
            </div>

            {optimizationMetrics.recommendations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {optimizationMetrics.recommendations.slice(0, 2).map((rec, index) => (
                  <Badge
                    key={index}
                    variant={rec.type === "critical" ? "destructive" : rec.type === "warning" ? "secondary" : "outline"}
                    className="text-xs px-1 py-0"
                  >
                    {rec.category}
                  </Badge>
                ))}
                {optimizationMetrics.recommendations.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{optimizationMetrics.recommendations.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
