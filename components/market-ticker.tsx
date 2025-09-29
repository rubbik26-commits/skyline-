"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface TickerItem {
  symbol: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  description: string
}

export function MarketTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const tickerData: TickerItem[] = [
    { symbol: "CONV", value: "116", change: "+3.2%", trend: "up", description: "Total Conversions" },
    { symbol: "UNITS", value: "25,847", change: "+1.8%", trend: "up", description: "Residential Units" },
    { symbol: "GSF", value: "22.4M", change: "+0.9%", trend: "up", description: "Gross Square Feet" },
    { symbol: "COMP", value: "67", change: "+2.1%", trend: "up", description: "Completed Projects" },
    { symbol: "UW", value: "49", change: "+4.3%", trend: "up", description: "Projects Underway" },
    { symbol: "VAL", value: "$8.2B", change: "+2.7%", trend: "up", description: "Total Market Value" },
    { symbol: "YIELD", value: "6.8%", change: "-0.3%", trend: "down", description: "Average Yield" },
    { symbol: "OCC", value: "94.2%", change: "+1.1%", trend: "up", description: "Occupancy Rate" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [tickerData.length])

  return (
    <Card className="bg-black text-green-400 border-green-400/30 overflow-hidden">
      <div className="flex items-center h-16 px-4">
        <div className="flex items-center gap-2 mr-6">
          <Activity className="h-5 w-5 animate-pulse" />
          <span className="font-mono text-sm font-bold">LIVE MARKET DATA</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 200}px)` }}
          >
            {tickerData.map((item, index) => (
              <div key={index} className="flex items-center gap-4 min-w-[200px] font-mono">
                <span className="text-white font-bold">{item.symbol}</span>
                <span className="text-lg font-bold">{item.value}</span>
                <div className="flex items-center gap-1">
                  {item.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span
                    className={
                      item.trend === "up" ? "text-green-400" : item.trend === "down" ? "text-red-400" : "text-gray-400"
                    }
                  >
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
