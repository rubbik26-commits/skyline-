import { type NextRequest, NextResponse } from "next/server"
import type { EnhancedProperty } from "@/data/enhanced-property-data"
import { getCachedProperties, invalidatePropertyCache } from "@/lib/data-cache"

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

    const filters = { borough, category, status }
    const cachedResult = await getCachedProperties(filters)
    let filtered = cachedResult.properties

    // Apply additional filters that aren't cached
    if (submarket && submarket !== "all" && submarket !== "any") {
      filtered = filtered.filter((p) => p.submarket === submarket)
    }

    if (minPrice) {
      const min = Number.parseInt(minPrice)
      filtered = filtered.filter((p) => (p.askingPrice || 0) >= min)
    }

    if (maxPrice) {
      const max = Number.parseInt(maxPrice)
      filtered = filtered.filter((p) => (p.askingPrice || 0) <= max)
    }

    if (minGSF) {
      const min = Number.parseInt(minGSF)
      filtered = filtered.filter((p) => (p.gsf || 0) >= min)
    }

    if (maxGSF) {
      const max = Number.parseInt(maxGSF)
      filtered = filtered.filter((p) => (p.gsf || 0) <= max)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.address?.toLowerCase().includes(searchLower) ||
          p.borough?.toLowerCase().includes(searchLower) ||
          p.submarket?.toLowerCase().includes(searchLower) ||
          p.propertyCategory?.toLowerCase().includes(searchLower) ||
          p.notes?.toLowerCase().includes(searchLower),
      )
    }

    const analytics = {
      totalValue: filtered.reduce((sum, p) => sum + (p.askingPrice || 0), 0),
      avgPricePerSF:
        filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / filtered.length : 0,
      avgCapRate: filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.capRate || 0), 0) / filtered.length : 0,
      boroughBreakdown: {},
      categoryBreakdown: {},
    }

    const response = NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
      analytics,
      timestamp: new Date().toISOString(),
    })

    // Set cache headers for edge caching
    response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
    response.headers.set("CDN-Cache-Control", "s-maxage=86400")
    response.headers.set("Vary", "Authorization")

    return response
  } catch (error) {
    console.error("Properties API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newProperty: EnhancedProperty = {
      id: Date.now().toString(),
      borough: body.borough || "Manhattan",
      propertyCategory: body.propertyCategory || "Office Buildings",
      zoning: body.zoning || "Commercial",
      yearBuilt: body.yearBuilt || new Date().getFullYear(),
      ...body,
      lastUpdated: new Date(),
    }

    await invalidatePropertyCache()

    return NextResponse.json({
      success: true,
      data: newProperty,
      message: "Property added successfully",
    })
  } catch (error) {
    console.error("Add property error:", error)
    return NextResponse.json({ success: false, error: "Failed to add property" }, { status: 500 })
  }
}
