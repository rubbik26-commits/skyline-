"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  TrendingUp,
  BarChart3,
  Monitor,
} from "lucide-react"
import dynamic from "next/dynamic"

const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

interface PerformanceMetrics {
  timestamp: string
  cpu: number
  memory: number
  network: number
  storage: number
  responseTime: number
  cacheHitRate: number
  apiCalls: number
  errors: number
  uptime: number
}

interface CacheMetrics {
  hitRate: number
  missRate: number
  size: number
  evictions: number
  totalRequests: number
  avgResponseTime: number
  topEndpoints: Array<{ endpoint: string; hits: number; avgTime: number }>
}

interface SystemAlert {
  id: string
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: string
  resolved: boolean
}

export function AdvancedPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    timestamp: new Date().toISOString(),
    cpu: 45,
    memory: 62,
    network: 78,
    storage: 34,
    responseTime: 120,
    cacheHitRate: 85,
    apiCalls: 1247,
    errors: 12,
    uptime: 99.8,
  })

  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    hitRate: 85.2,
    missRate: 14.8,
    size: 1024,
    evictions: 23,
    totalRequests: 15420,
    avgResponseTime: 145,
    topEndpoints: [
      { endpoint: "/api/properties", hits: 4521, avgTime: 120 },
      { endpoint: "/api/market-data", hits: 3892, avgTime: 180 },
      { endpoint: "/api/analytics", hits: 2847, avgTime: 95 },
      { endpoint: "/api/fred-data", hits: 1923, avgTime: 220 },
      { endpoint: "/api/sync-properties", hits: 1456, avgTime: 340 },
    ],
  })

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: "1",
      type: "warning",
      title: "High Memory Usage",
      message: "Memory usage has exceeded 80% for the last 5 minutes",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      resolved: false,
    },
    {
      id: "2",
      type: "info",
      title: "Cache Optimization",
      message: "Cache hit rate improved to 85.2% after recent optimizations",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      resolved: true,
    },
    {
      id: "3",
      type: "success",
      title: "API Performance",
      message: "All API endpoints responding within acceptable limits",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      resolved: true,
    },
  ])

  const [isMonitoring, setIsMonitoring] = useState(true)
  const [autoOptimize, setAutoOptimize] = useState(true)

  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      const newMetrics: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        cpu: Math.max(0, Math.min(100, currentMetrics.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, currentMetrics.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(0, Math.min(100, currentMetrics.network + (Math.random() - 0.5) * 15)),
        storage: Math.max(0, Math.min(100, currentMetrics.storage + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(50, Math.min(500, currentMetrics.responseTime + (Math.random() - 0.5) * 20)),
        cacheHitRate: Math.max(70, Math.min(95, currentMetrics.cacheHitRate + (Math.random() - 0.5) * 3)),
        apiCalls: currentMetrics.apiCalls + Math.floor(Math.random() * 10),
        errors: Math.max(0, currentMetrics.errors + (Math.random() > 0.9 ? 1 : 0)),
        uptime: Math.max(95, Math.min(100, currentMetrics.uptime + (Math.random() - 0.5) * 0.1)),
      }

      setCurrentMetrics(newMetrics)
      setMetrics((prev) => [newMetrics, ...prev.slice(0, 29)]) // Keep last 30 data points

      // Update cache metrics
      setCacheMetrics((prev) => ({
        ...prev,
        hitRate: newMetrics.cacheHitRate,
        missRate: 100 - newMetrics.cacheHitRate,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 5),
        avgResponseTime: newMetrics.responseTime,
      }))

      // Generate alerts based on metrics
      if (newMetrics.memory > 85 && !alerts.some((a) => a.title === "Critical Memory Usage" && !a.resolved)) {
        const newAlert: SystemAlert = {
          id: Date.now().toString(),
          type: "error",
          title: "Critical Memory Usage",
          message: `Memory usage at ${newMetrics.memory.toFixed(1)}% - immediate attention required`,
          timestamp: new Date().toISOString(),
          resolved: false,
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
      }

      if (newMetrics.responseTime > 300 && !alerts.some((a) => a.title === "Slow API Response" && !a.resolved)) {
        const newAlert: SystemAlert = {
          id: Date.now().toString(),
          type: "warning",
          title: "Slow API Response",
          message: `Average response time: ${newMetrics.responseTime.toFixed(0)}ms`,
          timestamp: new Date().toISOString(),
          resolved: false,
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
      }

      // Auto-optimization
      if (autoOptimize && newMetrics.cacheHitRate < 80) {
        console.log("[v0] Auto-optimization: Improving cache strategy")
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring, currentMetrics, alerts, autoOptimize])

  const getStatusColor = (value: number, isResponseTime = false, isCacheHit = false) => {
    if (isResponseTime) {
      if (value < 150) return "text-green-500"
      if (value < 300) return "text-yellow-500"
      return "text-red-500"
    }
    if (isCacheHit) {
      if (value > 85) return "text-green-500"
      if (value > 70) return "text-yellow-500"
      return "text-red-500"
    }
    if (value < 50) return "text-green-500"
    if (value < 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const handleOptimizeCache = async () => {
    console.log("[v0] Optimizing cache performance...")
    setCacheMetrics((prev) => ({
      ...prev,
      hitRate: Math.min(95, prev.hitRate + 5),
      avgResponseTime: Math.max(80, prev.avgResponseTime - 20),
    }))

    const optimizationAlert: SystemAlert = {
      id: Date.now().toString(),
      type: "success",
      title: "Cache Optimized",
      message: "Cache performance optimization completed successfully",
      timestamp: new Date().toISOString(),
      resolved: true,
    }
    setAlerts((prev) => [optimizationAlert, ...prev.slice(0, 9)])
  }

  const handleClearCache = async () => {
    console.log("[v0] Clearing cache...")
    setCacheMetrics((prev) => ({
      ...prev,
      size: 0,
      evictions: prev.evictions + prev.size,
      hitRate: 0,
    }))

    setTimeout(() => {
      setCacheMetrics((prev) => ({
        ...prev,
        hitRate: 75, // Cache rebuilds gradually
      }))
    }, 2000)
  }

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-500" />
              Advanced Performance Monitoring
              {isMonitoring && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoOptimize(!autoOptimize)}
                className={autoOptimize ? "bg-green-50 border-green-200" : ""}
              >
                {autoOptimize ? "Auto-Optimize On" : "Auto-Optimize Off"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? "bg-blue-50 border-blue-200" : ""}
              >
                {isMonitoring ? "Monitoring" : "Paused"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(currentMetrics.cpu)}`}>
                {currentMetrics.cpu.toFixed(1)}%
              </span>
            </div>
            <Progress value={currentMetrics.cpu} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              {currentMetrics.cpu > 80 ? "High load detected" : "Normal operation"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(currentMetrics.memory)}`}>
                {currentMetrics.memory.toFixed(1)}%
              </span>
            </div>
            <Progress value={currentMetrics.memory} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              {currentMetrics.memory > 85 ? "Critical - optimize now" : "Within limits"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(currentMetrics.responseTime, true)}`}>
                {currentMetrics.responseTime.toFixed(0)}ms
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentMetrics.responseTime < 150
                ? "Excellent"
                : currentMetrics.responseTime < 300
                  ? "Good"
                  : "Needs attention"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Cache Hit Rate</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(currentMetrics.cacheHitRate, false, true)}`}>
                {currentMetrics.cacheHitRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={currentMetrics.cacheHitRate} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              {currentMetrics.cacheHitRate > 85 ? "Optimal" : "Room for improvement"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="cache">Cache Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.slice().reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        fontSize={10}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                      <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} name="Memory %" />
                      <Line
                        type="monotone"
                        dataKey="cacheHitRate"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Cache Hit %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.slice().reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        fontSize={10}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.3}
                        name="Response Time (ms)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentMetrics.apiCalls.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">API Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{currentMetrics.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentMetrics.uptime.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{cacheMetrics.size}</div>
                  <div className="text-sm text-muted-foreground">Cache Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {cacheMetrics.totalRequests.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{cacheMetrics.evictions}</div>
                  <div className="text-sm text-muted-foreground">Cache Evictions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{cacheMetrics.hitRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Hit Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{cacheMetrics.missRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Miss Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Size</span>
                    <span className="text-sm font-mono">{cacheMetrics.size} entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="text-sm font-mono">{cacheMetrics.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Evictions</span>
                    <span className="text-sm font-mono">{cacheMetrics.evictions}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleOptimizeCache} size="sm" className="flex-1">
                    <Zap className="h-4 w-4 mr-1" />
                    Optimize
                  </Button>
                  <Button onClick={handleClearCache} variant="outline" size="sm" className="flex-1 bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Cached Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {cacheMetrics.topEndpoints.map((endpoint, index) => (
                      <div key={endpoint.endpoint} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{endpoint.endpoint}</div>
                          <div className="text-xs text-muted-foreground">{endpoint.hits} hits</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono">{endpoint.avgTime}ms</div>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No active alerts</p>
                      <p className="text-sm">System is running smoothly</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-lg ${getAlertColor(alert.type)} ${
                          alert.resolved ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div>
                              <h4 className="font-medium">{alert.title}</h4>
                              <p className="text-sm mt-1">{alert.message}</p>
                              <p className="text-xs mt-2 opacity-70">{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {alert.resolved ? (
                              <Badge variant="outline" className="text-xs">
                                Resolved
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Cache Optimization</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Current cache hit rate of {cacheMetrics.hitRate.toFixed(1)}% is excellent. Consider implementing
                      predictive caching for further improvements.
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Memory Management</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Memory usage at {currentMetrics.memory.toFixed(1)}%. Consider implementing garbage collection
                      optimization if it exceeds 85%.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">API Response Time</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Average response time of {currentMetrics.responseTime.toFixed(0)}ms is within acceptable limits.
                      Monitor for any spikes above 300ms.
                    </p>
                  </div>
                </div>

                <Button className="w-full" onClick={handleOptimizeCache}>
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Optimizations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Optimization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto Cache Optimization</span>
                    <Badge variant={autoOptimize ? "default" : "outline"}>
                      {autoOptimize ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Cleanup</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance Monitoring</span>
                    <Badge variant={isMonitoring ? "default" : "outline"}>{isMonitoring ? "Active" : "Paused"}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Alert Notifications</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Optimization Thresholds</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CPU Usage Alert</span>
                      <span className="font-mono">80%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage Alert</span>
                      <span className="font-mono">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time Alert</span>
                      <span className="font-mono">300ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Hit Rate Target</span>
                      <span className="font-mono">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-medium">Daily Report</h3>
                    <p className="text-sm text-muted-foreground">Last 24 hours</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Generate
                    </Button>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-medium">Weekly Report</h3>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Generate
                    </Button>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-medium">Monthly Report</h3>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Recent Performance Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg CPU Usage</span>
                      <div className="font-mono font-medium">{currentMetrics.cpu.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Memory Usage</span>
                      <div className="font-mono font-medium">{currentMetrics.memory.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Response Time</span>
                      <div className="font-mono font-medium">{currentMetrics.responseTime.toFixed(0)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cache Efficiency</span>
                      <div className="font-mono font-medium">{cacheMetrics.hitRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
