import { type NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

// NYC Open Data API Client with Manhattan Focus
class NYCOpenDataClient {
  private baseURL = "https://data.cityofnewyork.us/resource/"
  private cache = new Map()
  private rateLimiter = { requests: 0, resetTime: Date.now() + 3600000 }

  private async makeRequest(url: string) {
    // Rate limiting: 1000 requests per hour
    if (this.rateLimiter.requests >= 1000 && Date.now() < this.rateLimiter.resetTime) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    if (Date.now() >= this.rateLimiter.resetTime) {
      this.rateLimiter.requests = 0
      this.rateLimiter.resetTime = Date.now() + 3600000
    }

    // Check cache first (15-minute TTL)
    const cacheKey = url
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 900000) {
      return cached.data
    }

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      this.rateLimiter.requests++

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      console.error("NYC Open Data API Error:", error)
      throw error
    }
  }

  // Manhattan-focused DOB permits with conversion potential
  async getManhattanConversionPermits(limit = 100) {
    const url = `${this.baseURL}ipu4-2q9a.json?$where=borough='MANHATTAN' AND (work_type LIKE '%CONVERSION%' OR work_type LIKE '%ALTERATION%' OR work_type LIKE '%CHANGE OF USE%')&$limit=${limit}&$order=issuance_date DESC`
    return this.makeRequest(url)
  }

  // Manhattan PLUTO data with commercial properties
  async getManhattanCommercialProperties(limit = 200) {
    const url = `${this.baseURL}64uk-42ks.json?$where=borough='MN' AND (bldgclass LIKE 'O%' OR bldgclass LIKE 'K%' OR bldgclass LIKE 'M%')&$limit=${limit}&$order=yearbuilt DESC`
    return this.makeRequest(url)
  }

  // Manhattan ACRIS sales data for office buildings
  async getManhattanOfficeSales(limit = 100) {
    const url = `${this.baseURL}8h5j-fqxa.json?$where=borough='1' AND document_type='DEED'&$limit=${limit}&$order=recorded_datetime DESC`
    return this.makeRequest(url)
  }

  // Manhattan zoning data for conversion analysis
  async getManhattanZoningData(limit = 150) {
    const url = `${this.baseURL}8yby-8b9u.json?$where=borough='M'&$limit=${limit}`
    return this.makeRequest(url)
  }

  // Manhattan housing maintenance code violations
  async getManhattanHPDViolations(limit = 100) {
    const url = `${this.baseURL}wvxf-dwi5.json?$where=borough='MANHATTAN'&$limit=${limit}&$order=inspectiondate DESC`
    return this.makeRequest(url)
  }
}

// Cached NYC data fetcher with Manhattan focus
const getCachedNYCData = unstable_cache(
  async (dataType: string) => {
    const client = new NYCOpenDataClient()

    try {
      let data
      switch (dataType) {
        case "conversion-permits":
          data = await client.getManhattanConversionPermits(100)
          break
        case "commercial-properties":
          data = await client.getManhattanCommercialProperties(200)
          break
        case "office-sales":
          data = await client.getManhattanOfficeSales(100)
          break
        case "zoning":
          data = await client.getManhattanZoningData(150)
          break
        case "violations":
          data = await client.getManhattanHPDViolations(100)
          break
        case "all":
          const [permits, properties, sales, zoning, violations] = await Promise.all([
            client.getManhattanConversionPermits(50),
            client.getManhattanCommercialProperties(100),
            client.getManhattanOfficeSales(50),
            client.getManhattanZoningData(75),
            client.getManhattanHPDViolations(50),
          ])
          data = { permits, properties, sales, zoning, violations }
          break
        default:
          throw new Error(`Unknown data type: ${dataType}`)
      }

      // Analyze conversion potential
      const analysis = analyzeConversionPotential(data)

      return {
        data,
        analysis,
        metadata: {
          source: "NYC Open Data",
          focus: "Manhattan Office-to-Residential Conversions",
          timestamp: new Date().toISOString(),
          recordCount: Array.isArray(data)
            ? data.length
            : Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        },
      }
    } catch (error) {
      console.error("NYC Data fetch error:", error)
      throw error
    }
  },
  ["nyc-open-data"],
  { revalidate: 600, tags: ["nyc-data", "manhattan-focus"] },
)

// Analyze conversion potential from NYC data
function analyzeConversionPotential(data: any) {
  const analysis = {
    conversionOpportunities: 0,
    averageAge: 0,
    zoningCompatibility: 0,
    marketActivity: "MODERATE",
    riskFactors: [] as string[],
    recommendations: [] as string[],
  }

  try {
    if (data.properties && Array.isArray(data.properties)) {
      // Analyze building age for conversion potential
      const ages = data.properties
        .filter((p: any) => p.yearbuilt && Number.parseInt(p.yearbuilt) > 1900)
        .map((p: any) => 2024 - Number.parseInt(p.yearbuilt))

      if (ages.length > 0) {
        analysis.averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length
      }

      // Count potential conversion opportunities
      analysis.conversionOpportunities = data.properties.filter(
        (p: any) => p.bldgclass && (p.bldgclass.startsWith("O") || p.bldgclass.startsWith("K")),
      ).length
    }

    if (data.permits && Array.isArray(data.permits)) {
      // Analyze permit activity
      const recentPermits = data.permits.filter(
        (p: any) => p.issuance_date && new Date(p.issuance_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      )

      if (recentPermits.length > 20) {
        analysis.marketActivity = "HIGH"
      } else if (recentPermits.length < 5) {
        analysis.marketActivity = "LOW"
      }
    }

    // Generate recommendations based on data
    if (analysis.averageAge > 50) {
      analysis.recommendations.push("Focus on pre-war buildings with good bones")
    }
    if (analysis.conversionOpportunities > 10) {
      analysis.recommendations.push("Strong pipeline of conversion candidates identified")
    }
    if (analysis.marketActivity === "HIGH") {
      analysis.recommendations.push("Market timing favorable for conversions")
    }
  } catch (error) {
    console.error("Analysis error:", error)
  }

  return analysis
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get("type") || "all"
    const format = searchParams.get("format") || "json"

    const result = await getCachedNYCData(dataType)

    const response = NextResponse.json({
      success: true,
      ...result,
      api_info: {
        endpoints: ["conversion-permits", "commercial-properties", "office-sales", "zoning", "violations", "all"],
        focus: "Manhattan Office-to-Residential Conversions",
        rate_limit: "1000 requests/hour",
        cache_duration: "10 minutes",
      },
    })

    // Set cache headers for edge caching
    response.headers.set("Cache-Control", "s-maxage=600, stale-while-revalidate=1200")
    response.headers.set("CDN-Cache-Control", "s-maxage=3600")
    response.headers.set("Vary", "Authorization")

    return response
  } catch (error) {
    console.error("NYC Open Data API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch NYC data",
        api_info: {
          focus: "Manhattan Office-to-Residential Conversions",
          status: "error",
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, filters } = body

    if (action === "analyze") {
      // Custom analysis endpoint
      const data = await getCachedNYCData("all")
      const customAnalysis = analyzeConversionPotential(data.data)

      return NextResponse.json({
        success: true,
        analysis: customAnalysis,
        filters_applied: filters,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("NYC Open Data POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
