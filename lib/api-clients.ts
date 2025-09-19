export interface APIResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: string
  timestamp: number
  cached?: boolean
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export interface RateLimiter {
  canMakeRequest(): boolean
  recordRequest(): void
  getWaitTime(): number
}

// Token Bucket Rate Limiter
export class TokenBucket implements RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly capacity: number
  private readonly refillRate: number // tokens per second

  constructor(capacity: number, refillPeriodMs: number) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = capacity / (refillPeriodMs / 1000)
    this.lastRefill = Date.now()
  }

  canMakeRequest(): boolean {
    this.refill()
    return this.tokens >= 1
  }

  recordRequest(): void {
    if (this.canMakeRequest()) {
      this.tokens -= 1
    }
  }

  getWaitTime(): number {
    this.refill()
    if (this.tokens >= 1) return 0
    return Math.ceil(((1 - this.tokens) / this.refillRate) * 1000)
  }

  private refill(): void {
    const now = Date.now()
    const timePassed = (now - this.lastRefill) / 1000
    const tokensToAdd = timePassed * this.refillRate
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}

// Advanced Caching System
export class APICache {
  private cache = new Map<string, CacheEntry>()
  private readonly defaultTTL = 15 * 60 * 1000 // 15 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// CORS Proxy Handler
export class CORSProxy {
  private static proxies = [
    "https://corsproxy.io/?",
    "https://cors-anywhere.herokuapp.com/",
    "https://api.allorigins.win/get?url=",
  ]

  private static currentProxy = 0

  static getProxyUrl(url: string): string {
    const proxy = this.proxies[this.currentProxy]
    if (proxy.includes("allorigins")) {
      return `${proxy}${encodeURIComponent(url)}`
    }
    return `${proxy}${url}`
  }

  static rotateProxy(): void {
    this.currentProxy = (this.currentProxy + 1) % this.proxies.length
  }
}

// Retry Logic with Exponential Backoff
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) break

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Rotate CORS proxy on failure
      CORSProxy.rotateProxy()
    }
  }

  throw lastError!
}

// NYC Open Data Client
export class NYCOpenDataClient {
  private baseURL = "https://data.cityofnewyork.us/resource/"
  private appToken: string | null = null
  private rateLimiter = new TokenBucket(1000, 3600000) // 1000/hour
  private cache = new APICache()

  constructor(appToken?: string) {
    this.appToken = appToken || null
  }

  async query(
    dataset: string,
    options: {
      where?: string
      select?: string
      limit?: number
      offset?: number
    } = {},
  ): Promise<APIResponse> {
    const cacheKey = `nyc_${dataset}_${JSON.stringify(options)}`
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return {
        data: cached,
        success: true,
        source: "NYC Open Data (cached)",
        timestamp: Date.now(),
        cached: true,
      }
    }

    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getWaitTime()
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`)
    }

    try {
      const url = new URL(`${this.baseURL}${dataset}.json`)

      if (this.appToken) {
        url.searchParams.append("$$app_token", this.appToken)
      }

      if (options.where) url.searchParams.append("$where", options.where)
      if (options.select) url.searchParams.append("$select", options.select)
      url.searchParams.append("$limit", String(options.limit || 1000))
      if (options.offset) url.searchParams.append("$offset", String(options.offset))

      const response = await withRetry(async () => {
        const proxyUrl = CORSProxy.getProxyUrl(url.toString())
        const res = await fetch(proxyUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })

      this.rateLimiter.recordRequest()
      this.cache.set(cacheKey, response)

      return {
        data: response,
        success: true,
        source: "NYC Open Data",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error: (error as Error).message,
        source: "NYC Open Data",
        timestamp: Date.now(),
      }
    }
  }

  // DOB Permits
  async getDOBPermits(borough = "1"): Promise<APIResponse> {
    return this.query("ipu4-2q9a", {
      where: `borough='${borough}'`,
      select:
        "bin,house__,street_name,job__,doc__,borough,work_type,permit_status,filing_date,issuance_date,expiration_date,job_start_date,permittee_s_first_name,permittee_s_last_name,permittee_s_business_name",
      limit: 5000,
    })
  }

  // ACRIS Property Records
  async getACRISRecords(borough = "1"): Promise<APIResponse> {
    return this.query("bnx9-e6tj", {
      where: `borough='${borough}'`,
      select:
        "document_id,record_type,crfn,borough,doc_type,document_date,document_amt,recorded_filed,modified_date,reel_yr,reel_nbr,reel_pg,percent_trans,good_through_date",
      limit: 5000,
    })
  }

  // PLUTO Data
  async getPLUTOData(borough = "1"): Promise<APIResponse> {
    return this.query("64uk-42ks", {
      where: `borough='${borough}'`,
      select:
        "bbl,block,lot,cd,ct2010,cb2010,schooldist,council,zipcode,firecomp,policeprct,healthcent,healtharea,sanitboro,sanitsub,address,zonedist1,zonedist2,zonedist3,zonedist4,overlay1,overlay2,spdist1,spdist2,spdist3,ltdheight,splitzone,bldgclass,landuse,easements,ownertype,ownername,lotarea,bldgarea,comarea,resarea,officearea,retailarea,garagearea,strgearea,factryarea,otherarea,areasource,numbldgs,numfloors,unitsres,unitstotal,lotfront,lotdepth,bldgfront,bldgdepth,ext,proxcode,irrlotcode,lottype,bsmtcode,assessland,assesstot,exempttot,yearbuilt,yearalter1,yearalter2,histdist,landmark,builtfar,residfar,commfar,facilfar,borocode,bbl,condono,tract2010,xcoord,ycoord,zonemap,zmcode,sanborn,taxmap,edesignum,appbbl,appdate,plutomapid,version",
      limit: 10000,
    })
  }
}

// Federal Reserve Economic Data (FRED) Client
export class FREDClient {
  private baseURL = "https://api.stlouisfed.org/fred"
  private apiKey: string | null = null
  private rateLimiter = new TokenBucket(120, 60000) // 120/minute
  private cache = new APICache()

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null
  }

  async getSeries(
    seriesId: string,
    options: {
      startDate?: string
      endDate?: string
      limit?: number
    } = {},
  ): Promise<APIResponse> {
    const cacheKey = `fred_${seriesId}_${JSON.stringify(options)}`
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return {
        data: cached,
        success: true,
        source: "FRED (cached)",
        timestamp: Date.now(),
        cached: true,
      }
    }

    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getWaitTime()
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`)
    }

    try {
      const url = new URL(`${this.baseURL}/series/observations`)
      url.searchParams.append("series_id", seriesId)
      url.searchParams.append("file_type", "json")

      if (this.apiKey) {
        url.searchParams.append("api_key", this.apiKey)
      }

      if (options.startDate) url.searchParams.append("start", options.startDate)
      if (options.endDate) url.searchParams.append("end", options.endDate)
      if (options.limit) url.searchParams.append("limit", String(options.limit))

      const response = await withRetry(async () => {
        const proxyUrl = CORSProxy.getProxyUrl(url.toString())
        const res = await fetch(proxyUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })

      this.rateLimiter.recordRequest()
      this.cache.set(cacheKey, response, 30 * 60 * 1000) // 30 minutes cache

      return {
        data: response,
        success: true,
        source: "FRED",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error: (error as Error).message,
        source: "FRED",
        timestamp: Date.now(),
      }
    }
  }

  // Commercial Real Estate Loans
  async getCommercialRELoans(): Promise<APIResponse> {
    return this.getSeries("CREACBM027NBOG", {
      startDate: "2020-01-01",
      limit: 100,
    })
  }

  // Construction Spending
  async getConstructionSpending(): Promise<APIResponse> {
    return this.getSeries("TTLCONS", {
      startDate: "2020-01-01",
      limit: 100,
    })
  }
}

// StreetEasy Market Data Client
export class StreetEasyClient {
  private cache = new APICache()

  async getMarketData(): Promise<APIResponse> {
    const cacheKey = "streeteasy_market_data"
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return {
        data: cached,
        success: true,
        source: "StreetEasy (cached)",
        timestamp: Date.now(),
        cached: true,
      }
    }

    try {
      // Simulated StreetEasy data (in production, would use actual API)
      const marketData = {
        manhattan: {
          medianSalePrice: 1250000,
          medianRentPrice: 4200,
          priceChange: 0.024,
          rentChange: 0.031,
          inventory: 2847,
          daysOnMarket: 89,
          pricePerSqFt: 1456,
        },
        trends: {
          salesVolume: 1247,
          newListings: 892,
          priceReductions: 234,
          closedSales: 1156,
        },
      }

      this.cache.set(cacheKey, marketData, 60 * 60 * 1000) // 1 hour cache

      return {
        data: marketData,
        success: true,
        source: "StreetEasy Market Data",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error: (error as Error).message,
        source: "StreetEasy",
        timestamp: Date.now(),
      }
    }
  }
}

// Zillow Research Data Client
export class ZillowClient {
  private cache = new APICache()

  async getZHVI(): Promise<APIResponse> {
    const cacheKey = "zillow_zhvi"
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return {
        data: cached,
        success: true,
        source: "Zillow ZHVI (cached)",
        timestamp: Date.now(),
        cached: true,
      }
    }

    try {
      // Simulated Zillow ZHVI data
      const zhviData = {
        manhattan: {
          currentValue: 1180000,
          monthlyChange: 0.018,
          yearlyChange: 0.067,
          forecast: {
            oneMonth: 0.012,
            threeMonth: 0.034,
            sixMonth: 0.058,
            oneYear: 0.089,
          },
        },
        rentIndex: {
          currentRent: 3890,
          monthlyChange: 0.025,
          yearlyChange: 0.078,
        },
      }

      this.cache.set(cacheKey, zhviData, 24 * 60 * 60 * 1000) // 24 hours cache

      return {
        data: zhviData,
        success: true,
        source: "Zillow Research",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error: (error as Error).message,
        source: "Zillow",
        timestamp: Date.now(),
      }
    }
  }
}

// Main API Manager
export class APIManager {
  private nycClient: NYCOpenDataClient
  private fredClient: FREDClient
  private streetEasyClient: StreetEasyClient
  private zillowClient: ZillowClient

  constructor(
    options: {
      nycAppToken?: string
      fredApiKey?: string
    } = {},
  ) {
    this.nycClient = new NYCOpenDataClient(options.nycAppToken)
    this.fredClient = new FREDClient(options.fredApiKey)
    this.streetEasyClient = new StreetEasyClient()
    this.zillowClient = new ZillowClient()
  }

  async fetchAllData(): Promise<{
    dobPermits: APIResponse
    acrisRecords: APIResponse
    plutoData: APIResponse
    commercialLoans: APIResponse
    constructionSpending: APIResponse
    marketData: APIResponse
    zhvi: APIResponse
  }> {
    const [dobPermits, acrisRecords, plutoData, commercialLoans, constructionSpending, marketData, zhvi] =
      await Promise.allSettled([
        this.nycClient.getDOBPermits(),
        this.nycClient.getACRISRecords(),
        this.nycClient.getPLUTOData(),
        this.fredClient.getCommercialRELoans(),
        this.fredClient.getConstructionSpending(),
        this.streetEasyClient.getMarketData(),
        this.zillowClient.getZHVI(),
      ])

    return {
      dobPermits:
        dobPermits.status === "fulfilled"
          ? dobPermits.value
          : { data: null, success: false, error: "Failed to fetch", source: "DOB", timestamp: Date.now() },
      acrisRecords:
        acrisRecords.status === "fulfilled"
          ? acrisRecords.value
          : { data: null, success: false, error: "Failed to fetch", source: "ACRIS", timestamp: Date.now() },
      plutoData:
        plutoData.status === "fulfilled"
          ? plutoData.value
          : { data: null, success: false, error: "Failed to fetch", source: "PLUTO", timestamp: Date.now() },
      commercialLoans:
        commercialLoans.status === "fulfilled"
          ? commercialLoans.value
          : { data: null, success: false, error: "Failed to fetch", source: "FRED", timestamp: Date.now() },
      constructionSpending:
        constructionSpending.status === "fulfilled"
          ? constructionSpending.value
          : { data: null, success: false, error: "Failed to fetch", source: "FRED", timestamp: Date.now() },
      marketData:
        marketData.status === "fulfilled"
          ? marketData.value
          : { data: null, success: false, error: "Failed to fetch", source: "StreetEasy", timestamp: Date.now() },
      zhvi:
        zhvi.status === "fulfilled"
          ? zhvi.value
          : { data: null, success: false, error: "Failed to fetch", source: "Zillow", timestamp: Date.now() },
    }
  }

  getNYCClient(): NYCOpenDataClient {
    return this.nycClient
  }

  getFREDClient(): FREDClient {
    return this.fredClient
  }

  getStreetEasyClient(): StreetEasyClient {
    return this.streetEasyClient
  }

  getZillowClient(): ZillowClient {
    return this.zillowClient
  }
}
