"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Building2, Home, BarChart3, CheckCircle, Activity, TrendingUp } from "lucide-react"
import type { PropertyData } from "@/types/property"

interface StatsCardsProps {
  data: PropertyData[]
}

export function StatsCards({ data }: StatsCardsProps) {
  const totalBuildings = data.length
  const totalUnits = data.reduce((sum, prop) => sum + (prop.units || 0), 0)
  const totalGSF = data.reduce((sum, prop) => sum + (prop.gsf || 0), 0)
  const eligibleCount = data.filter((prop) => prop.eligible).length
  const completedCount = data.filter((prop) => prop.status === "Completed").length
  const underwayCount = data.filter((prop) => prop.status === "Underway").length

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const stats = [
    {
      title: "Total Buildings",
      value: totalBuildings,
      icon: Building2,
      change: "+12",
      trend: "+8.2% this quarter",
      color: "text-primary",
    },
    {
      title: "Total Units",
      value: totalUnits,
      icon: Home,
      change: "+2.4K",
      trend: "🚀 Pipeline: 15.6K units",
      color: "text-secondary",
    },
    {
      title: "Total GSF",
      value: totalGSF,
      icon: BarChart3,
      change: "+1.2M",
      trend: "⚡ Avg: 850 SF/unit",
      color: "text-accent",
    },
    {
      title: "467-M Eligible",
      value: eligibleCount,
      icon: CheckCircle,
      change: "+8",
      trend: "💰 $2.8B tax incentives",
      color: "text-green-600",
    },
    {
      title: "Market Activity",
      value: "STRONG",
      icon: Activity,
      change: "+15%",
      trend: "🔥 32 active projects",
      color: "text-orange-600",
      isText: true,
    },
    {
      title: "Avg ROI Projection",
      value: "18.5%",
      icon: TrendingUp,
      change: "+2.1%",
      trend: "📊 Market outperformance",
      color: "text-purple-600",
      isText: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="stat-card group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="pulse-dot" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.isText ? stat.value : formatNumber(stat.value as number)}
                  </p>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.trend}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
