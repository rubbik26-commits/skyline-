"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  Activity,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  PieChart,
} from "lucide-react"
import dynamic from "next/dynamic"

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false })
const LineChartComponent = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

interface EconomicIndicator {
  id: string
  name: string
  value: number | null
  change: number | null
  trend: "up" | "down" | "stable"
  impact: "positive" | "negative" | "neutral"
  lastUpdated: string
  unit: string
  description: string
}

interface FREDDataState {
  indicators: EconomicIndicator[]
  chartData: any[]
  isLoading: boolean
  error: string | null
  lastSync: Date | null
}

export function FederalReserveDashboard() {
  const [data, setData] = useState<FREDDataState>({
    indicators: [],
    chartData: [],
    isLoading: false,
    error: null,
    lastSync: null,
  })

  const [activeTab, setActiveTab] = useState("overview")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchFREDData = async (category: "all" | "real-estate" | "commercial" | "rates" | "economic") => {
    setData((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/fred-data?category=${category}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch FRED data: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch FRED data")
      }

      const fredData = result.data

      // Process the data into indicators
      const indicators: EconomicIndicator[] = []
      const chartData: any[] = []

      // Define indicator mappings
      const indicatorMappings: Record<string, { name: string; unit: string; description: string }> = {
        MORTGAGE30US: {
          name: "30-Year Mortgage Rate",
          unit: "%",
          description: "Average 30-year fixed mortgage rate affecting conversion financing",
        },
        FEDFUNDS: {
          name: "Federal Funds Rate",
          unit: "%",
          description: "Federal Reserve's benchmark interest rate",
        },
        HOUST: {
          name: "Housing Starts",
          unit: "Thousands",
          description: "New residential construction starts",
        },
        PERMIT: {
          name: "Building Permits",
          unit: "Thousands",
          description: "New private housing units authorized by building permits",
        },
        CREACBM027NBOG: {
          name: "Commercial RE Loans",
          unit: "Billions $",
          description: "Commercial real estate loans outstanding",
        },
        TLCOMCONS: {
          name: "Construction Spending",
          unit: "Billions $",
          description: "Total construction spending",
        },
        UNRATE: {
          name: "Unemployment Rate",
          unit: "%",
          description: "National unemployment rate",
        },
        GDP: {
          name: "GDP Growth",
          unit: "%",
          description: "Gross Domestic Product growth rate",
        },
        CPILFESL: {
          name: "Core Inflation",
          unit: "%",
          description: "Consumer Price Index excluding food and energy",
        },
        UMCSENT: {
          name: "Consumer Sentiment",
          unit: "Index",
          description: "University of Michigan Consumer Sentiment Index",
        },
      }

      const getLatestValue = (observations: any[]) => {
        const validObs = observations.find((obs) => obs.value !== ".")
        return validObs ? { value: Number.parseFloat(validObs.value), date: validObs.date } : null
      }

      const calculateTrend = (observations: any[]): "up" | "down" | "stable" => {
        const validObs = observations.filter((obs) => obs.value !== ".").slice(0, 3)
        if (validObs.length < 2) return "stable"

        const latest = Number.parseFloat(validObs[0].value)
        const previous = Number.parseFloat(validObs[1].value)
        const diff = latest - previous

        if (Math.abs(diff) < 0.01) return "stable"
        return diff > 0 ? "up" : "down"
      }

      const calculateYearOverYearChange = (observations: any[]): number | null => {
        const validObs = observations.filter((obs) => obs.value !== ".")
        if (validObs.length < 12) return null

        const latest = Number.parseFloat(validObs[0].value)
        const yearAgo = Number.parseFloat(validObs[11].value)

        return ((latest - yearAgo) / yearAgo) * 100
      }

      Object.entries(fredData).forEach(([seriesId, observations]) => {
        if (observations && observations.length > 0) {
          const mapping = indicatorMappings[seriesId]
          if (!mapping) return

          const latest = getLatestValue(observations)
          const trend = calculateTrend(observations)
          const yoyChange = calculateYearOverYearChange(observations)

          if (latest) {
            indicators.push({
              id: seriesId,
              name: mapping.name,
              value: latest.value,
              change: yoyChange,
              trend,
              impact: determineImpact(seriesId, trend, yoyChange),
              lastUpdated: latest.date,
              unit: mapping.unit,
              description: mapping.description,
            })

            // Add to chart data (last 12 months)
            const chartPoints = observations
              .slice(0, 12)
              .reverse()
              .map((obs) => ({
                date: new Date(obs.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                [seriesId]: obs.value !== "." ? Number.parseFloat(obs.value) : null,
                name: mapping.name,
              }))

            chartData.push(...chartPoints)
          }
        }
      })

      setData({
        indicators: indicators.sort((a, b) => a.name.localeCompare(b.name)),
        chartData,
        isLoading: false,
        error: null,
        lastSync: new Date(),
      })
    } catch (error) {
      console.error("FRED data fetch error:", error)
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch Federal Reserve data",
      }))
    }
  }

  const determineImpact = (
    seriesId: string,
    trend: string,
    change: number | null,
  ): "positive" | "negative" | "neutral" => {
    // Define impact logic based on series and real estate context
    const positiveUpTrends = ["HOUST", "PERMIT", "TLCOMCONS", "CREACBM027NBOG", "GDP", "UMCSENT"]
    const negativeUpTrends = ["MORTGAGE30US", "FEDFUNDS", "UNRATE", "CPILFESL"]

    if (change === null) return "neutral"

    if (positiveUpTrends.includes(seriesId)) {
      return trend === "up" ? "positive" : trend === "down" ? "negative" : "neutral"
    }

    if (negativeUpTrends.includes(seriesId)) {
      return trend === "up" ? "negative" : trend === "down" ? "positive" : "neutral"
    }

    return "neutral"
  }

  useEffect(() => {
    fetchFREDData("all")
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(
      () => {
        fetchFREDData("all")
      },
      30 * 60 * 1000,
    ) // Refresh every 30 minutes

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getTrendIcon = (trend: string, impact: string) => {
    const iconClass =
      impact === "positive" ? "text-green-500" : impact === "negative" ? "text-red-500" : "text-gray-500"

    switch (trend) {
      case "up":
        return <TrendingUp className={`h-4 w-4 ${iconClass}`} />
      case "down":
        return <TrendingDown className={`h-4 w-4 ${iconClass}`} />
      default:
        return <Activity className={`h-4 w-4 ${iconClass}`} />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return "N/A"

    if (unit === "Billions $") {
      return `$${(value / 1000).toFixed(1)}T`
    }
    if (unit === "Thousands") {
      return `${(value / 1000).toFixed(1)}M`
    }
    if (unit === "%") {
      return `${value.toFixed(1)}%`
    }
    if (unit === "Index") {
      return value.toFixed(1)
    }

    return value.toLocaleString()
  }

  const formatChange = (change: number | null) => {
    if (change === null) return "N/A"
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Federal Reserve Economic Data (FRED)
            {data.lastSync && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchFREDData("all")} disabled={data.isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${data.isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        {data.lastSync && (
          <p className="text-sm text-muted-foreground">Last updated: {data.lastSync.toLocaleString()}</p>
        )}
      </CardHeader>
      <CardContent>
        {data.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{data.error}</span>
          </div>
        )}

        {data.isLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Fetching latest Federal Reserve data...</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Interest Rates
            </TabsTrigger>
            <TabsTrigger value="housing" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Housing Market
            </TabsTrigger>
            <TabsTrigger value="economic" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Economic Context
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.indicators.slice(0, 6).map((indicator) => (
                <Card key={indicator.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground truncate">{indicator.name}</span>
                      {getTrendIcon(indicator.trend, indicator.impact)}
                    </div>
                    <div className="text-2xl font-bold mb-1">{formatValue(indicator.value, indicator.unit)}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">YoY: {formatChange(indicator.change)}</span>
                      <Badge className={`text-xs ${getImpactColor(indicator.impact)}`}>{indicator.impact}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real Estate Market Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.indicators.filter((i) => i.impact === "positive").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Positive Indicators</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.indicators.filter((i) => i.impact === "negative").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Negative Indicators</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {data.indicators.filter((i) => i.impact === "neutral").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Neutral Indicators</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Key Insights for Office-to-Residential Conversions:</h4>
                  <div className="space-y-2 text-sm">
                    {data.indicators.find((i) => i.id === "MORTGAGE30US") && (
                      <div className="p-2 bg-blue-50 rounded">
                        <strong>Financing Conditions:</strong> 30-year mortgage rates at{" "}
                        {formatValue(data.indicators.find((i) => i.id === "MORTGAGE30US")?.value || null, "%")}{" "}
                        {data.indicators.find((i) => i.id === "MORTGAGE30US")?.trend === "down"
                          ? "are declining, improving conversion project feasibility"
                          : "may impact conversion project financing costs"}
                      </div>
                    )}
                    {data.indicators.find((i) => i.id === "CREACBM027NBOG") && (
                      <div className="p-2 bg-green-50 rounded">
                        <strong>Commercial Lending:</strong> Commercial real estate loans{" "}
                        {data.indicators.find((i) => i.id === "CREACBM027NBOG")?.trend === "up"
                          ? "are increasing, indicating strong lending appetite for commercial projects"
                          : "show cautious lending environment for commercial real estate"}
                      </div>
                    )}
                    {data.indicators.find((i) => i.id === "TLCOMCONS") && (
                      <div className="p-2 bg-purple-50 rounded">
                        <strong>Construction Activity:</strong> Construction spending{" "}
                        {data.indicators.find((i) => i.id === "TLCOMCONS")?.trend === "up"
                          ? "is rising, supporting conversion project execution"
                          : "trends suggest potential construction cost pressures"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.indicators
                .filter((i) => ["MORTGAGE30US", "FEDFUNDS", "GS10", "TB3MS"].includes(i.id))
                .map((indicator) => (
                  <Card key={indicator.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{indicator.name}</span>
                        {getTrendIcon(indicator.trend, indicator.impact)}
                      </div>
                      <div className="text-3xl font-bold mb-2">{formatValue(indicator.value, indicator.unit)}</div>
                      <div className="text-sm text-muted-foreground mb-2">{indicator.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">YoY Change: {formatChange(indicator.change)}</span>
                        <Badge className={`text-xs ${getImpactColor(indicator.impact)}`}>{indicator.impact}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="housing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.indicators
                .filter((i) => ["HOUST", "PERMIT", "CREACBM027NBOG", "TLCOMCONS"].includes(i.id))
                .map((indicator) => (
                  <Card key={indicator.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{indicator.name}</span>
                        {getTrendIcon(indicator.trend, indicator.impact)}
                      </div>
                      <div className="text-3xl font-bold mb-2">{formatValue(indicator.value, indicator.unit)}</div>
                      <div className="text-sm text-muted-foreground mb-2">{indicator.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">YoY Change: {formatChange(indicator.change)}</span>
                        <Badge className={`text-xs ${getImpactColor(indicator.impact)}`}>{indicator.impact}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.indicators
                .filter((i) => ["GDP", "UNRATE", "CPILFESL", "UMCSENT"].includes(i.id))
                .map((indicator) => (
                  <Card key={indicator.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{indicator.name}</span>
                        {getTrendIcon(indicator.trend, indicator.impact)}
                      </div>
                      <div className="text-3xl font-bold mb-2">{formatValue(indicator.value, indicator.unit)}</div>
                      <div className="text-sm text-muted-foreground mb-2">{indicator.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">YoY Change: {formatChange(indicator.change)}</span>
                        <Badge className={`text-xs ${getImpactColor(indicator.impact)}`}>{indicator.impact}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* All Indicators Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">All Economic Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {data.indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getTrendIcon(indicator.trend, indicator.impact)}
                      <div>
                        <div className="font-medium">{indicator.name}</div>
                        <div className="text-xs text-muted-foreground">{indicator.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">{formatValue(indicator.value, indicator.unit)}</div>
                      <div className="text-xs text-muted-foreground">{formatChange(indicator.change)} YoY</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
