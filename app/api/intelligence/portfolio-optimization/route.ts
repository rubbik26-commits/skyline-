import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { sql } from "@/lib/database/neon"

interface PortfolioConstraints {
  maxInvestment?: number
  minROI?: number
  maxRisk?: number
  diversificationRequirements?: {
    maxSubmarketConcentration?: number
    maxPropertyTypeConcentration?: number
    minProperties?: number
  }
  timeHorizon?: "short" | "medium" | "long"
  investmentStyle?: "conservative" | "balanced" | "aggressive"
}

interface OptimizedPortfolio {
  properties: any[]
  totalInvestment: number
  expectedROI: number
  riskScore: number
  diversificationScore: number
  portfolioMetrics: {
    avgCapRate: number
    totalUnits: number
    submarketDistribution: Record<string, number>
    propertyTypeDistribution: Record<string, number>
  }
  optimizationScore: number
  recommendations: string[]
  riskAnalysis: string[]
  aiInsights?: string
}

class PortfolioOptimizationEngine {
  private async generateOptimizationInsights(
    portfolio: OptimizedPortfolio,
    constraints: PortfolioConstraints,
  ): Promise<string> {
    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `You are a Manhattan real estate portfolio optimization expert specializing in risk-adjusted returns and diversification strategies.

Portfolio Details: ${JSON.stringify(portfolio, null, 2)}
Investment Constraints: ${JSON.stringify(constraints, null, 2)}

Provide comprehensive portfolio optimization analysis including:
- Portfolio construction rationale and strategy
- Risk-return optimization assessment
- Diversification benefits and concentration risks
- Market timing and entry strategy recommendations
- Performance expectations and scenario analysis
- Rebalancing and exit strategy considerations

Focus on Manhattan-specific factors like submarket correlations, conversion opportunities, and market cycles.`,
      })

      return text
    } catch (error) {
      console.error("Portfolio optimization AI error:", error)
      return "Portfolio optimization analysis temporarily unavailable."
    }
  }

  calculatePropertyScore(property: any, constraints: PortfolioConstraints): number {
    let score = 50

    const capRate = property.cap_rate || 0
    if (constraints.minROI) {
      if (capRate >= constraints.minROI) {
        score += 20
      } else {
        score -= 10
      }
    } else {
      if (capRate > 6) score += 20
      else if (capRate > 4) score += 10
      else if (capRate < 3) score -= 10
    }

    const riskFactors = this.calculatePropertyRisk(property)
    if (constraints.maxRisk) {
      if (riskFactors <= constraints.maxRisk) {
        score += 15
      } else {
        score -= 15
      }
    }

    if (constraints.investmentStyle === "conservative") {
      if (property.status === "Completed") score += 10
      if (property.year_built && new Date().getFullYear() - Number.parseInt(property.year_built) < 50) score += 5
    } else if (constraints.investmentStyle === "aggressive") {
      if (property.status === "Projected" || property.status === "Underway") score += 15
      if (property.property_category?.includes("Office")) score += 10
    }

    const premiumSubmarkets = ["Tribeca", "SoHo", "Greenwich Village", "Midtown South"]
    if (premiumSubmarkets.includes(property.submarket)) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  calculatePropertyRisk(property: any): number {
    let risk = 50

    const currentYear = new Date().getFullYear()
    const buildingAge = property.year_built ? currentYear - Number.parseInt(property.year_built) : 50

    if (buildingAge > 100) risk += 15
    else if (buildingAge < 20) risk += 10

    const gsf = property.gsf || 0
    if (gsf > 100000) risk += 10
    else if (gsf < 5000) risk += 5

    if (property.status === "Projected") risk += 20
    else if (property.status === "Underway") risk += 10

    const riskSubmarkets = ["Upper West Side", "Inwood", "Washington Heights"]
    if (riskSubmarkets.includes(property.submarket)) {
      risk += 15
    }

    const pricePerSF = property.price_per_sf || 0
    if (pricePerSF > 1200) risk += 10
    if (property.cap_rate && property.cap_rate < 3) risk += 15

    return Math.max(0, Math.min(100, risk))
  }

  calculateDiversificationScore(properties: any[]): number {
    if (properties.length === 0) return 0

    let diversificationScore = 0

    const submarkets = properties.reduce(
      (acc, p) => {
        const submarket = p.submarket || "Unknown"
        acc[submarket] = (acc[submarket] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const submarketCount = Object.keys(submarkets).length
    const submarketValues = Object.values(submarkets) as number[]
    const maxConcentration = submarketValues.length > 0 ? Math.max(...submarketValues) / properties.length : 0

    if (submarketCount >= 5) diversificationScore += 30
    else if (submarketCount >= 3) diversificationScore += 20
    else diversificationScore += 10

    if (maxConcentration < 0.3) diversificationScore += 20
    else if (maxConcentration < 0.5) diversificationScore += 10

    const propertyTypes = properties.reduce(
      (acc, p) => {
        const type = p.property_category || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const typeCount = Object.keys(propertyTypes).length
    if (typeCount >= 3) diversificationScore += 30
    else if (typeCount >= 2) diversificationScore += 20
    else diversificationScore += 10

    const statusTypes = properties.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    if (Object.keys(statusTypes).length >= 2) diversificationScore += 20

    return Math.min(100, diversificationScore)
  }

  async optimize(properties: any[], constraints: PortfolioConstraints): Promise<OptimizedPortfolio> {
    const scoredProperties = properties
      .map((p) => ({
        ...p,
        score: this.calculatePropertyScore(p, constraints),
        risk: this.calculatePropertyRisk(p),
      }))
      .sort((a, b) => b.score - a.score)

    const selectedProperties: any[] = []
    let totalInvestment = 0
    const maxInvestment = constraints.maxInvestment || Number.POSITIVE_INFINITY

    for (const property of scoredProperties) {
      const estimatedCost = (property.gsf || 0) * (property.price_per_sf || 500)

      if (totalInvestment + estimatedCost <= maxInvestment) {
        selectedProperties.push(property)
        totalInvestment += estimatedCost

        const minProperties = constraints.diversificationRequirements?.minProperties || 5
        if (selectedProperties.length >= minProperties && totalInvestment >= maxInvestment * 0.9) {
          break
        }
      }
    }

    const avgCapRate =
      selectedProperties.reduce((sum, p) => sum + (p.cap_rate || 0), 0) / selectedProperties.length || 0
    const avgRisk = selectedProperties.reduce((sum, p) => sum + p.risk, 0) / selectedProperties.length || 0
    const diversificationScore = this.calculateDiversificationScore(selectedProperties)

    const submarketDistribution = selectedProperties.reduce(
      (acc, p) => {
        const submarket = p.submarket || "Unknown"
        acc[submarket] = (acc[submarket] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const propertyTypeDistribution = selectedProperties.reduce(
      (acc, p) => {
        const type = p.property_category || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const totalUnits = selectedProperties.reduce((sum, p) => sum + (p.total_units || 0), 0)

    const optimizationScore = (avgCapRate * 10 + diversificationScore + (100 - avgRisk)) / 3

    const recommendations: string[] = []
    const riskAnalysis: string[] = []

    if (avgCapRate < 4) {
      recommendations.push("Consider properties with higher cap rates to improve portfolio yield")
    }
    if (diversificationScore < 50) {
      recommendations.push("Increase diversification across submarkets and property types")
    }
    if (avgRisk > 60) {
      riskAnalysis.push("Portfolio has elevated risk profile - consider more stable assets")
    }
    if (selectedProperties.length < 5) {
      recommendations.push("Add more properties to improve diversification")
    }

    const portfolio: OptimizedPortfolio = {
      properties: selectedProperties,
      totalInvestment,
      expectedROI: avgCapRate,
      riskScore: avgRisk,
      diversificationScore,
      portfolioMetrics: {
        avgCapRate,
        totalUnits,
        submarketDistribution,
        propertyTypeDistribution,
      },
      optimizationScore,
      recommendations,
      riskAnalysis,
    }

    portfolio.aiInsights = await this.generateOptimizationInsights(portfolio, constraints)

    return portfolio
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { constraints = {} } = body

    const properties = await sql`
      SELECT * FROM properties 
      WHERE status IN ('Completed', 'Underway', 'Projected')
      LIMIT 100
    `

    const engine = new PortfolioOptimizationEngine()
    const optimizedPortfolio = await engine.optimize(properties, constraints)

    return NextResponse.json({
      success: true,
      portfolio: optimizedPortfolio,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Portfolio optimization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to optimize portfolio",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Portfolio Optimization API",
    method: "POST",
    description: "Optimize real estate portfolio based on constraints",
  })
}
