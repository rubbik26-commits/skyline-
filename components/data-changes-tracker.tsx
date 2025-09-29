"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, TrendingDown, RefreshCw, Clock, Database } from "lucide-react"

interface DataChange {
  id: string
  timestamp: string
  source: string
  type: "update" | "new" | "delete" | "sync"
  description: string
  impact: "high" | "medium" | "low"
  details: {
    before?: any
    after?: any
    count?: number
    affected?: string[]
    changeReason?: string
    financialImpact?: string
    permitDetails?: string
    filingDate?: string
    estimatedValue?: string
    marketImpact?: string
    analysisUpdate?: string
    priceChange?: string
    demandIndicator?: string
  }
}

export function DataChangesTracker() {
  const [changes, setChanges] = useState<DataChange[]>([])
  const [isTracking, setIsTracking] = useState(true)
  const [lastSync, setLastSync] = useState<string>(new Date().toISOString())
  const [changeStats, setChangeStats] = useState({
    totalChanges: 0,
    highImpact: 0,
    mediumImpact: 0,
    lowImpact: 0,
    propertiesAffected: 0,
    dataSourcesActive: 8,
  })

  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      const mockChanges: DataChange[] = [
        {
          id: `change-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          source: "NYC Open Data Portal",
          type: "update",
          description: "Property status updated from Projected to Underway",
          impact: "high",
          details: {
            before: { status: "Projected", units: 150, estimatedCompletion: "Q4 2024" },
            after: { status: "Underway", units: 150, estimatedCompletion: "Q2 2025" },
            affected: ["125 Greenwich Street"],
            changeReason: "Construction permit approved",
            financialImpact: "$2.3M valuation increase",
          },
        },
        {
          id: `change-${Date.now()}-2`,
          timestamp: new Date().toISOString(),
          source: "ACRIS Property Records",
          type: "new",
          description: "New conversion permit filed with detailed specifications",
          impact: "medium",
          details: {
            count: 1,
            affected: ["45 Wall Street"],
            permitDetails: "Office-to-residential conversion, 89 units",
            filingDate: new Date().toLocaleDateString(),
            estimatedValue: "$45M",
          },
        },
        {
          id: `change-${Date.now()}-3`,
          timestamp: new Date().toISOString(),
          source: "Federal Reserve FRED",
          type: "sync",
          description: "Interest rates updated - affecting conversion feasibility analysis",
          impact: "high",
          details: {
            before: { rate: "5.25%", trend: "stable" },
            after: { rate: "5.50%", trend: "rising" },
            affected: ["All projected conversions"],
            marketImpact: "Reduced feasibility for 12 projected properties",
            analysisUpdate: "ROI calculations refreshed for all properties",
          },
        },
        {
          id: `change-${Date.now()}-4`,
          timestamp: new Date().toISOString(),
          source: "StreetEasy Market Data",
          type: "update",
          description: "Rental market pricing updated for Financial District",
          impact: "medium",
          details: {
            before: { avgRent: "$4,200/month", occupancy: "94%" },
            after: { avgRent: "$4,350/month", occupancy: "96%" },
            affected: ["Financial District properties"],
            priceChange: "+3.6% month-over-month",
            demandIndicator: "High demand, low inventory",
          },
        },
      ]

      const randomChange = mockChanges[Math.floor(Math.random() * mockChanges.length)]
      setChanges((prev) => [randomChange, ...prev.slice(0, 49)])
      setLastSync(new Date().toISOString())

      setChangeStats((prev) => ({
        ...prev,
        totalChanges: prev.totalChanges + 1,
        highImpact: randomChange.impact === "high" ? prev.highImpact + 1 : prev.highImpact,
        mediumImpact: randomChange.impact === "medium" ? prev.mediumImpact + 1 : prev.mediumImpact,
        lowImpact: randomChange.impact === "low" ? prev.lowImpact + 1 : prev.lowImpact,
        propertiesAffected: prev.propertiesAffected + (randomChange.details.affected?.length || 1),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [isTracking])

  useEffect(() => {
    const initialChanges: DataChange[] = [
      {
        id: "init-1",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: "Skyline Analytics Engine",
        type: "sync",
        description: "Full data synchronization completed",
        impact: "high",
        details: {
          count: 116,
          affected: ["All properties"],
        },
      },
      {
        id: "init-2",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        source: "StreetEasy Market Data",
        type: "update",
        description: "Market pricing data refreshed for Financial District",
        impact: "medium",
        details: {
          before: { avgPrice: "$1,250/sqft" },
          after: { avgPrice: "$1,285/sqft" },
          affected: ["Financial District properties"],
        },
      },
    ]
    setChanges(initialChanges)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "update":
        return <TrendingUp className="h-4 w-4" />
      case "new":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "delete":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "sync":
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-[#4682B4]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#4682B4]">
            <Activity className="h-5 w-5" />
            Change Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#4682B4]">{changeStats.totalChanges}</p>
              <p className="text-xs text-muted-foreground">Total Changes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#4682B4]">{changeStats.propertiesAffected}</p>
              <p className="text-xs text-muted-foreground">Properties Affected</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">High Impact</span>
              <Badge className="bg-red-100 text-red-800">{changeStats.highImpact}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium Impact</span>
              <Badge className="bg-yellow-100 text-yellow-800">{changeStats.mediumImpact}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Low Impact</span>
              <Badge className="bg-green-100 text-green-800">{changeStats.lowImpact}</Badge>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm">Data Sources Active</span>
              <Badge variant="outline">{changeStats.dataSourcesActive}/8</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-[#4682B4]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#4682B4]">
            <Database className="h-5 w-5" />
            Live Data Changes
            <Badge variant="outline" className="ml-auto">
              {isTracking ? "Live" : "Paused"}
            </Badge>
          </CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last sync: {formatTimestamp(lastSync)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTracking(!isTracking)}
              className="border-[#4682B4]/30 text-[#4682B4] hover:bg-[#4682B4]/10"
            >
              {isTracking ? "Pause" : "Resume"} Tracking
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {changes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No data changes detected yet</p>
                  <p className="text-sm">Changes will appear here in real-time</p>
                </div>
              ) : (
                changes.map((change) => (
                  <div
                    key={change.id}
                    className="border border-[#4682B4]/10 rounded-lg p-4 hover:border-[#4682B4]/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTypeIcon(change.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {change.source}
                          </Badge>
                          <Badge className={`text-xs ${getImpactColor(change.impact)}`}>{change.impact} impact</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatTimestamp(change.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm font-medium mb-2">{change.description}</p>

                        {change.details && (
                          <div className="text-xs text-muted-foreground space-y-2 bg-muted/30 rounded p-3">
                            {change.details.before && change.details.after && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="font-medium">Before:</span>
                                  <div className="mt-1">
                                    {Object.entries(change.details.before).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span>{key}:</span>
                                        <span>{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">After:</span>
                                  <div className="mt-1">
                                    {Object.entries(change.details.after).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span>{key}:</span>
                                        <span>{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {change.details.count && (
                              <div>
                                <span className="font-medium">Records affected:</span> {change.details.count}
                              </div>
                            )}
                            {change.details.affected && (
                              <div>
                                <span className="font-medium">Affected properties:</span>{" "}
                                {change.details.affected.join(", ")}
                              </div>
                            )}
                            {change.details.changeReason && (
                              <div>
                                <span className="font-medium">Reason:</span> {change.details.changeReason}
                              </div>
                            )}
                            {change.details.financialImpact && (
                              <div>
                                <span className="font-medium">Financial Impact:</span> {change.details.financialImpact}
                              </div>
                            )}
                            {change.details.marketImpact && (
                              <div>
                                <span className="font-medium">Market Impact:</span> {change.details.marketImpact}
                              </div>
                            )}
                            {change.details.priceChange && (
                              <div>
                                <span className="font-medium">Price Change:</span> {change.details.priceChange}
                              </div>
                            )}
                            {change.details.demandIndicator && (
                              <div>
                                <span className="font-medium">Demand Indicator:</span> {change.details.demandIndicator}
                              </div>
                            )}
                          </div>
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
    </div>
  )
}
