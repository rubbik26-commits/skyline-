"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Building,
  Zap,
} from "lucide-react"

interface PortfolioHolding {
  id: string
  property: {
    address: string
    submarket: string
    category: string
  }
  investment: number
  currentValue: number
  roi: number
  status: "performing" | "underperforming" | "outperforming"
  riskLevel: "low" | "medium" | "high"
  lastUpdated: Date
}

interface PortfolioMetrics {
  totalInvestment: number
  currentValue: number
  totalROI: number
  unrealizedGains: number
  diversificationScore: number
  riskScore: number
  performanceGrade: "A" | "B" | "C" | "D"
}

export function InvestmentPortfolioTracker() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    {
      id: "1",
      property: {
        address: "123 Broadway",
        submarket: "Financial District",
        category: "Office Buildings",
      },
      investment: 15000000,
      currentValue: 18500000,
      roi: 23.3,
      status: "outperforming",
      riskLevel: "medium",
      lastUpdated: new Date(),
    },
    {
      id: "2",
      property: {
        address: "456 Park Avenue",
        submarket: "Midtown South",
        category: "Mixed-Use Buildings",
      },
      investment: 22000000,
      currentValue: 24800000,
      roi: 12.7,
      status: "performing",
      riskLevel: "low",
      lastUpdated: new Date(),
    },
    {
      id: "3",
      property: {
        address: "789 Madison Avenue",
        submarket: "Upper East Side",
        category: "Development Sites",
      },
      investment: 8500000,
      currentValue: 7900000,
      roi: -7.1,
      status: "underperforming",
      riskLevel: "high",
      lastUpdated: new Date(),
    },
  ])

  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalInvestment: 45500000,
    currentValue: 51200000,
    totalROI: 12.5,
    unrealizedGains: 5700000,
    diversificationScore: 78,
    riskScore: 65,
    performanceGrade: "B",
  })

  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setHoldings((prev) =>
        prev.map((holding) => {
          const valueChange = (Math.random() - 0.5) * 0.02 // ±2% change
          const newValue = holding.currentValue * (1 + valueChange)
          const newROI = ((newValue - holding.investment) / holding.investment) * 100

          return {
            ...holding,
            currentValue: newValue,
            roi: newROI,
            status: newROI > 15 ? "outperforming" : newROI > 5 ? "performing" : "underperforming",
            lastUpdated: new Date(),
          }
        }),
      )

      // Update portfolio metrics
      setMetrics((prev) => {
        const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
        const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0)
        const totalROI = ((totalCurrentValue - totalInvestment) / totalInvestment) * 100

        return {
          ...prev,
          currentValue: totalCurrentValue,
          totalROI,
          unrealizedGains: totalCurrentValue - totalInvestment,
          performanceGrade: totalROI > 20 ? "A" : totalROI > 10 ? "B" : totalROI > 0 ? "C" : "D",
        }
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [isLive, holdings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "outperforming":
        return "bg-green-100 text-green-800 border-green-200"
      case "performing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "underperforming":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-slate-600"
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200"
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "D":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            Investment Portfolio Tracker
            {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
          <Button variant={isLive ? "default" : "outline"} size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? "Live" : "Paused"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${(metrics.currentValue / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">
                    Invested: ${(metrics.totalInvestment / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {metrics.totalROI > 0 ? "+" : ""}
                      {metrics.totalROI.toFixed(1)}%
                    </p>
                    {metrics.totalROI > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${(metrics.unrealizedGains / 1000000).toFixed(1)}M unrealized
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diversification</p>
                  <p className="text-2xl font-bold">{metrics.diversificationScore}/100</p>
                  <Progress value={metrics.diversificationScore} className="mt-1 h-2" />
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance</p>
                  <Badge className={`text-lg font-bold ${getGradeColor(metrics.performanceGrade)}`}>
                    Grade {metrics.performanceGrade}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Risk Score: {metrics.riskScore}/100</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-4">
            <div className="space-y-3">
              {holdings.map((holding) => (
                <Card key={holding.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{holding.property.address}</h3>
                        <p className="text-sm text-muted-foreground">
                          {holding.property.submarket} • {holding.property.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(holding.status)}`}>{holding.status}</Badge>
                        <Badge variant="outline" className={`text-xs ${getRiskColor(holding.riskLevel)}`}>
                          {holding.riskLevel} risk
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Investment:</span>
                        <p className="font-mono font-medium">${(holding.investment / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Value:</span>
                        <p className="font-mono font-medium">${(holding.currentValue / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROI:</span>
                        <div className="flex items-center gap-1">
                          {holding.roi > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <p className={`font-mono font-medium ${holding.roi > 0 ? "text-green-600" : "text-red-600"}`}>
                            {holding.roi > 0 ? "+" : ""}
                            {holding.roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gain/Loss:</span>
                        <p
                          className={`font-mono font-medium ${
                            holding.currentValue > holding.investment ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {holding.currentValue > holding.investment ? "+" : ""}$
                          {((holding.currentValue - holding.investment) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Last updated: {holding.lastUpdated.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {holding.status === "outperforming" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {holding.status === "underperforming" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Outperforming Assets</span>
                    <Badge className="bg-green-100 text-green-800">
                      {holdings.filter((h) => h.status === "outperforming").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Performing Assets</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {holdings.filter((h) => h.status === "performing").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Underperforming Assets</span>
                    <Badge className="bg-red-100 text-red-800">
                      {holdings.filter((h) => h.status === "underperforming").length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Low Risk Assets</span>
                    <Badge className="bg-green-100 text-green-800">
                      {holdings.filter((h) => h.riskLevel === "low").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium Risk Assets</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {holdings.filter((h) => h.riskLevel === "medium").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High Risk Assets</span>
                    <Badge className="bg-red-100 text-red-800">
                      {holdings.filter((h) => h.riskLevel === "high").length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Asset Allocation</h3>
                  <p className="text-2xl font-bold">{holdings.length}</p>
                  <p className="text-sm text-muted-foreground">Properties</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Avg ROI</h3>
                  <p className="text-2xl font-bold">
                    {(holdings.reduce((sum, h) => sum + h.roi, 0) / holdings.length).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Portfolio Average</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">Best Performer</h3>
                  <p className="text-2xl font-bold">+{Math.max(...holdings.map((h) => h.roi)).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Top ROI</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
