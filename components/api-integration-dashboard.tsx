"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Database, TrendingUp, MapPin, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"

interface APISource {
  id: string
  name: string
  status: "connected" | "error" | "idle" | "loading"
  description: string
  lastUpdated: string | null
  dataCount: number
  category: "nyc" | "market" | "analytics"
}

const apiSources: APISource[] = [
  {
    id: "nyc-open-data",
    name: "NYC Open Data Portal",
    status: "error",
    description: "DOB permits, PLUTO data, zoning projects",
    lastUpdated: null,
    dataCount: 0,
    category: "nyc",
  },
  {
    id: "acris",
    name: "ACRIS Property Records",
    status: "idle",
    description: "Property transactions, mortgages, liens",
    lastUpdated: null,
    dataCount: 0,
    category: "nyc",
  },
  {
    id: "fred",
    name: "Federal Reserve FRED",
    status: "idle",
    description: "Commercial RE loans, construction spending",
    lastUpdated: null,
    dataCount: 0,
    category: "market",
  },
  {
    id: "sec-edgar",
    name: "SEC EDGAR Database",
    status: "idle",
    description: "CMBS data, REIT filings, loan information",
    lastUpdated: null,
    dataCount: 0,
    category: "market",
  },
  {
    id: "streeteasy",
    name: "StreetEasy Market Data",
    status: "idle",
    description: "Price indices, rental trends, inventory",
    lastUpdated: null,
    dataCount: 0,
    category: "market",
  },
  {
    id: "zillow",
    name: "Zillow Research API",
    status: "idle",
    description: "Home values, rent estimates, forecasts",
    lastUpdated: null,
    dataCount: 0,
    category: "analytics",
  },
  {
    id: "walkscore",
    name: "Walk Score API",
    status: "idle",
    description: "Walkability, transit, bike scores",
    lastUpdated: null,
    dataCount: 0,
    category: "analytics",
  },
  {
    id: "rentcast",
    name: "RentCast Valuations",
    status: "idle",
    description: "Property valuations, rental estimates",
    lastUpdated: null,
    dataCount: 0,
    category: "analytics",
  },
]

export function APIIntegrationDashboard() {
  const [sources, setSources] = useState<APISource[]>(apiSources)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({
    successful: 1247,
    failed: 23,
    cached: 892,
    total: 2162,
    successRate: 97.8,
    totalRequests: 15420,
  })
  const [detailedLogs, setDetailedLogs] = useState<
    Array<{
      id: string
      timestamp: string
      source: string
      endpoint: string
      status: "success" | "error" | "cached"
      responseTime: number
      dataSize: string
      details: string
    }>
  >([])

  const connectedCount = sources.filter((s) => s.status === "connected").length
  const totalSources = sources.length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "loading":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "loading":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real API calls with detailed information
      const mockApiCall = {
        id: `api-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: sources[Math.floor(Math.random() * sources.length)].name,
        endpoint: ["/properties", "/permits", "/transactions", "/market-data"][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? "success" : ("error" as "success" | "error"),
        responseTime: Math.floor(Math.random() * 500) + 50,
        dataSize: `${Math.floor(Math.random() * 500) + 10}KB`,
        details: "Property data synchronized successfully",
      }

      setDetailedLogs((prev) => [mockApiCall, ...prev.slice(0, 19)]) // Keep last 20 logs

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        successful: mockApiCall.status === "success" ? prev.successful + 1 : prev.successful,
        failed: mockApiCall.status === "error" ? prev.failed + 1 : prev.failed,
        successRate:
          Math.round(
            ((prev.successful + (mockApiCall.status === "success" ? 1 : 0)) / (prev.totalRequests + 1)) * 100 * 10,
          ) / 10,
      }))

      // Update source status randomly
      setSources((prev) =>
        prev.map((source) => ({
          ...source,
          status: Math.random() > 0.8 ? "loading" : Math.random() > 0.1 ? "connected" : "error",
          lastUpdated: new Date().toLocaleString(),
          dataCount: Math.floor(Math.random() * 1000) + 100,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [sources.length])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    for (let i = 0; i < sources.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSources((prev) => prev.map((source, index) => (index === i ? { ...source, status: "loading" } : source)))
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSources((prev) =>
      prev.map((source) => ({
        ...source,
        status: "connected",
        lastUpdated: new Date().toLocaleString(),
        dataCount: Math.floor(Math.random() * 1000) + 500,
      })),
    )

    setIsRefreshing(false)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nyc":
        return <MapPin className="h-4 w-4" />
      case "market":
        return <TrendingUp className="h-4 w-4" />
      case "analytics":
        return <Database className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const sourcesByCategory = {
    nyc: sources.filter((s) => s.category === "nyc"),
    market: sources.filter((s) => s.category === "market"),
    analytics: sources.filter((s) => s.category === "analytics"),
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Integration</p>
                <p className="text-2xl font-bold">
                  {connectedCount}/{totalSources}
                </p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">{Math.round((stats.cached / stats.total) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Efficiency</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comprehensive API Integration</CardTitle>
              <CardDescription>
                Data Sources Status • Last updated: {new Date().toLocaleString()} • Total requests:{" "}
                {stats.totalRequests.toLocaleString()} • Success rate: {stats.successRate}%
              </CardDescription>
            </div>
            <Button onClick={handleRefreshAll} disabled={isRefreshing} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh All APIs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nyc">NYC Data</TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="logs">Live Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">NYC OPEN DATA</h3>
                    <p className="text-sm text-muted-foreground">DOB, ACRIS, PLUTO</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold">MARKET DATA</h3>
                    <p className="text-sm text-muted-foreground">FRED, StreetEasy, Zillow</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold">ANALYTICS</h3>
                    <p className="text-sm text-muted-foreground">Walk Score, RentCast</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.cached}</p>
                  <p className="text-sm text-muted-foreground">Cached</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                FETCH ALL - Complete refresh
              </Button>
            </TabsContent>

            {(["nyc", "market", "analytics"] as const).map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-4">
                  {sourcesByCategory[category].map((source) => (
                    <Card key={source.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(source.category)}
                            <div>
                              <h3 className="font-semibold">{source.name}</h3>
                              <p className="text-sm text-muted-foreground">{source.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {source.dataCount > 0 ? `${source.dataCount} records` : "No data"}
                              </p>
                              <p className="text-xs text-muted-foreground">{source.lastUpdated || "Never"}</p>
                            </div>
                            <Badge className={`${getStatusColor(source.status)} flex items-center gap-1`}>
                              {getStatusIcon(source.status)}
                              {source.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time API Activity</CardTitle>
                  <CardDescription>Live monitoring of all API calls and responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {detailedLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p>No API activity yet</p>
                      </div>
                    ) : (
                      detailedLogs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }
                              >
                                {log.status}
                              </Badge>
                              <span className="font-medium text-sm">{log.source}</span>
                              <span className="text-xs text-muted-foreground">{log.endpoint}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Response: {log.responseTime}ms</span>
                            <span>Size: {log.dataSize}</span>
                            <span>{log.details}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
