"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Building, Activity, Zap } from "lucide-react"
import dynamic from "next/dynamic"

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

interface MarketIndicator {
  name: string
  value: string
  change: string
  trend: "up" | "down" | "stable"
  status: "STRONG" | "GOOD" | "MODERATE" | "WEAK"
}

interface EconomicData {
  date: string
  commercialLoans: number
  constructionSpending: number
  interestRate: number
}

export function EnhancedMarketIntelligence() {
  const [indicators, setIndicators] = useState<MarketIndicator[]>([
    {
      name: "Commercial RE Loans",
      value: "$2.8T",
      change: "+5.2%",
      trend: "up",
      status: "STRONG",
    },
    {
      name: "Construction Spending",
      value: "$1.8T",
      change: "+3.1%",
      trend: "up",
      status: "GOOD",
    },
    {
      name: "Office Vacancy Rate",
      value: "18.2%",
      change: "-1.3%",
      trend: "down",
      status: "GOOD",
    },
    {
      name: "Conversion Pipeline",
      value: "47 Projects",
      change: "+12",
      trend: "up",
      status: "STRONG",
    },
  ])

  const [economicData, setEconomicData] = useState<EconomicData[]>([
    { date: "Jan", commercialLoans: 2650, constructionSpending: 1720, interestRate: 5.2 },
    { date: "Feb", commercialLoans: 2680, constructionSpending: 1740, interestRate: 5.1 },
    { date: "Mar", commercialLoans: 2720, constructionSpending: 1760, interestRate: 5.0 },
    { date: "Apr", commercialLoans: 2750, constructionSpending: 1780, interestRate: 4.9 },
    { date: "May", commercialLoans: 2780, constructionSpending: 1800, interestRate: 4.8 },
    { date: "Jun", commercialLoans: 2800, constructionSpending: 1820, interestRate: 4.7 },
  ])

  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive((prev) => !prev)

      // Randomly update one indicator
      setIndicators((prev) => {
        const updated = [...prev]
        const randomIndex = Math.floor(Math.random() * updated.length)
        const indicator = updated[randomIndex]

        // Simulate small market movements
        const changeValue = (Math.random() - 0.5) * 2
        const newChange = changeValue > 0 ? `+${changeValue.toFixed(1)}%` : `${changeValue.toFixed(1)}%`

        updated[randomIndex] = {
          ...indicator,
          change: newChange,
          trend: changeValue > 0 ? "up" : changeValue < 0 ? "down" : "stable",
        }

        return updated
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "STRONG":
        return "bg-green-100 text-green-800 border-green-200"
      case "GOOD":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "WEAK":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
      default:
        return <Activity className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Live Market Indicators - Improved mobile responsiveness */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-sm md:text-base">
            <Activity className="h-4 w-4 md:h-5 md:w-5" />
            Live Market Intelligence
            {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {indicators.map((indicator, index) => (
              <div key={index} className="p-3 md:p-4 border rounded-lg hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground truncate pr-2">
                    {indicator.name}
                  </span>
                  {getTrendIcon(indicator.trend)}
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600 mb-1">{indicator.value}</div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs md:text-sm ${
                      indicator.trend === "up"
                        ? "text-green-600"
                        : indicator.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {indicator.change}
                  </span>
                  <Badge className={`text-xs ${getStatusColor(indicator.status)}`}>{indicator.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Economic Indicators Chart - Mobile-optimized chart */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-sm md:text-base">
            <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
            Economic Indicators (Federal Reserve Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-80">
            <Suspense fallback={<div className="h-full bg-slate-100 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={economicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="commercialLoans"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Commercial Loans ($B)"
                  />
                  <Area
                    type="monotone"
                    dataKey="constructionSpending"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    name="Construction Spending ($B)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights - Better mobile spacing and text sizing */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-sm md:text-base">
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
            AI Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-4">
            <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-800 text-xs md:text-sm">Opportunity Identified</span>
              </div>
              <p className="text-xs md:text-sm text-green-700 leading-relaxed">
                Commercial loan availability increased 5.2% this quarter, creating favorable conditions for
                office-to-residential conversions. 47 projects currently in pipeline.
              </p>
            </div>

            <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-blue-800 text-xs md:text-sm">Market Timing</span>
              </div>
              <p className="text-xs md:text-sm text-blue-700 leading-relaxed">
                Interest rates trending downward (4.7% current) suggest optimal timing for conversion financing.
                Construction spending up 3.1% indicates strong market demand.
              </p>
            </div>

            <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-yellow-600 flex-shrink-0" />
                <span className="font-semibold text-yellow-800 text-xs md:text-sm">Efficiency Optimization</span>
              </div>
              <p className="text-xs md:text-sm text-yellow-700 leading-relaxed">
                Office vacancy rate declining (-1.3%) indicates improving market conditions. Focus on Class B buildings
                built before 1991 for maximum conversion potential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
