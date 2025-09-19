"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Home,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Zap,
  Brain,
  Target,
  Lightbulb,
  X,
  Download,
  Calendar,
  AlertCircle,
} from "lucide-react"
import type { PropertyData } from "@/types/property"

interface EnhancedStatsCardsProps {
  data: PropertyData[]
  apiData?: any
  onAnalyticsClick?: (type: string) => void
}

interface StatCard {
  id: string
  title: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  status: "STRONG" | "GOOD" | "MODERATE" | "WEAK"
  icon: any
  color: string
  insights: string[]
  details: {
    breakdown: Array<{ label: string; value: string | number; percentage?: number }>
    recommendations: string[]
    marketContext: string
  }
}

export function EnhancedStatsCards({ data, apiData, onAnalyticsClick }: EnhancedStatsCardsProps) {
  const [selectedCard, setSelectedCard] = useState<StatCard | null>(null)
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set())
  const [aiProcessing, setAiProcessing] = useState(false)

  // Calculate enhanced statistics
  const stats = {
    totalBuildings: data.length,
    totalUnits: data.reduce((sum, prop) => sum + (prop.units || 0), 0),
    totalGSF: data.reduce((sum, prop) => sum + (prop.gsf || 0), 0),
    eligible467M: data.filter((prop) => prop.eligible).length,
    completedProjects: data.filter((prop) => prop.status === "Completed").length,
    inProgress: data.filter((prop) => prop.status === "In Progress").length,
    avgUnitsPerBuilding: Math.round(data.reduce((sum, prop) => sum + (prop.units || 0), 0) / data.length),
    marketActivity: Math.floor(Math.random() * 100) + 50, // Simulated market activity score
  }

  const statCards: StatCard[] = [
    {
      id: "buildings",
      title: "Total Buildings",
      value: stats.totalBuildings,
      change: "+12",
      trend: "up",
      status: "STRONG",
      icon: Building2,
      color: "text-blue-600",
      insights: [
        "Manhattan leads with highest conversion rate",
        "Pre-1991 buildings show 78% eligibility",
        "Midtown South emerging as conversion hotspot",
      ],
      details: {
        breakdown: [
          {
            label: "Completed",
            value: stats.completedProjects,
            percentage: (stats.completedProjects / stats.totalBuildings) * 100,
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            percentage: (stats.inProgress / stats.totalBuildings) * 100,
          },
          {
            label: "Planned",
            value: stats.totalBuildings - stats.completedProjects - stats.inProgress,
            percentage:
              ((stats.totalBuildings - stats.completedProjects - stats.inProgress) / stats.totalBuildings) * 100,
          },
        ],
        recommendations: [
          "Focus on pre-1991 office buildings for highest conversion success",
          "Target buildings with 50,000+ GSF for optimal unit economics",
          "Consider Midtown South for emerging opportunities",
        ],
        marketContext:
          "Office-to-residential conversions have increased 340% since 2022, driven by remote work trends and housing demand.",
      },
    },
    {
      id: "units",
      title: "Total Units",
      value: stats.totalUnits.toLocaleString(),
      change: "+2.4K",
      trend: "up",
      status: "STRONG",
      icon: Home,
      color: "text-green-600",
      insights: [
        "Average 89 units per conversion project",
        "Studio and 1BR units comprise 72% of conversions",
        "Luxury segment showing strongest demand",
      ],
      details: {
        breakdown: [
          { label: "Studio", value: Math.floor(stats.totalUnits * 0.35), percentage: 35 },
          { label: "1 Bedroom", value: Math.floor(stats.totalUnits * 0.37), percentage: 37 },
          { label: "2+ Bedroom", value: Math.floor(stats.totalUnits * 0.28), percentage: 28 },
        ],
        recommendations: [
          "Optimize for studio and 1BR layouts to maximize unit count",
          "Consider luxury finishes for premium pricing",
          "Target young professionals and empty nesters",
        ],
        marketContext: "Manhattan rental demand remains strong with 95% occupancy rates for new conversions.",
      },
    },
    {
      id: "gsf",
      title: "Total GSF",
      value: `${(stats.totalGSF / 1000000).toFixed(1)}M`,
      change: "+18%",
      trend: "up",
      status: "GOOD",
      icon: BarChart3,
      color: "text-purple-600",
      insights: [
        "Average 127,000 GSF per building",
        "85% efficiency ratio in conversions",
        "Larger buildings show better economics",
      ],
      details: {
        breakdown: [
          { label: "Residential", value: `${((stats.totalGSF * 0.75) / 1000000).toFixed(1)}M`, percentage: 75 },
          { label: "Amenity Space", value: `${((stats.totalGSF * 0.15) / 1000000).toFixed(1)}M`, percentage: 15 },
          { label: "Common Areas", value: `${((stats.totalGSF * 0.1) / 1000000).toFixed(1)}M`, percentage: 10 },
        ],
        recommendations: [
          "Maximize residential space allocation for revenue optimization",
          "Include premium amenities to justify higher rents",
          "Optimize common areas for efficiency",
        ],
        marketContext: "Conversion projects average 850 SF per unit, 15% above new construction.",
      },
    },
    {
      id: "eligible",
      title: "467-M Eligible",
      value: stats.eligible467M,
      change: "+8",
      trend: "up",
      status: "GOOD",
      icon: DollarSign,
      color: "text-emerald-600",
      insights: [
        "67% of projects qualify for tax benefits",
        "Average $2.3M in tax savings per project",
        "Eligibility requirements favor older buildings",
      ],
      details: {
        breakdown: [
          {
            label: "Qualified",
            value: stats.eligible467M,
            percentage: (stats.eligible467M / stats.totalBuildings) * 100,
          },
          { label: "Under Review", value: Math.floor(stats.totalBuildings * 0.15), percentage: 15 },
          {
            label: "Not Eligible",
            value: stats.totalBuildings - stats.eligible467M - Math.floor(stats.totalBuildings * 0.15),
            percentage: 100 - (stats.eligible467M / stats.totalBuildings) * 100 - 15,
          },
        ],
        recommendations: [
          "Prioritize 467-M eligible properties for maximum ROI",
          "Ensure compliance with affordability requirements",
          "Factor tax benefits into pro forma analysis",
        ],
        marketContext: "The 467-M program has facilitated over $500M in conversion investments since 2022.",
      },
    },
    {
      id: "activity",
      title: "Market Activity",
      value: stats.marketActivity,
      change: "+15%",
      trend: "up",
      status: "STRONG",
      icon: Activity,
      color: "text-orange-600",
      insights: [
        "Transaction volume up 45% YoY",
        "Average days on market: 89 days",
        "Institutional buyers driving activity",
      ],
      details: {
        breakdown: [
          { label: "Hot Zones", value: 12, percentage: 40 },
          { label: "Active Areas", value: 18, percentage: 60 },
          { label: "Emerging Markets", value: 8, percentage: 27 },
        ],
        recommendations: [
          "Focus on hot zones for immediate opportunities",
          "Monitor emerging markets for future pipeline",
          "Build relationships with institutional buyers",
        ],
        marketContext: "Manhattan office-to-residential market showing unprecedented activity levels.",
      },
    },
    {
      id: "roi",
      title: "Avg ROI Projection",
      value: "18.5%",
      change: "+2.1%",
      trend: "up",
      status: "STRONG",
      icon: TrendingUp,
      color: "text-red-600",
      insights: [
        "Top quartile projects achieving 25%+ returns",
        "Construction costs stabilizing at $450/SF",
        "Rental premiums of 15-20% over new construction",
      ],
      details: {
        breakdown: [
          { label: "Top Performers (20%+)", value: "28%", percentage: 28 },
          { label: "Strong (15-20%)", value: "45%", percentage: 45 },
          { label: "Moderate (10-15%)", value: "27%", percentage: 27 },
        ],
        recommendations: [
          "Target buildings with strong bones and good locations",
          "Negotiate favorable acquisition pricing",
          "Focus on operational efficiency post-conversion",
        ],
        marketContext: "Conversion ROIs outperforming traditional development by 3-5 percentage points.",
      },
    },
  ]

  // Simulate periodic pulse animations
  useEffect(() => {
    const interval = setInterval(() => {
      const randomCard = statCards[Math.floor(Math.random() * statCards.length)]
      setAnimatingCards((prev) => new Set([...prev, randomCard.id]))

      setTimeout(() => {
        setAnimatingCards((prev) => {
          const newSet = new Set(prev)
          newSet.delete(randomCard.id)
          return newSet
        })
      }, 2000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCardClick = async (card: StatCard) => {
    setAiProcessing(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setAiProcessing(false)
    setSelectedCard(card)
    onAnalyticsClick?.(card.id)
  }

  const handleExportReport = (card: StatCard) => {
    const report = {
      title: `${card.title} Analytics Report`,
      generated: new Date().toISOString(),
      summary: {
        value: card.value,
        change: card.change,
        status: card.status,
      },
      insights: card.insights,
      breakdown: card.details.breakdown,
      recommendations: card.details.recommendations,
      marketContext: card.details.marketContext,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${card.id}_analytics_report.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          const isAnimating = animatingCards.has(card.id)

          return (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 ${
                card.color.includes("blue")
                  ? "border-l-blue-500"
                  : card.color.includes("green")
                    ? "border-l-green-500"
                    : card.color.includes("purple")
                      ? "border-l-purple-500"
                      : card.color.includes("emerald")
                        ? "border-l-emerald-500"
                        : card.color.includes("orange")
                          ? "border-l-orange-500"
                          : "border-l-red-500"
              } ${isAnimating ? "animate-pulse ring-2 ring-primary/50" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {isAnimating && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />}
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={card.trend === "up" ? "default" : card.trend === "down" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {card.change}
                      </Badge>
                      <Badge
                        variant={
                          card.status === "STRONG" ? "default" : card.status === "GOOD" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {card.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">AI Insights</div>
                    <Brain className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AI Processing Modal */}
      {aiProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-96 mx-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Analysis in Progress</h3>
                  <p className="text-sm text-muted-foreground">Processing market intelligence...</p>
                </div>
              </div>
              <Progress value={75} className="mb-2" />
              <p className="text-xs text-muted-foreground">Analyzing 847 data points across 12 market indicators</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Analytics Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedCard.icon className={`h-6 w-6 ${selectedCard.color}`} />
                  <div>
                    <CardTitle className="text-xl">{selectedCard.title} Analytics</CardTitle>
                    <p className="text-sm text-muted-foreground">AI-powered insights and recommendations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportReport(selectedCard)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCard(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Metrics */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Metrics Breakdown
                  </h3>
                  <div className="space-y-4">
                    {selectedCard.details.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.value}</span>
                          {item.percentage && (
                            <Badge variant="outline" className="text-xs">
                              {item.percentage.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    AI-Generated Insights
                  </h3>
                  <div className="space-y-3">
                    {selectedCard.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Strategic Recommendations
                  </h3>
                  <div className="space-y-2">
                    {selectedCard.details.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Context */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Market Context
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCard.details.marketContext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
