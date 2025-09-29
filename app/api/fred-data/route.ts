import { type NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

// FRED API integration for server-side data fetching
class ServerFREDClient {
  private baseURL = "https://api.stlouisfed.org/fred"
  private apiKey: string

  constructor() {
    this.apiKey = process.env.FRED_API_KEY || "demo"
  }

  async getSeries(seriesId: string, limit = 100) {
    try {
      const url = new URL(`${this.baseURL}/series/observations`)
      url.searchParams.set("series_id", seriesId)
      url.searchParams.set("api_key", this.apiKey)
      url.searchParams.set("file_type", "json")
      url.searchParams.set("limit", limit.toString())
      url.searchParams.set("sort_order", "desc")

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`FRED API request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.observations || []
    } catch (error) {
      console.error(`Error fetching FRED series ${seriesId}:`, error)
      return []
    }
  }

  async getMultipleSeries(seriesIds: string[], limit = 50) {
    const results: Record<string, any[]> = {}

    for (const seriesId of seriesIds) {
      try {
        results[seriesId] = await this.getSeries(seriesId, limit)
        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to fetch series ${seriesId}:`, error)
        results[seriesId] = []
      }
    }

    return results
  }
}

// Cached FRED data fetching
const getCachedFREDData = unstable_cache(
  async (category: string) => {
    const fredClient = new ServerFREDClient()

    const seriesMap: Record<string, string[]> = {
      "real-estate": [
        "MORTGAGE30US", // 30-Year Mortgage Rate
        "HOUST", // Housing Starts
        "PERMIT", // Building Permits
        "CSUSHPISA", // Home Price Index
        "CREACBM027NBOG", // Commercial RE Loans
        "TLCOMCONS", // Construction Spending
        "RHORUSQ156N", // Homeownership Rate
        "RRVRUSQ156N", // Rental Vacancy Rate
      ],
      "interest-rates": [
        "FEDFUNDS", // Federal Funds Rate
        "MORTGAGE30US", // 30-Year Mortgage Rate
        "TB3MS", // 3-Month Treasury
        "GS5", // 5-Year Treasury
        "GS10", // 10-Year Treasury
      ],
      economic: [
        "GDP", // GDP Growth
        "UNRATE", // Unemployment Rate
        "CPILFESL", // Core Inflation
        "UMCSENT", // Consumer Sentiment
        "SP500", // S&P 500
        "VIXCLS", // VIX
      ],
      all: [
        "MORTGAGE30US",
        "FEDFUNDS",
        "HOUST",
        "PERMIT",
        "CREACBM027NBOG",
        "TLCOMCONS",
        "GDP",
        "UNRATE",
        "CPILFESL",
        "UMCSENT",
      ],
    }

    const seriesToFetch = seriesMap[category] || seriesMap["all"]
    const data = await fredClient.getMultipleSeries(seriesToFetch)

    return {
      data,
      category,
      timestamp: new Date().toISOString(),
      seriesCount: Object.keys(data).length,
    }
  },
  ["fred-data"],
  { revalidate: 1800, tags: ["fred-data", "economic-indicators"] }, // 30-minute cache
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"
    const format = searchParams.get("format") || "json"

    const result = await getCachedFREDData(category)

    const response = NextResponse.json({
      success: true,
      ...result,
    })

    // Set cache headers
    response.headers.set("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600")
    response.headers.set("CDN-Cache-Control", "s-maxage=7200")

    return response
  } catch (error) {
    console.error("FRED data API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch FRED data",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seriesIds, limit = 50 } = body

    if (!Array.isArray(seriesIds)) {
      return NextResponse.json({ success: false, error: "seriesIds must be an array" }, { status: 400 })
    }

    const fredClient = new ServerFREDClient()
    const data = await fredClient.getMultipleSeries(seriesIds, limit)

    return NextResponse.json({
      success: true,
      data,
      seriesCount: Object.keys(data).length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("FRED data POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch custom FRED data",
      },
      { status: 500 },
    )
  }
}
