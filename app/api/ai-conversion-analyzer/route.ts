import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { unstable_cache } from "next/cache"

interface ConversionAnalysisRequest {
  properties?: any[]
  focus?: string
  analysisType?: "market" | "property" | "financial" | "risk" | "comprehensive"
  filters?: {
    borough?: string
    priceRange?: [number, number]
    buildingAge?: [number, number]
    propertyType?: string
  }
}

interface ConversionScore {
  overall: number
  location: number
  building: number
  financial: number
  market: number
  risk: number
}

// AI-powered conversion analysis engine
class ManhattanConversionAnalyzer {
  private async analyzeWithAI(prompt: string, context: any) {
    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `You are a Manhattan real estate conversion expert with deep knowledge of office-to-residential conversions. 

Context: ${JSON.stringify(context, null, 2)}

${prompt}

Provide detailed, actionable insights based on current market conditions, zoning regulations, and financial feasibility. Focus on Manhattan-specific factors like:
- Submarket dynamics (Midtown, FiDi, Tribeca, etc.)
- Zoning compliance (R10, C6, mixed-use districts)
- Construction costs and timelines
- Market demand and rental rates
- ROI projections and risk factors

Format your response as structured analysis with specific recommendations.`,
      })

      return text
    } catch (error) {
      console.error("AI analysis error:", error)
      return "AI analysis temporarily unavailable. Using fallback analysis."
    }
  }

  calculateConversionScore(property: any): ConversionScore {
    const scores = {
      overall: 0,
      location: 0,
      building: 0,
      financial: 0,
      market: 0,
      risk: 0,
    }

    // Location scoring (0-100)
    const locationFactors = {
      "Financial District": 85,
      "Midtown South": 90,
      Tribeca: 95,
      SoHo: 88,
      Chelsea: 82,
      "Hell's Kitchen": 78,
      "Upper East Side": 75,
      "Midtown East": 70,
      "Lower East Side": 80,
      "Greenwich Village": 92,
    }

    scores.location = locationFactors[property.submarket as keyof typeof locationFactors] || 65

    // Building scoring
    const currentYear = new Date().getFullYear()
    const buildingAge = property.yearBuilt ? currentYear - Number.parseInt(property.yearBuilt) : 50

    // Pre-war buildings (1900-1940) often score higher for conversions
    if (buildingAge >= 80 && buildingAge <= 120) {
      scores.building = 85 // Pre-war charm
    } else if (buildingAge >= 40 && buildingAge <= 80) {
      scores.building = 75 // Post-war solid construction
    } else if (buildingAge < 40) {
      scores.building = 65 // Modern but may have layout challenges
    } else {
      scores.building = 60 // Very old, potential structural issues
    }

    // Adjust for building class
    if (property.bldgclass?.startsWith("O")) {
      scores.building += 10 // Office buildings are ideal
    } else if (property.bldgclass?.startsWith("K")) {
      scores.building += 5 // Store buildings can work
    }

    // Financial scoring
    const pricePerSF = property.pricePerSF || 0
    if (pricePerSF > 0) {
      if (pricePerSF < 600) {
        scores.financial = 90 // Great value
      } else if (pricePerSF < 800) {
        scores.financial = 80 // Good value
      } else if (pricePerSF < 1000) {
        scores.financial = 70 // Fair value
      } else {
        scores.financial = 50 // Expensive
      }
    } else {
      scores.financial = 60 // No pricing data
    }

    // Market scoring based on current trends
    const marketConditions = {
      "Financial District": 85, // Strong rental demand
      "Midtown South": 90, // Hot market
      Tribeca: 95, // Premium market
      SoHo: 88, // Stable luxury
      Chelsea: 82, // Growing
      "Hell's Kitchen": 85, // Transportation hub
    }

    scores.market = marketConditions[property.submarket as keyof typeof marketConditions] || 70

    // Risk scoring (inverse - lower risk = higher score)
    let riskScore = 80 // Base risk score

    // Zoning risk
    if (property.zoning?.includes("R")) {
      riskScore += 10 // Already residential zoning
    } else if (property.zoning?.includes("C")) {
      riskScore += 5 // Commercial zoning, convertible
    }

    // Size risk
    const gsf = property.gsf || 0
    if (gsf > 50000) {
      riskScore -= 10 // Large buildings have more complexity
    } else if (gsf < 10000) {
      riskScore -= 5 // Very small may not be economical
    }

    scores.risk = Math.max(0, Math.min(100, riskScore))

    // Calculate overall score
    scores.overall = Math.round(
      scores.location * 0.25 +
        scores.building * 0.2 +
        scores.financial * 0.25 +
        scores.market * 0.2 +
        scores.risk * 0.1,
    )

    return scores
  }

  async analyzeMarketTrends(properties: any[]) {
    const context = {
      totalProperties: properties.length,
      avgPrice: properties.reduce((sum, p) => sum + (p.askingPrice || 0), 0) / properties.length,
      submarkets: [...new Set(properties.map((p) => p.submarket))],
      buildingTypes: [...new Set(properties.map((p) => p.propertyCategory))],
    }

    const prompt = `Analyze the current Manhattan office-to-residential conversion market trends. What are the key opportunities, risks, and recommendations for investors?`

    return await this.analyzeWithAI(prompt, context)
  }

  async analyzeProperty(property: any) {
    const score = this.calculateConversionScore(property)

    const prompt = `Analyze this specific Manhattan property for office-to-residential conversion potential. Provide detailed feasibility assessment, cost estimates, timeline, and ROI projections.`

    const aiAnalysis = await this.analyzeWithAI(prompt, { property, score })

    return {
      property,
      conversionScore: score,
      aiAnalysis,
      recommendations: this.generateRecommendations(property, score),
      financialProjections: this.calculateFinancialProjections(property),
    }
  }

  generateRecommendations(property: any, score: ConversionScore): string[] {
    const recommendations = []

    if (score.overall >= 80) {
      recommendations.push("🟢 Excellent conversion candidate - proceed with due diligence")
    } else if (score.overall >= 65) {
      recommendations.push("🟡 Good potential with some considerations")
    } else {
      recommendations.push("🔴 High risk - requires careful evaluation")
    }

    if (score.location >= 85) {
      recommendations.push("📍 Prime location advantage - expect premium pricing")
    }

    if (score.building >= 80) {
      recommendations.push("🏗️ Building structure favorable for conversion")
    } else if (score.building < 65) {
      recommendations.push("⚠️ Building may require significant structural work")
    }

    if (score.financial >= 80) {
      recommendations.push("💰 Attractive acquisition pricing")
    } else if (score.financial < 60) {
      recommendations.push("💸 Consider negotiating purchase price")
    }

    if (score.risk < 70) {
      recommendations.push("⚠️ Higher risk factors - conduct thorough feasibility study")
    }

    return recommendations
  }

  calculateFinancialProjections(property: any) {
    const acquisitionCost = property.askingPrice || 0
    const gsf = property.gsf || 10000
    const conversionCostPerSF = 250 // Average conversion cost
    const conversionCost = gsf * conversionCostPerSF

    const totalInvestment = acquisitionCost + conversionCost
    const estimatedUnits = Math.floor(gsf / 800) // Assume 800 SF average unit
    const monthlyRentPerUnit = 4500 // Manhattan average
    const annualRent = estimatedUnits * monthlyRentPerUnit * 12
    const capRate = totalInvestment > 0 ? (annualRent / totalInvestment) * 100 : 0

    return {
      acquisitionCost,
      conversionCost,
      totalInvestment,
      estimatedUnits,
      projectedAnnualRent: annualRent,
      projectedCapRate: capRate,
      breakEvenMonths: totalInvestment > 0 ? Math.ceil(totalInvestment / (annualRent / 12)) : 0,
      fiveYearROI: capRate * 5 + 15, // Assume 3% annual appreciation
    }
  }
}

// Cached analysis function
const getCachedAnalysis = unstable_cache(
  async (analysisType: string, properties: any[], filters: any) => {
    const analyzer = new ManhattanConversionAnalyzer()

    switch (analysisType) {
      case "market":
        return {
          type: "market",
          analysis: await analyzer.analyzeMarketTrends(properties),
          timestamp: new Date().toISOString(),
        }
      case "comprehensive":
        const topProperties = properties
          .map((p) => ({
            ...p,
            score: analyzer.calculateConversionScore(p),
          }))
          .sort((a, b) => b.score.overall - a.score.overall)
          .slice(0, 10)

        return {
          type: "comprehensive",
          marketAnalysis: await analyzer.analyzeMarketTrends(properties),
          topOpportunities: await Promise.all(topProperties.slice(0, 5).map((p) => analyzer.analyzeProperty(p))),
          marketMetrics: {
            totalProperties: properties.length,
            avgConversionScore: topProperties.reduce((sum, p) => sum + p.score.overall, 0) / topProperties.length,
            topSubmarkets: [...new Set(topProperties.slice(0, 5).map((p) => p.submarket))],
          },
          timestamp: new Date().toISOString(),
        }
      default:
        return {
          type: "property",
          analyses: await Promise.all(properties.slice(0, 5).map((p) => analyzer.analyzeProperty(p))),
          timestamp: new Date().toISOString(),
        }
    }
  },
  ["ai-conversion-analysis"],
  { revalidate: 1800, tags: ["ai-analysis", "conversion-data"] },
)

export async function POST(request: NextRequest) {
  try {
    const body: ConversionAnalysisRequest = await request.json()
    const { properties = [], analysisType = "comprehensive", filters = {} } = body

    if (properties.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No properties provided for analysis",
        },
        { status: 400 },
      )
    }

    // Filter properties based on criteria
    let filteredProperties = properties

    if (filters.borough && filters.borough !== "all") {
      filteredProperties = filteredProperties.filter((p) => p.borough === filters.borough)
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      filteredProperties = filteredProperties.filter((p) => p.askingPrice >= min && p.askingPrice <= max)
    }

    if (filters.propertyType && filters.propertyType !== "all") {
      filteredProperties = filteredProperties.filter((p) => p.propertyCategory === filters.propertyType)
    }

    const analysis = await getCachedAnalysis(analysisType, filteredProperties, filters)

    const response = NextResponse.json({
      success: true,
      ...analysis,
      propertiesAnalyzed: filteredProperties.length,
      filters: filters,
    })

    // Set cache headers
    response.headers.set("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600")
    response.headers.set("CDN-Cache-Control", "s-maxage=7200")

    return response
  } catch (error) {
    console.error("AI Conversion Analyzer error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
        fallback: "AI analysis temporarily unavailable",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisType = searchParams.get("type") || "market"

    // Return analysis capabilities and status
    return NextResponse.json({
      success: true,
      capabilities: {
        analysisTypes: ["market", "property", "financial", "risk", "comprehensive"],
        features: [
          "AI-powered conversion scoring",
          "Market trend analysis",
          "Financial projections",
          "Risk assessment",
          "Submarket comparison",
          "ROI calculations",
        ],
        supportedFilters: ["borough", "priceRange", "buildingAge", "propertyType"],
      },
      status: "operational",
      model: "GPT-4o-mini",
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI Analyzer status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get analyzer status",
      },
      { status: 500 },
    )
  }
}
