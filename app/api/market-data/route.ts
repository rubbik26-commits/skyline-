import { type NextRequest, NextResponse } from "next/server"
import { getCachedMarketData } from "@/lib/data-cache"

// Simulated external API integrations
const EXTERNAL_APIS = {
  nyc_open_data: "https://data.cityofnewyork.us/api/views/",
  fred: "https://api.stlouisfed.org/fred/series/observations",
  streeteasy: "https://streeteasy.com/api/v1/",
  zillow: "https://www.zillow.com/webservice/",
  walkscore: "https://api.walkscore.com/",
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") || "all"

    const cachedResult = await getCachedMarketData()

    const response = NextResponse.json({
      success: true,
      data: cachedResult.data,
      sources: Object.keys(EXTERNAL_APIS),
      last_updated: cachedResult.timestamp,
    })

    // Set cache headers for edge caching
    response.headers.set("Cache-Control", "s-maxage=600, stale-while-revalidate=1200")
    response.headers.set("CDN-Cache-Control", "s-maxage=3600")
    response.headers.set("Vary", "Authorization")

    return response
  } catch (error) {
    console.error("Market data API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch market data" }, { status: 500 })
  }
}
