"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Activity, MapPin, DollarSign, Building, Zap } from "lucide-react"

interface SubmarketData {
  name: string
  priceChange: number
  volume: number
  avgPrice: number
  properties: number
  conversionRate: number
  trend: "hot" | "warm" | "cool" | "cold"
  activity: "high" | "medium" | "low"
}

export function MarketHeatmap() {
  const [submarkets, setSubmarkets] = useState<SubmarketData[]>([
    {
      name: "Tribeca",
      priceChange: 8.2,
      volume: 245000000,
      avgPrice: 1850,
      properties: 12,
      conversionRate: 0.75,
      trend: "hot",
      activity: "high",
    },
    {
      name: "SoHo",
      priceChange: 6.1,
      volume: 189000000,
      avgPrice: 1650,
      properties: 18,
      conversionRate: 0.68,
      trend: "hot",
      activity: "high",
    },
    {
      name: "Financial District",
      priceChange: 4.3,
      volume: 312000000,
      avgPrice: 1200,
      properties: 28,
      conversionRate: 0.82,
      trend: "warm",
      activity: "high",
    },
    {
      name: "Midtown South",
      priceChange: 3.8,
      volume: 425000000,
      avgPrice: 1350,
      properties: 35,
      conversionRate: 0.71,
      trend: "warm",
      activity: "high",
    },
    {
      name: "Chelsea",
      priceChange: 2.1,
      volume: 156000000,
      avgPrice: 1450,
      properties: 22,
      conversionRate: 0.63,
      trend: "warm",
      activity: "medium",
    },
    {
      name: "Hell's Kitchen",
      priceChange: 5.7,
      volume: 98000000,
      avgPrice: 950,
      properties: 15,
      conversionRate: 0.58,
      trend: "hot",
      activity: "medium",
    },
    {
      name: "Upper East Side",
      priceChange: 1.2,
      volume: 87000000,
      avgPrice: 1100,
      properties: 8,
      conversionRate: 0.45,
      trend: "cool",
      activity: "low",
    },
    {
      name: "Lower East Side",
      priceChange: 7.3,
      volume: 76000000,
      avgPrice: 850,
      properties: 11,
      conversionRate: 0.52,
      trend: "hot",
      activity: "medium",
    },
  ])

  const [viewMode, setViewMode] = useState<"price" | "volume" | "conversion">("price")
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setSubmarkets((prev) =>
        prev.map((submarket) => ({
          ...submarket,
          priceChange: Math.max(-10, Math.min(15, submarket.priceChange + (Math.random() - 0.5) * 0.5)),
          volume: Math.max(0, submarket.volume + (Math.random() - 0.5) * 10000000),
          conversionRate: Math.max(0, Math.min(1, submarket.conversionRate + (Math.random() - 0.5) * 0.02)),
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "hot":
        return "bg-red-500"
      case "warm":
        return "bg-orange-500"
      case "cool":
        return "bg-blue-500"
      case "cold":
        return "bg-slate-500"
      default:
        return "bg-slate-500"
    }
  }

  const getTrendBadgeColor = (trend: string) => {
    switch (trend) {
      case "hot":
        return "bg-red-100 text-red-800 border-red-200"
      case "warm":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cool":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cold":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case "high":
        return <Zap className="h-3 w-3 text-green-500" />
      case "medium":
        return <Activity className="h-3 w-3 text-yellow-500" />
      case "low":
        return <Activity className="h-3 w-3 text-slate-500" />
      default:
        return <Activity className="h-3 w-3 text-slate-500" />
    }
  }

  const getHeatmapValue = (submarket: SubmarketData) => {
    switch (viewMode) {
      case "price":
        return submarket.priceChange
      case "volume":
        return submarket.volume / 1000000 // Convert to millions
      case "conversion":
        return submarket.conversionRate * 100
      default:
        return submarket.priceChange
    }
  }

  const getHeatmapColor = (value: number, mode: string) => {
    let intensity: number

    switch (mode) {
      case "price":
        intensity = Math.max(0, Math.min(1, (value + 5) / 20)) // -5 to 15 range
        break
      case "volume":
        intensity = Math.max(0, Math.min(1, value / 500)) // 0 to 500M range
        break
      case "conversion":
        intensity = Math.max(0, Math.min(1, value / 100)) // 0 to 100% range
        break
      default:
        intensity = 0.5
    }

    const red = Math.floor(255 * intensity)
    const green = Math.floor(255 * (1 - intensity))
    const blue = 100

    return `rgb(${red}, ${green}, ${blue})`
  }

  const sortedSubmarkets = [...submarkets].sort((a, b) => {
    const aValue = getHeatmapValue(a)
    const bValue = getHeatmapValue(b)
    return bValue - aValue
  })

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Manhattan Market Heatmap
            {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
          <Button variant={isLive ? "default" : "outline"} size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? "Live" : "Paused"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="price" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Price Change
            </TabsTrigger>
            <TabsTrigger value="volume" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="conversion" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Conversion Rate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {sortedSubmarkets.map((submarket, index) => (
                <div
                  key={submarket.name}
                  className="p-4 rounded-lg border hover:shadow-md transition-all duration-300"
                  style={{
                    backgroundColor: getHeatmapColor(getHeatmapValue(submarket), viewMode),
                    opacity: 0.8,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-white">{submarket.name}</h3>
                    <Badge className={`text-xs ${getTrendBadgeColor(submarket.trend)}`}>{submarket.trend}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Price Change:</span>
                      <div className="flex items-center gap-1">
                        {submarket.priceChange > 0 ? (
                          <TrendingUp className="h-3 w-3 text-white" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-white" />
                        )}
                        <span className="text-sm font-mono text-white">
                          {submarket.priceChange > 0 ? "+" : ""}
                          {submarket.priceChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Avg Price/SF:</span>
                      <span className="text-sm font-mono text-white">${submarket.avgPrice}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Properties:</span>
                      <span className="text-sm font-mono text-white">{submarket.properties}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Activity:</span>
                      <div className="flex items-center gap-1">
                        {getActivityIcon(submarket.activity)}
                        <span className="text-xs text-white capitalize">{submarket.activity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {sortedSubmarkets.map((submarket) => (
                <div
                  key={submarket.name}
                  className="p-4 rounded-lg border hover:shadow-md transition-all duration-300"
                  style={{
                    backgroundColor: getHeatmapColor(getHeatmapValue(submarket), viewMode),
                    opacity: 0.8,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-white">{submarket.name}</h3>
                    <Badge className={`text-xs ${getTrendBadgeColor(submarket.trend)}`}>{submarket.trend}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Volume:</span>
                      <span className="text-sm font-mono text-white">${(submarket.volume / 1000000).toFixed(0)}M</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Properties:</span>
                      <span className="text-sm font-mono text-white">{submarket.properties}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Avg Deal:</span>
                      <span className="text-sm font-mono text-white">
                        ${(submarket.volume / submarket.properties / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {sortedSubmarkets.map((submarket) => (
                <div
                  key={submarket.name}
                  className="p-4 rounded-lg border hover:shadow-md transition-all duration-300"
                  style={{
                    backgroundColor: getHeatmapColor(getHeatmapValue(submarket), viewMode),
                    opacity: 0.8,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-white">{submarket.name}</h3>
                    <Badge className={`text-xs ${getTrendBadgeColor(submarket.trend)}`}>{submarket.trend}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Conversion Rate:</span>
                      <span className="text-sm font-mono text-white">
                        {(submarket.conversionRate * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Properties:</span>
                      <span className="text-sm font-mono text-white">{submarket.properties}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">Converted:</span>
                      <span className="text-sm font-mono text-white">
                        {Math.floor(submarket.properties * submarket.conversionRate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium mb-2">Heat Map Legend</h4>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>High Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Medium Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Low Activity</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
