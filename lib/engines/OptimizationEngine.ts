import "server-only"
import { AnalyticsEngine } from "./AnalyticsEngine"
import { PropertyEngine } from "./PropertyEngine"
import { sql } from "@/lib/database/neon"
import { redis } from "@/lib/database/redis"

export interface OptimizationResult {
  propertyId: string
  currentPrice: number
  recommendedPrice: number
  confidence: number
  factors: {
    marketCondition: string
    competition: {
      level: string
      count: number
      priceRange: { min: number; max: number }
    }
    seasonality: string
    propertyFeatures: {
      bedroomAdvantage: boolean
      bathroomAdvantage: boolean
      sizeAdvantage: boolean
      locationPremium: boolean
    }
  }
  timeline: {
    estimatedDaysToSell: number
    optimalListingTime: {
      bestDayOfWeek: string
      bestTimeOfDay: string
      seasonalRecommendation: string
    }
    milestones: Array<{
      day: number
      action: string
      expected: string
    }>
  }
  roi: {
    projectedROI: number
    breakEvenPrice: number
    maxRecommendedPrice: number
  }
}

export class OptimizationEngine {
  private analytics: AnalyticsEngine
  private properties: PropertyEngine

  constructor() {
    this.analytics = new AnalyticsEngine()
    this.properties = new PropertyEngine()
  }

  async optimizePropertyPricing(propertyId: string): Promise<OptimizationResult> {
    const cacheKey = `optimization:${propertyId}`

    // Try cache first (cache for 1 hour since optimization is computationally expensive)
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached as OptimizationResult
    }

    // Get property insights
    const insights = await this.properties.getPropertyInsights(propertyId)
    const property = insights.property
    const comparables = insights.comparables

    // Get market trends
    const trends = await this.analytics.getMarketTrends(property.borough, 90)

    // AI-powered optimization logic
    const optimization: OptimizationResult = {
      propertyId,
      currentPrice: Number.parseFloat(property.asking_price) || 0,
      recommendedPrice: this.calculateOptimalPrice(property, comparables, trends),
      confidence: this.calculateConfidence(comparables.length, trends.length),
      factors: this.analyzePricingFactors(property, comparables, trends),
      timeline: this.generateTimeline(property, trends),
      roi: this.calculateROIProjections(property, comparables, trends),
    }

    // Store optimization result in database for tracking
    await sql`
      INSERT INTO ai_insights (
        property_id, risk_score, potential_roi, market_trend, confidence,
        analysis_date, investment_grade, model_version, created_at, updated_at
      ) VALUES (
        ${propertyId}, 
        ${this.calculateRiskScore(optimization)}, 
        ${optimization.roi.projectedROI}, 
        ${this.assessMarketTrend(trends)},
        ${optimization.confidence},
        NOW(),
        ${this.calculateInvestmentGrade(optimization)},
        'v2.0',
        NOW(),
        NOW()
      )
      ON CONFLICT (property_id) DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        potential_roi = EXCLUDED.potential_roi,
        market_trend = EXCLUDED.market_trend,
        confidence = EXCLUDED.confidence,
        analysis_date = EXCLUDED.analysis_date,
        updated_at = NOW()
    `

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(optimization))

    return optimization
  }

  async getBatchOptimizations(
    criteria: {
      borough?: string
      property_category?: string
      min_confidence?: number
      limit?: number
    } = {},
  ) {
    const { borough, property_category, min_confidence = 0.7, limit = 20 } = criteria

    // Get properties that need optimization
    const properties = await sql`
      SELECT p.id, p.address, p.borough, p.property_category, p.asking_price,
             ai.confidence, ai.analysis_date
      FROM properties p
      LEFT JOIN ai_insights ai ON p.id = ai.property_id
      WHERE p.status = 'Available'
        AND p.asking_price IS NOT NULL
        ${borough ? sql`AND p.borough = ${borough}` : sql``}
        ${property_category ? sql`AND p.property_category = ${property_category}` : sql``}
        AND (ai.analysis_date IS NULL OR ai.analysis_date < NOW() - INTERVAL '7 days')
      ORDER BY p.asking_price DESC
      LIMIT ${limit}
    `

    const optimizations: OptimizationResult[] = []

    for (const property of properties) {
      try {
        const optimization = await this.optimizePropertyPricing(property.id)
        if (optimization.confidence >= min_confidence) {
          optimizations.push(optimization)
        }
      } catch (error) {
        console.error(`Failed to optimize property ${property.id}:`, error)
      }
    }

    return optimizations.sort((a, b) => b.roi.projectedROI - a.roi.projectedROI)
  }

  private calculateOptimalPrice(property: any, comparables: any[], trends: any[]): number {
    const currentPrice = Number.parseFloat(property.asking_price) || 0
    if (!comparables.length || currentPrice === 0) return currentPrice

    // Weight recent sales more heavily
    const recentComparables = comparables.filter(
      (c) => new Date(c.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    )

    const relevantComps = recentComparables.length > 3 ? recentComparables : comparables

    // Calculate base price from comparables
    const avgCompPrice =
      relevantComps.reduce((sum, c) => sum + (Number.parseFloat(c.asking_price) || 0), 0) / relevantComps.length

    // Adjust for market trends
    const trendAdjustment = this.calculateTrendAdjustment(trends)

    // Apply property-specific adjustments
    const qualityAdjustment = this.calculateQualityAdjustment(property, relevantComps)

    // Apply location premium
    const locationAdjustment = this.calculateLocationAdjustment(property)

    const optimizedPrice = avgCompPrice * (1 + trendAdjustment + qualityAdjustment + locationAdjustment)

    return Math.round(optimizedPrice)
  }

  private calculateTrendAdjustment(trends: any[]): number {
    if (trends.length < 14) return 0

    // Calculate recent vs historical price trends
    const recentTrends = trends.slice(0, 7)
    const historicalTrends = trends.slice(7, 14)

    const recentAvg =
      recentTrends.reduce((sum, t) => sum + (Number.parseFloat(t.avg_value) || 0), 0) / recentTrends.length
    const historicalAvg =
      historicalTrends.reduce((sum, t) => sum + (Number.parseFloat(t.avg_value) || 0), 0) / historicalTrends.length

    if (historicalAvg === 0) return 0

    const changeRate = (recentAvg - historicalAvg) / historicalAvg

    // Cap adjustment at +/- 10%
    return Math.max(-0.1, Math.min(0.1, changeRate))
  }

  private calculateQualityAdjustment(property: any, comparables: any[]): number {
    let adjustment = 0

    // Square footage adjustment
    const avgGSF = comparables.reduce((sum, c) => sum + (Number.parseInt(c.gsf) || 0), 0) / comparables.length
    const propertyGSF = Number.parseInt(property.gsf) || 0

    if (propertyGSF > avgGSF * 1.2) adjustment += 0.08
    else if (propertyGSF > avgGSF * 1.1) adjustment += 0.05
    else if (propertyGSF < avgGSF * 0.8) adjustment -= 0.08
    else if (propertyGSF < avgGSF * 0.9) adjustment -= 0.05

    // Year built adjustment (newer is better)
    const avgYearBuilt =
      comparables.reduce((sum, c) => sum + (Number.parseInt(c.year_built) || 1980), 0) / comparables.length
    const propertyYear = Number.parseInt(property.year_built) || 1980

    if (propertyYear > avgYearBuilt + 10) adjustment += 0.05
    else if (propertyYear < avgYearBuilt - 10) adjustment -= 0.05

    return adjustment
  }

  private calculateLocationAdjustment(property: any): number {
    // Manhattan premium adjustments by submarket
    if (property.borough === "Manhattan") {
      const premiumSubmarkets = [
        "Midtown East",
        "Midtown West",
        "Upper East Side",
        "Upper West Side",
        "Tribeca",
        "SoHo",
        "Greenwich Village",
        "Chelsea",
      ]

      if (premiumSubmarkets.includes(property.submarket)) {
        return 0.05 // 5% premium for prime Manhattan locations
      }
    }

    return 0
  }

  private calculateConfidence(comparableCount: number, trendDataPoints: number): number {
    let confidence = 0.5 // Base confidence

    // More comparables = higher confidence
    confidence += Math.min(0.3, comparableCount * 0.03)

    // More trend data = higher confidence
    confidence += Math.min(0.2, trendDataPoints * 0.005)

    return Math.min(0.95, Math.max(0.1, confidence))
  }

  private analyzePricingFactors(property: any, comparables: any[], trends: any[]) {
    return {
      marketCondition: this.assessMarketCondition(trends),
      competition: this.assessCompetition(comparables),
      seasonality: this.assessSeasonality(trends),
      propertyFeatures: this.assessPropertyFeatures(property, comparables),
    }
  }

  private assessMarketCondition(trends: any[]): string {
    if (trends.length < 7) return "insufficient_data"

    const recentTrends = trends.slice(0, 7)
    const avgActivity =
      recentTrends.reduce((sum, t) => sum + (Number.parseFloat(t.avg_value) || 0), 0) / recentTrends.length

    // Assess based on market activity metrics
    if (avgActivity > 80) return "very_hot"
    if (avgActivity > 60) return "hot"
    if (avgActivity > 40) return "balanced"
    if (avgActivity > 20) return "slow"
    return "very_slow"
  }

  private assessCompetition(comparables: any[]) {
    const activeComps = comparables.filter((c) => c.status === "Available")
    const prices = activeComps.map((c) => Number.parseFloat(c.asking_price) || 0).filter((p) => p > 0)

    return {
      level: activeComps.length > 8 ? "high" : activeComps.length > 4 ? "medium" : "low",
      count: activeComps.length,
      priceRange:
        prices.length > 0
          ? {
              min: Math.min(...prices),
              max: Math.max(...prices),
            }
          : { min: 0, max: 0 },
    }
  }

  private assessSeasonality(trends: any[]): string {
    const currentMonth = new Date().getMonth()

    // Real estate seasonality patterns
    if (currentMonth >= 3 && currentMonth <= 6) return "peak_season" // Apr-Jul
    if (currentMonth >= 8 && currentMonth <= 10) return "good_season" // Sep-Nov
    if (currentMonth === 2 || currentMonth === 7) return "transition_season" // Mar, Aug
    return "slow_season" // Dec-Feb
  }

  private assessPropertyFeatures(property: any, comparables: any[]) {
    if (!comparables.length) {
      return {
        bedroomAdvantage: false,
        bathroomAdvantage: false,
        sizeAdvantage: false,
        locationPremium: false,
      }
    }

    const avgUnits = comparables.reduce((sum, c) => sum + (Number.parseInt(c.units) || 0), 0) / comparables.length
    const avgGSF = comparables.reduce((sum, c) => sum + (Number.parseInt(c.gsf) || 0), 0) / comparables.length

    return {
      bedroomAdvantage: (Number.parseInt(property.units) || 0) > avgUnits,
      bathroomAdvantage: true, // Would need bathroom data
      sizeAdvantage: (Number.parseInt(property.gsf) || 0) > avgGSF,
      locationPremium: property.borough === "Manhattan",
    }
  }

  private generateTimeline(property: any, trends: any[]) {
    const marketCondition = this.assessMarketCondition(trends)

    let daysToSell = 45 // Default

    switch (marketCondition) {
      case "very_hot":
        daysToSell = 15
        break
      case "hot":
        daysToSell = 25
        break
      case "balanced":
        daysToSell = 45
        break
      case "slow":
        daysToSell = 75
        break
      case "very_slow":
        daysToSell = 120
        break
    }

    return {
      estimatedDaysToSell: daysToSell,
      optimalListingTime: this.calculateOptimalListingTime(),
      milestones: this.generateMilestones(daysToSell),
    }
  }

  private calculateOptimalListingTime() {
    const now = new Date()
    const month = now.getMonth()

    return {
      bestDayOfWeek: "Thursday",
      bestTimeOfDay: "10:00 AM",
      seasonalRecommendation:
        month >= 2 && month <= 6 ? "optimal" : month >= 8 && month <= 10 ? "good" : "consider_waiting",
    }
  }

  private generateMilestones(daysToSell: number) {
    return [
      { day: 7, action: "Monitor initial interest", expected: "First showings and inquiries" },
      { day: 14, action: "Evaluate market response", expected: "Serious buyer interest" },
      { day: Math.floor(daysToSell * 0.5), action: "Mid-market assessment", expected: "Multiple showings" },
      { day: Math.floor(daysToSell * 0.75), action: "Consider price adjustment", expected: "Negotiate offers" },
      { day: daysToSell, action: "Target completion", expected: "Accepted offer" },
    ]
  }

  private calculateROIProjections(property: any, comparables: any[], trends: any[]) {
    const currentPrice = Number.parseFloat(property.asking_price) || 0
    const recommendedPrice = this.calculateOptimalPrice(property, comparables, trends)

    const projectedROI = currentPrice > 0 ? ((recommendedPrice - currentPrice) / currentPrice) * 100 : 0

    return {
      projectedROI: Math.round(projectedROI * 100) / 100,
      breakEvenPrice: currentPrice,
      maxRecommendedPrice: Math.round(currentPrice * 1.15), // Max 15% above current
    }
  }

  private calculateRiskScore(optimization: OptimizationResult): number {
    let riskScore = 50 // Base risk score

    // Adjust based on confidence
    riskScore -= (optimization.confidence - 0.5) * 40

    // Adjust based on market condition
    const marketCondition = optimization.factors.marketCondition
    if (marketCondition === "very_hot") riskScore -= 15
    else if (marketCondition === "hot") riskScore -= 10
    else if (marketCondition === "slow") riskScore += 10
    else if (marketCondition === "very_slow") riskScore += 20

    // Adjust based on competition
    if (optimization.factors.competition.level === "high") riskScore += 15
    else if (optimization.factors.competition.level === "low") riskScore -= 10

    return Math.max(0, Math.min(100, Math.round(riskScore)))
  }

  private assessMarketTrend(trends: any[]): string {
    if (trends.length < 7) return "neutral"

    const recentTrends = trends.slice(0, 7)
    const olderTrends = trends.slice(7, 14)

    if (olderTrends.length === 0) return "neutral"

    const recentAvg =
      recentTrends.reduce((sum, t) => sum + (Number.parseFloat(t.avg_value) || 0), 0) / recentTrends.length
    const olderAvg = olderTrends.reduce((sum, t) => sum + (Number.parseFloat(t.avg_value) || 0), 0) / olderTrends.length

    const change = (recentAvg - olderAvg) / olderAvg

    if (change > 0.05) return "bullish"
    if (change < -0.05) return "bearish"
    return "neutral"
  }

  private calculateInvestmentGrade(optimization: OptimizationResult): string {
    let score = 0

    // ROI contribution
    if (optimization.roi.projectedROI > 15) score += 30
    else if (optimization.roi.projectedROI > 10) score += 25
    else if (optimization.roi.projectedROI > 5) score += 20
    else if (optimization.roi.projectedROI > 0) score += 15

    // Confidence contribution
    score += optimization.confidence * 30

    // Market condition contribution
    const marketCondition = optimization.factors.marketCondition
    if (marketCondition === "very_hot") score += 25
    else if (marketCondition === "hot") score += 20
    else if (marketCondition === "balanced") score += 15
    else if (marketCondition === "slow") score += 10
    else score += 5

    // Risk adjustment
    const riskScore = this.calculateRiskScore(optimization)
    score += (100 - riskScore) * 0.15

    if (score >= 85) return "A+"
    if (score >= 80) return "A"
    if (score >= 75) return "B+"
    if (score >= 70) return "B"
    if (score >= 65) return "C+"
    if (score >= 60) return "C"
    return "D"
  }
}
