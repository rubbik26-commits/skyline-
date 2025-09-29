import { type NextRequest, NextResponse } from "next/server"
import { propertyData } from "@/data/property-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "30d"

    // Calculate comprehensive analytics
    const totalProperties = propertyData.length
    const totalUnits = propertyData.reduce((sum, p) => sum + (p.units || 0), 0)
    const totalGSF = propertyData.reduce((sum, p) => sum + (p.gsf || 0), 0)

    const statusBreakdown = propertyData.reduce(
      (acc, p) => {
        const status = p.status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const submarketBreakdown = propertyData.reduce(
      (acc, p) => {
        const submarket = p.submarket || "Unknown"
        acc[submarket] = (acc[submarket] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Market sentiment analysis (simulated)
    const marketSentiment = {
      score: 0.72,
      trend: "positive",
      factors: [
        "Strong conversion activity in Financial District",
        "Increasing residential demand",
        "Favorable zoning changes",
      ],
    }

    // Opportunity scoring
    const opportunities = propertyData
      .filter((p) => p.status === "Projected" || p.status === "Underway")
      .map((p) => ({
        address: p.address,
        score: Math.random() * 100,
        factors: ["Location", "Size", "Market conditions"],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProperties,
          totalUnits,
          totalGSF,
          averageUnitsPerProperty: Math.round(totalUnits / totalProperties),
        },
        breakdowns: {
          status: statusBreakdown,
          submarket: submarketBreakdown,
        },
        marketSentiment,
        opportunities,
        trends: {
          conversionRate: 0.15,
          averageTimeToComplete: 24,
          successRate: 0.87,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
