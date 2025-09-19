"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  TrendingUp,
  Building,
  DollarSign,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  AlertTriangle,
} from "lucide-react"
import { useAPIManager } from "@/hooks/use-api-manager"
import { useNotification } from "@/hooks/use-notification"

interface APIDataPanelProps {
  onDataUpdate?: (data: any) => void
}

export function APIDataPanel({ onDataUpdate }: APIDataPanelProps) {
  const { loading, error, data, stats, lastUpdated, fetchAllData, fetchNYCData, fetchMarketData, initializeAPI } =
    useAPIManager()

  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    initializeAPI()
  }, [initializeAPI])

  const handleFetchNYCData = async () => {
    try {
      const results = await fetchNYCData()
      showNotification("NYC Open Data fetched successfully!", "success")
      onDataUpdate?.(results)
    } catch (error) {
      showNotification("Failed to fetch NYC data", "error")
    }
  }

  const handleFetchMarketData = async () => {
    try {
      const results = await fetchMarketData()
      showNotification("Market data updated successfully!", "success")
      onDataUpdate?.(results)
    } catch (error) {
      showNotification("Failed to fetch market data", "error")
    }
  }

  const handleFetchAllData = async () => {
    try {
      const results = await fetchAllData()
      showNotification("All data sources updated!", "success")
      onDataUpdate?.(results)
    } catch (error) {
      showNotification("Failed to fetch all data", "error")
    }
  }

  const getStatusIcon = (success: boolean, cached?: boolean) => {
    if (cached) return <Clock className="h-4 w-4 text-yellow-500" />
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean, cached?: boolean) => {
    if (cached) return <Badge variant="secondary">Cached</Badge>
    return success ? <Badge variant="default">Live</Badge> : <Badge variant="destructive">Failed</Badge>
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          API Data Integration
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}</span>
          <span>Total requests: {stats.totalRequests}</span>
          <span>
            Success rate:{" "}
            {stats.totalRequests > 0 ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nyc">NYC Data</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleFetchNYCData}
                disabled={loading}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Building className="h-6 w-6" />
                <span className="font-medium">NYC OPEN DATA</span>
                <span className="text-xs opacity-75">DOB, ACRIS, PLUTO</span>
              </Button>

              <Button
                onClick={handleFetchMarketData}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-medium">MARKET DATA</span>
                <span className="text-xs opacity-75">FRED, StreetEasy, Zillow</span>
              </Button>

              <Button
                onClick={handleFetchAllData}
                disabled={loading}
                variant="secondary"
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <RefreshCw className={`h-6 w-6 ${loading ? "animate-spin" : ""}`} />
                <span className="font-medium">FETCH ALL</span>
                <span className="text-xs opacity-75">Complete refresh</span>
              </Button>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing API requests...</span>
                  <span>75%</span>
                </div>
                <Progress value={75} />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.successfulRequests}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.failedRequests}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.cachedRequests}</div>
                <div className="text-xs text-muted-foreground">Cached</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nyc" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.dobPermits?.success || false, data.dobPermits?.cached)}
                  <div>
                    <div className="font-medium">DOB Permits</div>
                    <div className="text-sm text-muted-foreground">Building permits and approvals</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.dobPermits?.success || false, data.dobPermits?.cached)}
                  <span className="text-sm">
                    {data.dobPermits?.data
                      ? `${Array.isArray(data.dobPermits.data) ? data.dobPermits.data.length : "N/A"} records`
                      : "No data"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.acrisRecords?.success || false, data.acrisRecords?.cached)}
                  <div>
                    <div className="font-medium">ACRIS Records</div>
                    <div className="text-sm text-muted-foreground">Property transactions and mortgages</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.acrisRecords?.success || false, data.acrisRecords?.cached)}
                  <span className="text-sm">
                    {data.acrisRecords?.data
                      ? `${Array.isArray(data.acrisRecords.data) ? data.acrisRecords.data.length : "N/A"} records`
                      : "No data"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.plutoData?.success || false, data.plutoData?.cached)}
                  <div>
                    <div className="font-medium">PLUTO Data</div>
                    <div className="text-sm text-muted-foreground">Property characteristics and zoning</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.plutoData?.success || false, data.plutoData?.cached)}
                  <span className="text-sm">
                    {data.plutoData?.data
                      ? `${Array.isArray(data.plutoData.data) ? data.plutoData.data.length : "N/A"} records`
                      : "No data"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.commercialLoans?.success || false, data.commercialLoans?.cached)}
                  <div>
                    <div className="font-medium">Commercial RE Loans</div>
                    <div className="text-sm text-muted-foreground">Federal Reserve lending data</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.commercialLoans?.success || false, data.commercialLoans?.cached)}
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.marketData?.success || false, data.marketData?.cached)}
                  <div>
                    <div className="font-medium">StreetEasy Market Data</div>
                    <div className="text-sm text-muted-foreground">Manhattan pricing and trends</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.marketData?.success || false, data.marketData?.cached)}
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.zhvi?.success || false, data.zhvi?.cached)}
                  <div>
                    <div className="font-medium">Zillow ZHVI</div>
                    <div className="text-sm text-muted-foreground">Home values and forecasts</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.zhvi?.success || false, data.zhvi?.cached)}
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
              </div>
            </div>

            {data.marketData?.success && data.marketData.data && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">
                    ${data.marketData.data.manhattan?.medianSalePrice?.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Median Sale Price</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">
                    ${data.marketData.data.manhattan?.medianRentPrice?.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Median Rent</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Data Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((stats.successfulRequests / Math.max(stats.totalRequests, 1)) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">API Success Rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Cache Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((stats.cachedRequests / Math.max(stats.totalRequests, 1)) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Cached Responses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Data Freshness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lastUpdated ? Math.round((Date.now() - lastUpdated) / 60000) : 0}m
                  </div>
                  <p className="text-xs text-muted-foreground">Minutes Since Update</p>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Data Integration Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>NYC Open Data APIs</span>
                  <Badge variant={data.dobPermits?.success ? "default" : "destructive"}>
                    {data.dobPermits?.success ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Federal Economic Data</span>
                  <Badge variant={data.commercialLoans?.success ? "default" : "destructive"}>
                    {data.commercialLoans?.success ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Market Intelligence</span>
                  <Badge variant={data.marketData?.success ? "default" : "destructive"}>
                    {data.marketData?.success ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
