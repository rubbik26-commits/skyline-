"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Building, Activity, AlertCircle } from "lucide-react"

interface EconomicIndicatorsChartProps {
  apiData?: any
}

export function EconomicIndicatorsChart({ apiData }: EconomicIndicatorsChartProps) {
  const [indicators, setIndicators] = useState({
    commercialLoans: {
      current: 2847.5,
      change: 2.4,
      trend: "up" as const,
      data: [
        { month: "Jan", value: 2756 },
        { month: "Feb", value: 2789 },
        { month: "Mar", value: 2812 },
        { month: "Apr", value: 2834 },
        { month: "May", value: 2847 },
      ],
    },
    constructionSpending: {
      current: 1456.8,
      change: -1.2,
      trend: "down" as const,
      data: [
        { month: "Jan", value: 1489 },
        { month: "Feb", value: 1478 },
        { month: "Mar", value: 1465 },
        { month: "Apr", value: 1461 },
        { month: "May", value: 1457 },
      ],
    },
    interestRates: {
      current: 7.25,
      change: 0.25,
      trend: "up" as const,
      data: [
        { month: "Jan", value: 6.75 },
        { month: "Feb", value: 6.85 },
        { month: "Mar", value: 7.0 },
        { month: "Apr", value: 7.15 },
        { month: "May", value: 7.25 },
      ],
    },
  })

  const [marketMetrics, setMarketMetrics] = useState({
    medianPrice: 1250000,
    priceChange: 2.4,
    medianRent: 4200,
    rentChange: 3.1,
    inventory: 2847,
    inventoryChange: -5.2,
    daysOnMarket: 89,
    domChange: -12.3,
  })

  // Update with real API data when available
  useEffect(() => {
    if (apiData?.commercialLoans?.success && apiData.commercialLoans.data) {
      // Process FRED data
      const observations = apiData.commercialLoans.data.observations || []
      if (observations.length > 0) {
        const latest = observations[observations.length - 1]
        setIndicators((prev) => ({
          ...prev,
          commercialLoans: {
            ...prev.commercialLoans,
            current: Number.parseFloat(latest.value) || prev.commercialLoans.current,
          },
        }))
      }
    }

    if (apiData?.marketData?.success && apiData.marketData.data) {
      const manhattan = apiData.marketData.data.manhattan || {}
      setMarketMetrics((prev) => ({
        ...prev,
        medianPrice: manhattan.medianSalePrice || prev.medianPrice,
        priceChange: manhattan.priceChange * 100 || prev.priceChange,
        medianRent: manhattan.medianRentPrice || prev.medianRent,
        rentChange: manhattan.rentChange * 100 || prev.rentChange,
      }))
    }
  }, [apiData])

  const conversionData = [
    { type: "Office to Residential", count: 89, percentage: 67 },
    { type: "Mixed Use", count: 23, percentage: 17 },
    { type: "Hotel to Residential", count: 15, percentage: 11 },
    { type: "Other", count: 6, percentage: 5 },
  ]

  const COLORS = ["#1770B0", "#10b981", "#f59e0b", "#ef4444"]

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  const getTrendIcon = (trend: "up" | "down", change: number) => {
    if (trend === "up" || change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Median Sale Price</p>
                <p className="text-2xl font-bold">{formatCurrency(marketMetrics.medianPrice)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon("up", marketMetrics.priceChange)}
                  <span className={`text-sm ${marketMetrics.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatChange(marketMetrics.priceChange)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Median Rent</p>
                <p className="text-2xl font-bold">{formatCurrency(marketMetrics.medianRent)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon("up", marketMetrics.rentChange)}
                  <span className={`text-sm ${marketMetrics.rentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatChange(marketMetrics.rentChange)}
                  </span>
                </div>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Inventory</p>
                <p className="text-2xl font-bold">{marketMetrics.inventory.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon("down", marketMetrics.inventoryChange)}
                  <span className={`text-sm ${marketMetrics.inventoryChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatChange(marketMetrics.inventoryChange)}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days on Market</p>
                <p className="text-2xl font-bold">{marketMetrics.daysOnMarket}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon("down", marketMetrics.domChange)}
                  <span className={`text-sm ${marketMetrics.domChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatChange(marketMetrics.domChange)}
                  </span>
                </div>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commercial Loans Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Commercial RE Loans</span>
              <Badge variant={indicators.commercialLoans.trend === "up" ? "default" : "destructive"}>
                {formatChange(indicators.commercialLoans.change)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={indicators.commercialLoans.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}B`, "Loans"]} />
                <Line type="monotone" dataKey="value" stroke="#1770B0" strokeWidth={2} dot={{ fill: "#1770B0" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Construction Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Construction Spending</span>
              <Badge variant={indicators.constructionSpending.trend === "up" ? "default" : "destructive"}>
                {formatChange(indicators.constructionSpending.change)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={indicators.constructionSpending.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}B`, "Spending"]} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interest Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Interest Rates</span>
              <Badge variant={indicators.interestRates.trend === "up" ? "destructive" : "default"}>
                {formatChange(indicators.interestRates.change)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={indicators.interestRates.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Rate"]} />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Types */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Market Status Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Market Sentiment</span>
              <Badge variant="default">BULLISH</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Conversion Activity</span>
              <Badge variant="default">HIGH</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Financing Availability</span>
              <Badge variant="secondary">MODERATE</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
