"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Building, DollarSign, Calendar, Award, Target } from "lucide-react"

interface ExecutiveSummaryProps {
  properties: any[]
}

export function ExecutiveSummary({ properties }: ExecutiveSummaryProps) {
  const totalUnits = properties.reduce((sum, prop) => sum + (prop.units || 0), 0)
  const totalGSF = properties.reduce((sum, prop) => sum + (prop.gsf || 0), 0)
  const completedProjects = properties.filter((p) => p.status === "Completed").length
  const underwayProjects = properties.filter((p) => p.status === "Underway").length

  const keyMetrics = [
    {
      title: "Portfolio Value",
      value: "$8.2B",
      change: "+12.4%",
      trend: "up",
      icon: DollarSign,
      description: "Total estimated market value",
    },
    {
      title: "Conversion Rate",
      value: "94.2%",
      change: "+3.1%",
      trend: "up",
      icon: Target,
      description: "Successful conversion completion rate",
    },
    {
      title: "Average ROI",
      value: "24.8%",
      change: "+2.7%",
      trend: "up",
      icon: TrendingUp,
      description: "Return on investment across portfolio",
    },
    {
      title: "Market Share",
      value: "18.6%",
      change: "+1.9%",
      trend: "up",
      icon: Award,
      description: "Manhattan conversion market share",
    },
  ]

  const marketInsights = [
    {
      title: "Prime Opportunity Zones",
      description: "Financial District and Midtown South showing highest conversion potential",
      impact: "High",
      timeframe: "Q2 2024",
    },
    {
      title: "Regulatory Environment",
      description: "NYC zoning amendments favor office-to-residential conversions",
      impact: "Positive",
      timeframe: "Ongoing",
    },
    {
      title: "Market Demand",
      description: "Residential demand up 23% YoY in converted properties",
      impact: "High",
      timeframe: "Current",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Executive Overview */}
      <Card className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Building className="h-8 w-8 text-blue-400" />
            Executive Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{properties.length}</div>
              <div className="text-sm text-slate-300">Total Properties</div>
              <div className="text-xs text-slate-400">Active Portfolio</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">{totalUnits.toLocaleString()}</div>
              <div className="text-sm text-slate-300">Residential Units</div>
              <div className="text-xs text-slate-400">Converted & Planned</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{(totalGSF / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-slate-300">Total GSF</div>
              <div className="text-xs text-slate-400">Square Footage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {((completedProjects / properties.length) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-300">Completion Rate</div>
              <div className="text-xs text-slate-400">Project Success</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="h-8 w-8 text-blue-500" />
                <Badge
                  variant={metric.trend === "up" ? "default" : "secondary"}
                  className="bg-green-100 text-green-800"
                >
                  {metric.change}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold font-mono">{metric.value}</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{metric.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{metric.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Insights */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Strategic Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{insight.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">{insight.description}</div>
                  <div className="flex items-center gap-4">
                    <Badge variant={insight.impact === "High" ? "default" : "secondary"}>{insight.impact} Impact</Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {insight.timeframe}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-500" />
            Strategic Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Immediate Priorities</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Accelerate 12 high-priority conversions in Financial District</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Secure additional financing for Midtown South expansion</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Complete regulatory approvals for Q2 pipeline</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Strategic Initiatives</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Expand portfolio to include mixed-use developments</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Implement sustainability initiatives across all projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Develop strategic partnerships with major developers</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
