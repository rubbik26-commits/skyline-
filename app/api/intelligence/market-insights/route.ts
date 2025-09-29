import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { unstable_cache } from "next/cache"
import { getCachedProperties } from "@/lib/data-cache"

interface MarketInsightRequest {
  focus?: "conversions" | "investments" | "trends" | "risks" | "opportunities"
  timeframe?: "1m" | "3m" | "6m" | "1y"
  submarket?: string
  propertyType?: string
}

interface MarketMetrics {
  totalProperties: number
  totalValue: number
  avgCapRate: number
  avgPricePerSF: number
  conversionRate: number
  marketVelocity: number
  riskScore: number
  opportunityScore: number
}

class MarketIntelligenceEngine {
  private async generateAIInsights(prompt: string, context: any) {
    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `You are a Manhattan real estate market intelligence expert with deep knowledge of commercial real estate, conversions, and investment strategies.

Context Data: ${JSON.stringify(context, null, 2)}

${prompt}

Provide detailed, actionable market intelligence focusing on:
- Current market conditions and trends
- Investment opportunities and risks
- Submarket dynamics and comparisons
- Financial projections and ROI analysis
- Regulatory and zoning considerations
- Strategic recommendations for investors

Format your response as structured analysis with specific data points and recommendations.`,
      })

      return text
    } catch (error) {
      console.error("AI market insights error:", error)
      return "Market intelligence temporarily unavailable. Using fallback analysis."
    }
  }

  calculateMarketMetrics(properties: any[]): MarketMetrics {
    const totalProperties = properties.length
    const totalValue = properties.reduce((sum, p) => sum + (p.askingPrice || 0), 0)
    const avgCapRate =
      properties.length > 0 ? properties.reduce((sum, p) => sum + (p.capRate || 0), 0) / properties.length : 0
    const avgPricePerSF =
      properties.length > 0 ? properties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / properties.length : 0

    // Calculate conversion rate (completed vs total)
    const completedConversions = properties.filter((p) => p.status === "Completed").length
    const conversionRate = totalProperties > 0 ? completedConversions / totalProperties : 0

    // Market velocity (properties sold/leased in timeframe)
    const activeProperties = properties.filter((p) => p.status === "Available" || p.status === "Under Contract").length
    const marketVelocity = totalProperties > 0 ? activeProperties / totalProperties : 0

    // Risk scoring based on market conditions
    let riskScore = 50 // Base risk
    if (avgCapRate > 6) riskScore -= 10 // Lower risk with higher cap rates
    if (avgCapRate < 4) riskScore += 15 // Higher risk with low cap rates
    if (conversionRate > 0.8) riskScore += 10 // Market saturation risk
    if (marketVelocity < 0.2) riskScore += 10 // Low liquidity risk

    // Opportunity scoring
    let opportunityScore = 50 // Base opportunity
    if (avgCapRate > 5) opportunityScore += 15 // Good returns
    if (marketVelocity > 0.3) opportunityScore += 10 // Active market
    if (conversionRate < 0.6) opportunityScore += 15 // Room for growth

    return {
      totalProperties,
      totalValue,
      avgCapRate,
      avgPricePerSF,
      conversionRate,
      marketVelocity,
      riskScore: Math.max(0, Math.min(100, riskScore)),
      opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
    }
  }

  async analyzeMarketTrends(properties: any[], timeframe: string) {
    const metrics = this.calculateMarketMetrics(properties)

    const submarketAnalysis = this.analyzeSubmarkets(properties)
    const propertyTypeAnalysis = this.analyzePropertyTypes(properties)

    const context = {
      metrics,
      submarketAnalysis,
      propertyTypeAnalysis,
      timeframe,
      totalProperties: properties.length,
    }

    const prompt = `Analyze current Manhattan real estate market trends for ${timeframe} timeframe. What are the key opportunities, emerging patterns, and strategic recommendations?`

    const aiInsights = await this.generateAIInsights(prompt, context)

    return {
      metrics,
      submarketAnalysis,
      propertyTypeAnalysis,
      aiInsights,
      recommendations: this.generateStrategicRecommendations(metrics, submarketAnalysis),
      riskFactors: this.identifyRiskFactors(metrics, properties),
    }
  }

  analyzeSubmarkets(properties: any[]) {
    const submarkets = properties.reduce(
      (acc, p) => {
        const submarket = p.submarket || "Unknown"
        if (!acc[submarket]) {
          acc[submarket] = {
            count: 0,
            totalValue: 0,
            avgCapRate: 0,
            avgPricePerSF: 0,
            properties: [],
          }
        }
        acc[submarket].count++
        acc[submarket].totalValue += p.askingPrice || 0
        acc[submarket].properties.push(p)
        return acc
      },
      {} as Record<string, any>,
    )

    // Calculate averages for each submarket
    Object.keys(submarkets).forEach((key) => {
      const submarket = submarkets[key]
      submarket.avgCapRate =
        submarket.properties.reduce((sum: number, p: any) => sum + (p.capRate || 0), 0) / submarket.count
      submarket.avgPricePerSF =
        submarket.properties.reduce((sum: number, p: any) => sum + (p.pricePerSF || 0), 0) / submarket.count
      submarket.avgValue = submarket.totalValue / submarket.count

      // Performance scoring
      submarket.performanceScore = this.calculateSubmarketScore(submarket)
    })

    return submarkets
  }

  analyzePropertyTypes(properties: any[]) {
    const types = properties.reduce(
      (acc, p) => {
        const type = p.propertyCategory || "Unknown"
        if (!acc[type]) {
          acc[type] = {
            count: 0,
            totalValue: 0,
            avgCapRate: 0,
            conversionPotential: 0,
            properties: [],
          }
        }
        acc[type].count++
        acc[type].totalValue += p.askingPrice || 0
        acc[type].properties.push(p)
        return acc
      },
      {} as Record<string, any>,
    )

    // Calculate metrics for each property type
    Object.keys(types).forEach((key) => {
      const type = types[key]
      type.avgCapRate = type.properties.reduce((sum: number, p: any) => sum + (p.capRate || 0), 0) / type.count
      type.avgValue = type.totalValue / type.count

      // Conversion potential scoring
      if (key.includes("Office")) {
        type.conversionPotential = 85
      } else if (key.includes("Mixed-Use")) {
        type.conversionPotential = 70
      } else if (key.includes("Industrial")) {
        type.conversionPotential = 60
      } else {
        type.conversionPotential = 40
      }
    })

    return types
  }

  calculateSubmarketScore(submarket: any): number {
    let score = 50 // Base score

    // Cap rate scoring
    if (submarket.avgCapRate > 6) score += 20
    else if (submarket.avgCapRate > 4) score += 10
    else if (submarket.avgCapRate < 3) score -= 10

    // Value scoring (relative to Manhattan average)
    if (submarket.avgPricePerSF < 600)
      score += 15 // Good value
    else if (submarket.avgPricePerSF > 1000) score -= 10 // Expensive

    // Market activity scoring
    if (submarket.count > 10)
      score += 10 // Active market
    else if (submarket.count < 3) score -= 5 // Limited inventory

    return Math.max(0, Math.min(100, score))
  }

  generateStrategicRecommendations(metrics: MarketMetrics, submarkets: any): string[] {
    const recommendations = []

    if (metrics.opportunityScore > 70) {
      recommendations.push("🟢 Strong market conditions - consider aggressive acquisition strategy")
    } else if (metrics.opportunityScore < 40) {
      recommendations.push("🔴 Challenging market - focus on selective, high-quality opportunities")
    }

    if (metrics.avgCapRate > 6) {
      recommendations.push("💰 Above-average cap rates indicate good return potential")
    }

    if (metrics.conversionRate < 0.5) {
      recommendations.push("🏗️ Low conversion rate suggests untapped conversion opportunities")
    }

    if (metrics.marketVelocity > 0.4) {
      recommendations.push("⚡ High market velocity - act quickly on opportunities")
    }

    // Submarket-specific recommendations
    const topSubmarkets = Object.entries(submarkets)
      .sort(([, a], [, b]) => (b as any).performanceScore - (a as any).performanceScore)
      .slice(0, 3)
      .map(([name]) => name)

    if (topSubmarkets.length > 0) {
      recommendations.push(`📍 Focus on top-performing submarkets: ${topSubmarkets.join(", ")}`)
    }

    return recommendations
  }

  identifyRiskFactors(metrics: MarketMetrics, properties: any[]): string[] {
    const risks = []

    if (metrics.riskScore > 70) {
      risks.push("⚠️ High market risk - conduct thorough due diligence")
    }

    if (metrics.avgCapRate < 4) {
      risks.push("📉 Low cap rates may indicate overvalued market")
    }

    if (metrics.conversionRate > 0.8) {
      risks.push("🏢 High conversion rate may indicate market saturation")
    }

    if (metrics.marketVelocity < 0.2) {
      risks.push("🐌 Low market velocity suggests liquidity concerns")
    }

    // Check for concentration risk
    const submarketConcentration = properties.reduce(
      (acc, p) => {
        const submarket = p.submarket || "Unknown"
        acc[submarket] = (acc[submarket] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const concentrationValues = Object.values(submarketConcentration) as number[]
    if (concentrationValues.length > 0) {
      const maxConcentration = Math.max(...concentrationValues)
      if (maxConcentration / properties.length > 0.6) {
        risks.push("🎯 High geographic concentration increases portfolio risk")
      }
    }

    return risks
  }
}

// Cached market insights
const getCachedMarketInsights = unstable_cache(
  async (focus: string, timeframe: string, filters: any) => {
    const engine = new MarketIntelligenceEngine()
    const { properties } = await getCachedProperties({})

    // Apply filters
    let filteredProperties = properties

    if (filters.submarket && filters.submarket !== "all") {
      filteredProperties = filteredProperties.filter((p) => p.submarket === filters.submarket)
    }

    if (filters.propertyType && filters.propertyType !== "all") {
      filteredProperties = filteredProperties.filter((p) => p.propertyCategory === filters.propertyType)
    }

    const analysis = await engine.analyzeMarketTrends(filteredProperties, timeframe)

    return {
      focus,
      timeframe,
      ...analysis,
      timestamp: new Date().toISOString(),
    }
  },
  ["market-insights"],
  { revalidate: 3600, tags: ["market-data", "intelligence"] },
)

export async function POST(request: NextRequest) {
  try {
    const body: MarketInsightRequest = await request.json()
    const { focus = "trends", timeframe = "3m", submarket = "all", propertyType = "all" } = body

    const insights = await getCachedMarketInsights(focus, timeframe, { submarket, propertyType })

    const response = NextResponse.json({
      success: true,
      ...insights,
    })

    // Set cache headers
    response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200")
    response.headers.set("CDN-Cache-Control", "s-maxage=14400")

    return response
  } catch (error) {
    console.error("Market insights API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate market insights",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const focus = searchParams.get("focus") || "trends"
    const timeframe = searchParams.get("timeframe") || "3m"
    const submarket = searchParams.get("submarket") || "all"
    const propertyType = searchParams.get("propertyType") || "all"

    const insights = await getCachedMarketInsights(focus, timeframe, { submarket, propertyType })

    return NextResponse.json({
      success: true,
      ...insights,
    })
  } catch (error) {
    console.error("Market insights GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market insights",
      },
      { status: 500 },
    )
  }
}
