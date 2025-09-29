"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, CheckCircle, Brain, Zap, Target, Activity } from "lucide-react"
import type { Property } from "@/data/property-data"

// AI-Powered Market Analysis
export class SkylineAI {
  static analyzeMarketSentiment(marketData: any, properties: Property[]) {
    const completedProjects = properties.filter((p) => p.status === "Completed").length
    const underwayProjects = properties.filter((p) => p.status === "Underway").length
    const projectedProjects = properties.filter((p) => p.status === "Projected").length

    const momentum = (underwayProjects + projectedProjects) / properties.length
    const success_rate = completedProjects / (completedProjects + underwayProjects + projectedProjects)

    let sentiment: "bullish" | "bearish" | "neutral" = "neutral"
    let confidence = 0.5

    if (momentum > 0.6 && success_rate > 0.3) {
      sentiment = "bullish"
      confidence = Math.min(0.95, 0.6 + momentum * 0.4)
    } else if (momentum < 0.3 || success_rate < 0.2) {
      sentiment = "bearish"
      confidence = Math.min(0.9, 0.5 + (1 - momentum) * 0.4)
    }

    return {
      sentiment,
      confidence,
      momentum: momentum * 100,
      successRate: success_rate * 100,
      insights: this.generateInsights(sentiment, momentum, success_rate),
    }
  }

  static generateInsights(sentiment: string, momentum: number, successRate: number) {
    const insights = []

    if (momentum > 0.7) {
      insights.push("🚀 High development momentum detected - market is very active")
    }
    if (successRate > 0.4) {
      insights.push("✅ Strong completion rate indicates favorable market conditions")
    }
    if (sentiment === "bullish") {
      insights.push("📈 Market sentiment is positive for office-to-residential conversions")
    }
    if (momentum < 0.3) {
      insights.push("⚠️ Development activity is below average - potential opportunity")
    }

    return insights
  }

  static scanOpportunities(properties: Property[], marketData: any) {
    return properties
      .filter((p) => p.status === "Projected" && p.eligible)
      .map((property) => ({
        property,
        score: this.calculateOpportunityScore(property),
        reasons: this.getOpportunityReasons(property),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  static calculateOpportunityScore(property: Property): number {
    let score = 50 // Base score

    // Size bonus
    if (property.units && property.units > 500) score += 20
    if (property.units && property.units > 1000) score += 10

    // Location bonus
    const premiumSubmarkets = ["Financial District", "Tribeca", "SoHo", "Chelsea"]
    if (premiumSubmarkets.includes(property.submarket)) score += 15

    // Type bonus
    if (property.type === "Mixed") score += 10

    // Eligibility bonus
    if (property.eligible) score += 15

    return Math.min(100, score)
  }

  static getOpportunityReasons(property: Property): string[] {
    const reasons = []

    if (property.units && property.units > 500) {
      reasons.push("Large scale project with significant impact")
    }
    if (property.eligible) {
      reasons.push("Eligible for tax incentives and benefits")
    }
    if (["Financial District", "Tribeca", "SoHo"].includes(property.submarket)) {
      reasons.push("Prime Manhattan location with high demand")
    }
    if (property.type === "Mixed") {
      reasons.push("Mixed-use development offers diversified revenue")
    }

    return reasons
  }
}

// Real-time Analytics Dashboard Component
export const SkylineAnalyticsDashboard: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const [analytics, setAnalytics] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (properties.length > 0) {
      setIsAnalyzing(true)

      // Simulate AI processing time for dramatic effect
      setTimeout(() => {
        const mockMarketData = {
          medianSalePrice: 1250000,
          medianRent: 4500,
          activeInventory: 2340,
          daysOnMarket: 45,
          priceChange: 5.2,
          rentChange: 3.8,
          inventoryChange: -8.5,
        }

        const sentiment = SkylineAI.analyzeMarketSentiment(mockMarketData, properties)
        const opps = SkylineAI.scanOpportunities(properties, mockMarketData)

        setAnalytics(sentiment)
        setOpportunities(opps)
        setIsAnalyzing(false)
      }, 2000)
    }
  }, [properties])

  if (!analytics) {
    return (
      <Card className="border-[#4682B4]/20">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin">
              <Brain className="w-12 h-12 text-[#4682B4] mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                🧠 AI Analysis in Progress
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Processing {properties.length} properties with advanced market intelligence...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Sentiment */}
      <Card className="border-[#4682B4]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#4682B4]">
            <Brain className="h-5 w-5" />
            AI Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {analytics.sentiment === "bullish" ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : analytics.sentiment === "bearish" ? (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                ) : (
                  <Activity className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analytics.sentiment.toUpperCase()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Market Sentiment</div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-[#4682B4] mb-1">{Math.round(analytics.confidence * 100)}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">AI Confidence</div>
              <Progress value={analytics.confidence * 100} className="mt-2" />
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-[#4682B4] mb-1">{Math.round(analytics.momentum)}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Market Momentum</div>
              <Progress value={analytics.momentum} className="mt-2" />
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Key Insights</h4>
            {analytics.insights.map((insight: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg animate-in slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Zap className="w-4 h-4 text-[#4682B4] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      <Card className="border-[#4682B4]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#4682B4]">
            <Target className="h-5 w-5" />
            Top Investment Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-[#4682B4]/40 transition-colors animate-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{opp.property.address}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {opp.property.submarket} • {opp.property.units?.toLocaleString()} units
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-[#4682B4]/10 text-[#4682B4]">
                    {opp.score}/100
                  </Badge>
                </div>

                <div className="space-y-1">
                  {opp.reasons.map((reason: string, reasonIndex: number) => (
                    <div
                      key={reasonIndex}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const SkylineAnalytics = SkylineAnalyticsDashboard
