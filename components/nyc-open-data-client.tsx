"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Database, TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"

class NYCOpenDataClient {
  private baseURL = "https://data.cityofnewyork.us/resource/"
  private appToken: string | null = null
  private cache = new Map()
  private rateLimiter = { requests: 0, resetTime: Date.now() + 3600000 }

  constructor(appToken?: string) {
    this.appToken = appToken || null
  }

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
      console.log("[v0] Making NYC API request to:", url)

      const response = await fetch(url, {
        headers: {
          ...(this.appToken ? { "X-App-Token": this.appToken } : {}),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] NYC API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] NYC API error response:", errorText)
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      this.rateLimiter.requests++

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      console.log("[v0] NYC API success, received", data.length, "records")
      return data
    } catch (error) {
      console.error("NYC Open Data API Error:", error)
      throw error
    }
  }

  async getDOBPermits(borough = "MANHATTAN", limit = 100) {
    // Using correct field name 'borough' instead of 'boro' and proper borough names
    const url = `${this.baseURL}ipu4-2q9a.json?$where=borough='${borough}'&$limit=${limit}&$order=issuance_date DESC`
    return this.makeRequest(url)
  }

  async getPLUTOData(borough = "MN", limit = 100) {
    // PLUTO uses borough codes: MN=Manhattan, BK=Brooklyn, QN=Queens, BX=Bronx, SI=Staten Island
    const url = `${this.baseURL}64uk-42ks.json?$where=borough='${borough}'&$limit=${limit}`
    return this.makeRequest(url)
  }

  async getACRISData(borough = "1", limit = 100) {
    // ACRIS uses numeric borough codes: 1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island
    // Using the correct ACRIS Real Property Legals endpoint
    const url = `${this.baseURL}8h5j-fqxa.json?$where=borough='${borough}'&$limit=${limit}&$order=recorded_datetime DESC`
    return this.makeRequest(url)
  }

  getBoroughOptions() {
    return {
      dob: ["MANHATTAN", "BRONX", "BROOKLYN", "QUEENS", "STATEN ISLAND"],
      pluto: ["MN", "BK", "QN", "BX", "SI"],
      acris: ["1", "2", "3", "4", "5"],
    }
  }
}

class FREDClient {
  private baseURL = "https://api.stlouisfed.org/fred"
  private apiKey = "demo" // Using demo key for free access

  async getCommercialRELoans() {
    try {
      // Using CORS proxy for browser compatibility
      const proxyUrl = "https://api.allorigins.win/get?url="
      const targetUrl = `${this.baseURL}/series/observations?series_id=CREACBM027NBOG&api_key=${this.apiKey}&file_type=json&limit=12`

      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl))
      const data = await response.json()
      return JSON.parse(data.contents)
    } catch (error) {
      console.error("FRED API Error:", error)
      return { observations: [] }
    }
  }

  async getConstructionSpending() {
    try {
      const proxyUrl = "https://api.allorigins.win/get?url="
      const targetUrl = `${this.baseURL}/series/observations?series_id=TLCOMCONS&api_key=${this.apiKey}&file_type=json&limit=12`

      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl))
      const data = await response.json()
      return JSON.parse(data.contents)
    } catch (error) {
      console.error("FRED API Error:", error)
      return { observations: [] }
    }
  }
}

interface APIIntegrationProps {
  onDataUpdate?: (data: any) => void
}

export function NYCOpenDataIntegration({ onDataUpdate }: APIIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    permits: 0,
    properties: 0,
    transactions: 0,
    lastUpdate: null as Date | null,
  })

  const nycClient = new NYCOpenDataClient()
  const fredClient = new FREDClient()

  const fetchNYCData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting NYC Open Data fetch...")

      const [permits, pluto, acris] = await Promise.all([
        nycClient.getDOBPermits("MANHATTAN", 50), // Full borough name
        nycClient.getPLUTOData("MN", 50), // Borough code
        nycClient.getACRISData("1", 50), // Numeric code
      ])

      console.log("[v0] NYC Data fetched:", { permits: permits.length, pluto: pluto.length, acris: acris.length })

      const combinedData = {
        permits: permits || [],
        properties: pluto || [],
        transactions: acris || [],
        timestamp: new Date(),
      }

      setData(combinedData)
      setStats({
        permits: permits?.length || 0,
        properties: pluto?.length || 0,
        transactions: acris?.length || 0,
        lastUpdate: new Date(),
      })

      if (onDataUpdate) {
        onDataUpdate(combinedData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch NYC data"
      setError(errorMessage)
      console.error("[v0] NYC Data fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMarketData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting market data fetch...")

      const [commercialLoans, constructionSpending] = await Promise.all([
        fredClient.getCommercialRELoans(),
        fredClient.getConstructionSpending(),
      ])

      console.log("[v0] Market data fetched:", {
        loans: commercialLoans.observations?.length || 0,
        construction: constructionSpending.observations?.length || 0,
      })

      const marketData = {
        commercialLoans: commercialLoans.observations || [],
        constructionSpending: constructionSpending.observations || [],
        timestamp: new Date(),
      }

      setData((prev) => ({ ...prev, market: marketData }))

      if (onDataUpdate) {
        onDataUpdate({ market: marketData })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch market data"
      setError(errorMessage)
      console.error("[v0] Market data fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Database className="h-5 w-5" />
          Free API Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.permits}</div>
            <div className="text-sm text-muted-foreground">DOB Permits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.properties}</div>
            <div className="text-sm text-muted-foreground">PLUTO Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.transactions}</div>
            <div className="text-sm text-muted-foreground">ACRIS Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.lastUpdate ? "✓" : "○"}</div>
            <div className="text-sm text-muted-foreground">Status</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={fetchNYCData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Building2 className="h-4 w-4" />
            {isLoading ? "Fetching..." : "🏛️ NYC OPEN DATA"}
          </Button>

          <Button
            onClick={fetchMarketData}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white bg-transparent"
          >
            <TrendingUp className="h-4 w-4" />
            {isLoading ? "Loading..." : "📈 MARKET DATA"}
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {stats.lastUpdate && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Last updated: {stats.lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Data Preview */}
        {data && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Data Sources Active:</h4>
            <div className="flex flex-wrap gap-2">
              {data.permits && (
                <Badge variant="secondary" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  DOB Permits ({data.permits.length})
                </Badge>
              )}
              {data.properties && (
                <Badge variant="secondary" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  PLUTO Data ({data.properties.length})
                </Badge>
              )}
              {data.transactions && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  ACRIS Records ({data.transactions.length})
                </Badge>
              )}
              {data.market && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Market Data (FRED)
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm text-blue-700">Processing free API data sources...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
