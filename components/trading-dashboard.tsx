"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Building2, Target, AlertTriangle, CheckCircle, BarChart } from "lucide-react"
import dynamic from "next/dynamic"

const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })
const BarChartComponent = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false })
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false })

interface TradingDashboardProps {
  properties: any[]
}

export function TradingDashboard({ properties }: TradingDashboardProps) {
  const [liveData, setLiveData] = useState({
    totalValue: 8200000000,
    dailyChange: 2.7,
    volume: 156000000,
    marketCap: 12400000000,
    pe: 18.4,
    yield: 6.8,
  })

  const [priceHistory] = useState([
    { time: "09:30", price: 8150, volume: 12000 },
    { time: "10:00", price: 8180, volume: 15000 },
    { time: "10:30", price: 8165, volume: 11000 },
    { time: "11:00", price: 8200, volume: 18000 },
    { time: "11:30", price: 8220, volume: 14000 },
    { time: "12:00", price: 8240, volume: 16000 },
    { time: "12:30", price: 8235, volume: 13000 },
    { time: "13:00", price: 8260, volume: 19000 },
    { time: "13:30", price: 8275, volume: 17000 },
    { time: "14:00", price: 8290, volume: 21000 },
  ])

  const submarketData = [
    { name: "Midtown", value: 35, color: "#4682B4" },
    { name: "Financial District", value: 28, color: "#5B9BD5" },
    { name: "Midtown South", value: 22, color: "#87CEEB" },
    { name: "Upper East Side", value: 15, color: "#B0C4DE" },
  ]

  const performanceMetrics = [
    { metric: "ROI", value: "24.8%", change: "+2.1%", trend: "up" },
    { metric: "IRR", value: "18.3%", change: "+1.4%", trend: "up" },
    { metric: "Cap Rate", value: "5.2%", change: "-0.3%", trend: "down" },
    { metric: "NOI", value: "$428M", change: "+3.7%", trend: "up" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        ...prev,
        totalValue: prev.totalValue + (Math.random() - 0.5) * 10000000,
        dailyChange: prev.dailyChange + (Math.random() - 0.5) * 0.5,
        volume: prev.volume + (Math.random() - 0.5) * 5000000,
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Trading Header - Improved mobile responsiveness */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-3 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono text-green-400">
                ${(liveData.totalValue / 1000000000).toFixed(2)}B
              </div>
              <div className="text-xs md:text-sm text-slate-300">Total Market Value</div>
              <div
                className={`flex items-center justify-center gap-1 mt-1 ${liveData.dailyChange >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {liveData.dailyChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                )}
                <span className="font-mono text-xs md:text-sm">
                  {liveData.dailyChange >= 0 ? "+" : ""}
                  {liveData.dailyChange.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono text-blue-400">
                ${(liveData.volume / 1000000).toFixed(0)}M
              </div>
              <div className="text-xs md:text-sm text-slate-300">Daily Volume</div>
              <div className="text-xs text-slate-400 mt-1">24h Trading</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono text-yellow-400">
                {liveData.pe.toFixed(1)}
              </div>
              <div className="text-xs md:text-sm text-slate-300">P/E Ratio</div>
              <div className="text-xs text-slate-400 mt-1">Price to Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono text-purple-400">
                {liveData.yield.toFixed(1)}%
              </div>
              <div className="text-xs md:text-sm text-slate-300">Dividend Yield</div>
              <div className="text-xs text-slate-400 mt-1">Annual Return</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid - Better mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Price Chart */}
        <Card className="border-slate-700">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              Live Price Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 md:h-72 bg-slate-100 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card className="border-slate-700">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <BarChart className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              Trading Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 md:h-72 bg-slate-100 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChartComponent data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="volume" fill="#3B82F6" />
                </BarChartComponent>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics - Mobile-optimized grid */}
      <Card className="border-slate-700">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Target className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                    {metric.metric}
                  </span>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold font-mono">{metric.value}</div>
                <div className={`text-xs md:text-sm ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Distribution - Improved mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        <Card className="border-slate-700">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
              Submarket Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 md:h-72 bg-slate-100 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={submarketData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    fontSize={10}
                  >
                    {submarketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>

        {/* Risk Assessment - Better mobile spacing */}
        <Card className="border-slate-700">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-4">
            <div className="flex items-center justify-between p-2 md:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-xs md:text-sm truncate">Market Stability</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs flex-shrink-0 ml-2">
                LOW RISK
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 flex-shrink-0" />
                <span className="font-medium text-xs md:text-sm truncate">Regulatory Changes</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs flex-shrink-0 ml-2">
                MEDIUM RISK
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-xs md:text-sm truncate">Growth Potential</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs flex-shrink-0 ml-2">
                HIGH OPPORTUNITY
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
