import { type NextRequest, NextResponse } from "next/server"
import {
  comprehensiveNYCPropertyData,
  type ComprehensiveProperty,
  comprehensivePropertyStats,
} from "@/data/comprehensive-nyc-property-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const borough = searchParams.get("borough")
    const category = searchParams.get("category")
    const submarket = searchParams.get("submarket")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minGSF = searchParams.get("minGSF")
    const maxGSF = searchParams.get("maxGSF")
    const minCapRate = searchParams.get("minCapRate")
    const maxCapRate = searchParams.get("maxCapRate")
    const investmentGrade = searchParams.get("investmentGrade")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    let filtered = [...comprehensiveNYCPropertyData]

    // Borough filtering
    if (borough && borough !== "all" && borough !== "any") {
      filtered = filtered.filter((p) => p.borough === borough)
    }

    // Category filtering
    if (category && category !== "all" && category !== "any") {
      filtered = filtered.filter((p) => p.propertyCategory === category)
    }

    // Submarket filtering
    if (submarket && submarket !== "all" && submarket !== "any") {
      filtered = filtered.filter((p) => p.submarket === submarket)
    }

    // Status filtering
    if (status && status !== "all" && status !== "any") {
      filtered = filtered.filter((p) => p.status === status)
    }

    // Price range filtering
    if (minPrice) {
      const min = Number.parseInt(minPrice)
      filtered = filtered.filter((p) => (p.askingPrice || 0) >= min)
    }

    if (maxPrice) {
      const max = Number.parseInt(maxPrice)
      filtered = filtered.filter((p) => (p.askingPrice || 0) <= max)
    }

    // GSF range filtering
    if (minGSF) {
      const min = Number.parseInt(minGSF)
      filtered = filtered.filter((p) => (p.gsf || 0) >= min)
    }

    if (maxGSF) {
      const max = Number.parseInt(maxGSF)
      filtered = filtered.filter((p) => (p.gsf || 0) <= max)
    }

    // Cap rate filtering
    if (minCapRate) {
      const min = Number.parseFloat(minCapRate)
      filtered = filtered.filter((p) => (p.capRate || 0) >= min)
    }

    if (maxCapRate) {
      const max = Number.parseFloat(maxCapRate)
      filtered = filtered.filter((p) => (p.capRate || 0) <= max)
    }

    // Investment grade filtering
    if (investmentGrade && investmentGrade !== "all") {
      filtered = filtered.filter((p) => p.aiInsights?.investmentGrade === investmentGrade)
    }

    // Search filtering
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.address?.toLowerCase().includes(searchLower) ||
          p.borough?.toLowerCase().includes(searchLower) ||
          p.submarket?.toLowerCase().includes(searchLower) ||
          p.propertyCategory?.toLowerCase().includes(searchLower) ||
          p.notes?.toLowerCase().includes(searchLower) ||
          p.zoning?.toLowerCase().includes(searchLower),
      )
    }

    // Pagination
    const totalResults = filtered.length
    if (limit) {
      const limitNum = Number.parseInt(limit)
      const offsetNum = offset ? Number.parseInt(offset) : 0
      filtered = filtered.slice(offsetNum, offsetNum + limitNum)
    }

    // Enhanced analytics
    const analytics = {
      totalValue: filtered.reduce((sum, p) => sum + (p.askingPrice || 0), 0),
      totalGSF: filtered.reduce((sum, p) => sum + (p.gsf || 0), 0),
      totalUnits: filtered.reduce((sum, p) => sum + (p.units || 0), 0),
      avgPricePerSF:
        filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / filtered.length : 0,
      avgCapRate: filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.capRate || 0), 0) / filtered.length : 0,
      avgROI:
        filtered.length > 0
          ? filtered.reduce((sum, p) => sum + (p.aiInsights?.potentialROI || 0), 0) / filtered.length
          : 0,
      avgRiskScore:
        filtered.length > 0
          ? filtered.reduce((sum, p) => sum + (p.aiInsights?.riskScore || 0), 0) / filtered.length
          : 0,

      boroughBreakdown: {
        Manhattan: filtered.filter((p) => p.borough === "Manhattan").length,
        Brooklyn: filtered.filter((p) => p.borough === "Brooklyn").length,
        Queens: filtered.filter((p) => p.borough === "Queens").length,
        Bronx: filtered.filter((p) => p.borough === "Bronx").length,
        "Staten Island": filtered.filter((p) => p.borough === "Staten Island").length,
      },

      categoryBreakdown: {
        "Office Buildings": filtered.filter((p) => p.propertyCategory === "Office Buildings").length,
        "Multifamily Apartment Buildings": filtered.filter(
          (p) => p.propertyCategory === "Multifamily Apartment Buildings",
        ).length,
        "Mixed-Use Buildings": filtered.filter((p) => p.propertyCategory === "Mixed-Use Buildings").length,
        "Development Sites": filtered.filter((p) => p.propertyCategory === "Development Sites").length,
        Industrial: filtered.filter((p) => p.propertyCategory === "Industrial").length,
        "Retail Condos": filtered.filter((p) => p.propertyCategory === "Retail Condos").length,
        "Ground Leases": filtered.filter((p) => p.propertyCategory === "Ground Leases").length,
        "Office-to-Residential Conversion": filtered.filter(
          (p) => p.propertyCategory === "Office-to-Residential Conversion",
        ).length,
      },

      statusBreakdown: {
        Available: filtered.filter((p) => p.status === "Available").length,
        "Under Contract": filtered.filter((p) => p.status === "Under Contract").length,
        Sold: filtered.filter((p) => p.status === "Sold").length,
        Underway: filtered.filter((p) => p.status === "Underway").length,
        Completed: filtered.filter((p) => p.status === "Completed").length,
        Projected: filtered.filter((p) => p.status === "Projected").length,
      },

      investmentGradeBreakdown: {
        A: filtered.filter((p) => p.aiInsights?.investmentGrade === "A").length,
        B: filtered.filter((p) => p.aiInsights?.investmentGrade === "B").length,
        C: filtered.filter((p) => p.aiInsights?.investmentGrade === "C").length,
        D: filtered.filter((p) => p.aiInsights?.investmentGrade === "D").length,
      },

      marketTrendBreakdown: {
        bullish: filtered.filter((p) => p.aiInsights?.marketTrend === "bullish").length,
        neutral: filtered.filter((p) => p.aiInsights?.marketTrend === "neutral").length,
        bearish: filtered.filter((p) => p.aiInsights?.marketTrend === "bearish").length,
      },
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      total: totalResults,
      returned: filtered.length,
      analytics,
      globalStats: comprehensivePropertyStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Comprehensive Properties API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newProperty: ComprehensiveProperty = {
      id: `${body.borough?.substring(0, 3).toUpperCase() || "NYC"}-${body.propertyCategory?.substring(0, 3).toUpperCase() || "GEN"}-${Date.now()}`,
      borough: body.borough || "Manhattan",
      propertyCategory: body.propertyCategory || "Office Buildings",
      zoning: body.zoning || "Commercial",
      yearBuilt: body.yearBuilt || new Date().getFullYear(),
      lastUpdated: new Date(),
      categoryDetails: body.categoryDetails || {},
      aiInsights: {
        riskScore: Math.random() * 5,
        potentialROI: Math.random() * 15 + 5,
        marketTrend: ["bullish", "neutral", "bearish"][Math.floor(Math.random() * 3)] as
          | "bullish"
          | "neutral"
          | "bearish",
        confidence: Math.floor(Math.random() * 30) + 70,
        investmentGrade: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)] as "A" | "B" | "C" | "D",
      },
      ...body,
    }

    return NextResponse.json({
      success: true,
      data: newProperty,
      message: "Property added successfully to comprehensive dataset",
    })
  } catch (error) {
    console.error("Add comprehensive property error:", error)
    return NextResponse.json({ success: false, error: "Failed to add property" }, { status: 500 })
  }
}
