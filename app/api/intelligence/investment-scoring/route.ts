import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { unstable_cache } from "next/cache"
import { getCachedProperties } from "@/lib/data-cache"

interface InvestmentScore {
  overall: number
  location: number
  financial: number
  market: number
  risk: number
  growth: number
  liquidity: number
}

interface ScoredProperty {
  property: any
  score: InvestmentScore
  ranking: number
  aiAnalysis: string
  investmentThesis: string
  riskFactors: string[]
  opportunities: string[]
  financialProjections: {
    projectedROI: number
    paybackPeriod: number
    riskAdjustedReturn: number
    liquidityScore: number
  }
}

class InvestmentScoringEngine {
  private async generateInvestmentAnalysis(property: any, score: InvestmentScore) {
    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `You are a Manhattan real estate investment analyst. Analyze this property for investment potential.

Property Details: ${JSON.stringify(property, null, 2)}
Investment Scores: ${JSON.stringify(score, null, 2)}

Provide a comprehensive investment analysis including:
- Investment thesis and rationale
- Key value drivers and opportunities
- Risk assessment and mitigation strategies
- Market positioning and competitive advantages
- Financial projections and return expectations
- Exit strategy considerations

Focus on Manhattan-specific factors like submarket dynamics, zoning opportunities, and conversion potential.`,
      })

      return text
    } catch (error) {
      console.error("Investment analysis AI error:", error)
      return "Investment analysis temporarily unavailable."
    }
  }

  calculateInvestmentScore(property: any): InvestmentScore {
    const scores = {
      overall: 0,
      location: 0,
      financial: 0,
      market: 0,
      risk: 0,
      growth: 0,
      liquidity: 0,
    }

    // Location scoring (0-100)
    const locationScores = {
      "Financial District": 85,
      "Midtown South": 90,
      Tribeca: 95,
      SoHo: 88,
      Chelsea: 82,
      "Hell's Kitchen": 78,
      "Greenwich Village": 92,
      "Upper East Side": 75,
      "Lower East Side": 80,
      "Midtown East": 70,
    }

    scores.location = locationScores[property.submarket as keyof typeof locationScores] || 65

    // Financial scoring based on cap rate, price per SF, and asking price
    const capRate = property.capRate || 0
    const pricePerSF = property.pricePerSF || 0
    const askingPrice = property.askingPrice || 0

    if (capRate > 6) {
      scores.financial = 90
    } else if (capRate > 4) {
      scores.financial = 75
    } else if (capRate > 2) {
      scores.financial = 60
    } else {
      scores.financial = 40
    }

    // Adjust for price per SF (value scoring)
    if (pricePerSF > 0) {
      if (pricePerSF < 600) {
        scores.financial += 10 // Good value
      } else if (pricePerSF > 1000) {
        scores.financial -= 10 // Expensive
      }
    }

    // Market scoring based on property type and status
    let marketScore = 60 // Base market score

    if (property.propertyCategory?.includes("Office")) {
      marketScore += 15 // High conversion potential
    } else if (property.propertyCategory?.includes("Mixed-Use")) {
      marketScore += 10 // Diversified income
    }

    if (property.status === "Available") {
      marketScore += 10 // Ready to transact
    } else if (property.status === "Under Contract") {
      marketScore -= 20 // Not available
    }

    scores.market = Math.min(100, marketScore)

    // Risk scoring (inverse - lower risk = higher score)
    let riskScore = 70 // Base risk score

    // Building age risk
    const currentYear = new Date().getFullYear()
    const buildingAge = property.yearBuilt ? currentYear - Number.parseInt(property.yearBuilt) : 50

    if (buildingAge >= 80 && buildingAge <= 120) {
      riskScore += 10 // Pre-war buildings often good for conversions
    } else if (buildingAge > 120) {
      riskScore -= 15 // Very old buildings have higher risk
    }

    // Size risk
    const gsf = property.gsf || 0
    if (gsf > 100000) {
      riskScore -= 10 // Large buildings more complex
    } else if (gsf < 5000) {
      riskScore -= 5 // Very small may not be economical
    }

    // Zoning risk
    if (property.zoning?.includes("R")) {
      riskScore += 10 // Residential zoning lower risk
    } else if (property.zoning?.includes("M")) {
      riskScore -= 5 // Manufacturing zoning higher risk
    }

    scores.risk = Math.max(0, Math.min(100, riskScore))

    // Growth potential scoring
    let growthScore = 60 // Base growth score

    // Submarket growth potential
    const growthSubmarkets = ["Hell's Kitchen", "Lower East Side", "Long Island City"]
    if (growthSubmarkets.includes(property.submarket)) {
      growthScore += 20
    }

    // Property type growth potential
    if (property.propertyCategory?.includes("Office") && property.status !== "Completed") {
      growthScore += 15 // Conversion upside
    }

    scores.growth = Math.min(100, growthScore)

    // Liquidity scoring
    let liquidityScore = 50 // Base liquidity

    // Location liquidity
    const highLiquidityAreas = ["Midtown South", "Financial District", "Tribeca"]
    if (highLiquidityAreas.includes(property.submarket)) {
      liquidityScore += 20
    }

    // Size liquidity
    if (askingPrice > 0) {
      if (askingPrice < 10000000) {
        liquidityScore += 15 // Smaller properties more liquid
      } else if (askingPrice > 50000000) {
        liquidityScore -= 10 // Large properties less liquid
      }
    }

    scores.liquidity = Math.max(0, Math.min(100, liquidityScore))

    // Calculate overall score (weighted average)
    scores.overall = Math.round(
      scores.location * 0.2 +
        scores.financial * 0.25 +
        scores.market * 0.15 +
        scores.risk * 0.15 +
        scores.growth * 0.15 +
        scores.liquidity * 0.1,
    )

    return scores
  }

  calculateFinancialProjections(property: any, score: InvestmentScore) {
    const askingPrice = property.askingPrice || 0
    const capRate = property.capRate || 0
    const gsf = property.gsf || 10000

    // ROI projection based on scores
    const baseROI = capRate > 0 ? capRate : 5
    const locationMultiplier = score.location / 100
    const growthMultiplier = score.growth / 100

    const projectedROI = baseROI * (1 + locationMultiplier * 0.3 + growthMultiplier * 0.2)

    // Payback period calculation
    const annualCashFlow = askingPrice * (capRate / 100)
    const paybackPeriod = annualCashFlow > 0 ? askingPrice / annualCashFlow : 0

    // Risk-adjusted return
    const riskAdjustment = score.risk / 100
    const riskAdjustedReturn = projectedROI * riskAdjustment

    // Liquidity score
    const liquidityScore = score.liquidity

    return {
      projectedROI: Math.round(projectedROI * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      riskAdjustedReturn: Math.round(riskAdjustedReturn * 100) / 100,
      liquidityScore,
    }
  }

  generateInvestmentThesis(property: any, score: InvestmentScore): string {
    const theses = []

    if (score.overall >= 80) {
      theses.push("Strong investment opportunity with multiple value drivers")
    } else if (score.overall >= 65) {
      theses.push("Solid investment with good fundamentals")
    } else {
      theses.push("Speculative opportunity requiring careful analysis")
    }

    if (score.location >= 85) {
      theses.push(`Prime ${property.submarket} location provides strong foundation`)
    }

    if (score.financial >= 80) {
      theses.push("Attractive financial metrics support investment case")
    }

    if (score.growth >= 75) {
      theses.push("Significant upside potential from market trends")
    }

    return theses.join(". ") + "."
  }

  identifyRiskFactors(property: any, score: InvestmentScore): string[] {
    const risks = []

    if (score.risk < 60) {
      risks.push("Higher than average investment risk profile")
    }

    if (score.financial < 60) {
      risks.push("Financial metrics below market standards")
    }

    if (property.yearBuilt && new Date().getFullYear() - Number.parseInt(property.yearBuilt) > 100) {
      risks.push("Building age may require significant capital improvements")
    }

    if (property.askingPrice > 50000000) {
      risks.push("Large transaction size may limit buyer pool")
    }

    if (score.liquidity < 50) {
      risks.push("Limited liquidity may impact exit strategy timing")
    }

    const riskSubmarkets = ["Upper West Side", "Inwood", "Washington Heights"]
    if (riskSubmarkets.includes(property.submarket)) {
      risks.push("Submarket may have limited institutional investor interest")
    }

    return risks
  }

  identifyOpportunities(property: any, score: InvestmentScore): string[] {
    const opportunities = []

    if (property.propertyCategory?.includes("Office") && property.status !== "Completed") {
      opportunities.push("Office-to-residential conversion potential")
    }

    if (score.growth >= 75) {
      opportunities.push("Strong growth trajectory in submarket")
    }

    if (property.zoning?.includes("C") || property.zoning?.includes("M")) {
      opportunities.push("Mixed-use development potential")
    }

    if (score.location >= 85 && score.financial >= 75) {
      opportunities.push("Value-add opportunity in prime location")
    }

    if (property.gsf > 50000) {
      opportunities.push("Scale advantages for institutional ownership")
    }

    const emergingAreas = ["Hell's Kitchen", "Lower East Side", "Long Island City"]
    if (emergingAreas.includes(property.submarket)) {
      opportunities.push("Early entry into emerging submarket")
    }

    return opportunities
  }

  async scoreProperties(properties: any[]): Promise<ScoredProperty[]> {
    const scoredProperties = await Promise.all(
      properties.map(async (property, index) => {
        const score = this.calculateInvestmentScore(property)
        const aiAnalysis = await this.generateInvestmentAnalysis(property, score)
        const investmentThesis = this.generateInvestmentThesis(property, score)
        const riskFactors = this.identifyRiskFactors(property, score)
        const opportunities = this.identifyOpportunities(property, score)
        const financialProjections = this.calculateFinancialProjections(property, score)

        return {
          property,
          score,
          ranking: 0, // Will be set after sorting
          aiAnalysis,
          investmentThesis,
          riskFactors,
          opportunities,
          financialProjections,
        }
      }),
    )

    // Sort by overall score and assign rankings
    scoredProperties.sort((a, b) => b.score.overall - a.score.overall)
    scoredProperties.forEach((sp, index) => {
      sp.ranking = index + 1
    })

    return scoredProperties
  }
}

// Cached investment scoring
const getCachedInvestmentScoring = unstable_cache(
  async (filters: any, limit: number) => {
    const engine = new InvestmentScoringEngine()
    const { properties } = await getCachedProperties({})

    // Apply filters
    let filteredProperties = properties

    if (filters.submarket && filters.submarket !== "all") {
      filteredProperties = filteredProperties.filter((p) => p.submarket === filters.submarket)
    }

    if (filters.propertyType && filters.propertyType !== "all") {
      filteredProperties = filteredProperties.filter((p) => p.propertyCategory === filters.propertyType)
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter((p) => (p.askingPrice || 0) >= filters.minPrice)
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter((p) => (p.askingPrice || 0) <= filters.maxPrice)
    }

    // Score properties
    const scoredProperties = await engine.scoreProperties(filteredProperties)

    // Apply limit
    const limitedResults = scoredProperties.slice(0, limit)

    // Calculate summary statistics
    const avgScore = scoredProperties.reduce((sum, sp) => sum + sp.score.overall, 0) / scoredProperties.length
    const scoreDistribution = {
      excellent: scoredProperties.filter((sp) => sp.score.overall >= 80).length,
      good: scoredProperties.filter((sp) => sp.score.overall >= 65 && sp.score.overall < 80).length,
      fair: scoredProperties.filter((sp) => sp.score.overall >= 50 && sp.score.overall < 65).length,
      poor: scoredProperties.filter((sp) => sp.score.overall < 50).length,
    }

    return {
      scoredProperties: limitedResults,
      summary: {
        totalAnalyzed: scoredProperties.length,
        avgScore: Math.round(avgScore),
        scoreDistribution,
        topSubmarkets: [...new Set(limitedResults.slice(0, 10).map((sp) => sp.property.submarket))],
      },
      timestamp: new Date().toISOString(),
    }
  },
  ["investment-scoring"],
  { revalidate: 1800, tags: ["investment-data", "scoring"] },
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters = {}, limit = 20, includeAnalysis = true } = body

    const results = await getCachedInvestmentScoring(filters, limit)

    const response = NextResponse.json({
      success: true,
      ...results,
    })

    // Set cache headers
    response.headers.set("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600")
    response.headers.set("CDN-Cache-Control", "s-maxage=7200")

    return response
  } catch (error) {
    console.error("Investment scoring API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to score investments",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const submarket = searchParams.get("submarket") || "all"
    const propertyType = searchParams.get("propertyType") || "all"
    const minPrice = searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseInt(searchParams.get("maxPrice")!) : undefined

    const filters = { submarket, propertyType, minPrice, maxPrice }
    const results = await getCachedInvestmentScoring(filters, limit)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error("Investment scoring GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch investment scores",
      },
      { status: 500 },
    )
  }
}
