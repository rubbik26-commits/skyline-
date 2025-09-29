"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, TrendingUp, DollarSign, BarChart3, Activity, Database } from "lucide-react"

// Import all our dashboard components
import { SkylineAnalytics } from "@/components/skyline-analytics"
import { TradingDashboard } from "@/components/trading-dashboard"
import { EnhancedMarketIntelligence } from "@/components/enhanced-market-intelligence"
import { RealTimePropertyFeed } from "@/components/real-time-property-feed"
import { MarketHeatmap } from "@/components/market-heatmap"
import { InvestmentPortfolioTracker } from "@/components/investment-portfolio-tracker"
import { FederalReserveDashboard } from "@/components/federal-reserve-dashboard"
import { AdvancedPerformanceDashboard } from "@/components/advanced-performance-dashboard"
import PremiumGovChat from "@/components/premium-gov-chat"

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState("overview")

  const platformStats = [
    { label: "Properties Analyzed", value: "12,847", icon: Building2, change: "+23%" },
    { label: "Conversion Opportunities", value: "1,234", icon: TrendingUp, change: "+15%" },
    { label: "Total Investment Value", value: "$2.4B", icon: DollarSign, change: "+8%" },
    { label: "Active Monitoring", value: "847", icon: Activity, change: "+12%" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manhattan Real Estate Intelligence Platform
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive AI-powered analysis for office-to-residential conversion opportunities in Manhattan
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Database className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Real-time Data Active
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              AI Analysis Ready
            </Badge>
          </div>
          <div className="pt-2">
            <Button variant="outline" asChild>
              <a href="/" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Back to Main Dashboard
              </a>
            </Button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change} this month</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="aichat">AI Chat</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Heatmap
                  </CardTitle>
                  <CardDescription>Real-time visualization of Manhattan conversion opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <MarketHeatmap />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Property Feed
                  </CardTitle>
                  <CardDescription>Real-time property updates and market changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimePropertyFeed />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <SkylineAnalytics />
          </TabsContent>

          <TabsContent value="trading">
            <TradingDashboard />
          </TabsContent>

          <TabsContent value="intelligence">
            <EnhancedMarketIntelligence />
          </TabsContent>

          <TabsContent value="aichat">
            <PremiumGovChat />
          </TabsContent>

          <TabsContent value="properties">
            <RealTimePropertyFeed />
          </TabsContent>

          <TabsContent value="portfolio">
            <InvestmentPortfolioTracker />
          </TabsContent>

          <TabsContent value="economic">
            <FederalReserveDashboard />
          </TabsContent>

          <TabsContent value="performance">
            <AdvancedPerformanceDashboard />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900">Platform Status</h3>
                <p className="text-gray-600">All systems operational • Last updated: {new Date().toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
                <Button size="sm">Generate Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
