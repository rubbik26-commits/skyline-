import "server-only"
import { sql } from "@/lib/database/neon"
import { redis } from "@/lib/database/redis"
import { z } from "zod"

const PropertySchema = z.object({
  address: z.string().min(1),
  borough: z.enum(["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]),
  property_category: z.string(),
  submarket: z.string().optional(),
  units: z.number().int().positive().optional(),
  gsf: z.number().int().positive().optional(),
  asking_price: z.number().positive().optional(),
  price_per_sf: z.number().positive().optional(),
  cap_rate: z.number().positive().optional(),
  status: z.enum(["Available", "Under Contract", "Sold", "Completed", "Underway", "Projected"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  year_built: z.number().int().optional(),
  zoning: z.string().optional(),
  eligible: z.boolean().default(false),
  notes: z.string().optional(),
})

export type PropertyInput = z.infer<typeof PropertySchema>

export class PropertyEngine {
  async createProperty(data: PropertyInput) {
    const validated = PropertySchema.parse(data)

    const result = await sql`
      INSERT INTO properties (
        address, borough, property_category, submarket, units, gsf,
        asking_price, price_per_sf, cap_rate, status, latitude, longitude,
        year_built, zoning, eligible, notes, created_at, updated_at
      ) VALUES (
        ${validated.address}, ${validated.borough}, ${validated.property_category},
        ${validated.submarket}, ${validated.units}, ${validated.gsf},
        ${validated.asking_price}, ${validated.price_per_sf}, ${validated.cap_rate},
        ${validated.status}, ${validated.latitude}, ${validated.longitude},
        ${validated.year_built}, ${validated.zoning}, ${validated.eligible},
        ${validated.notes}, NOW(), NOW()
      ) RETURNING *
    `

    // Invalidate cache
    await this.invalidateCache()

    return result[0]
  }

  async getProperties(
    filters: {
      borough?: string
      property_category?: string
      status?: string
      min_price?: number
      max_price?: number
      eligible?: boolean
      limit?: number
      offset?: number
    } = {},
  ) {
    const { borough, property_category, status, min_price, max_price, eligible, limit = 50, offset = 0 } = filters

    // Generate cache key
    const cacheKey = `properties:${JSON.stringify(filters)}`

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = await sql`
      SELECT 
        *,
        (asking_price::decimal / NULLIF(gsf, 0)) as calculated_price_per_sf,
        ST_X(location::geometry) as lng,
        ST_Y(location::geometry) as lat
      FROM properties 
      WHERE 1=1
        ${borough ? sql`AND borough = ${borough}` : sql``}
        ${property_category ? sql`AND property_category = ${property_category}` : sql``}
        ${status ? sql`AND status = ${status}` : sql``}
        ${min_price ? sql`AND asking_price >= ${min_price}` : sql``}
        ${max_price ? sql`AND asking_price <= ${max_price}` : sql``}
        ${eligible !== undefined ? sql`AND eligible = ${eligible}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result))

    return result
  }

  async getPropertyById(id: string) {
    const cacheKey = `property:${id}`

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = await sql`
      SELECT 
        p.*,
        pd.*,
        ai.risk_score,
        ai.potential_roi,
        ai.market_trend,
        ai.confidence,
        ai.investment_grade,
        ST_X(p.location::geometry) as lng,
        ST_Y(p.location::geometry) as lat
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN ai_insights ai ON p.id = ai.property_id
      WHERE p.id = ${id}
    `

    if (!result.length) {
      throw new Error("Property not found")
    }

    // Cache for 10 minutes
    await redis.setex(cacheKey, 600, JSON.stringify(result[0]))

    return result[0]
  }

  async getPropertyInsights(propertyId: string) {
    const property = await this.getPropertyById(propertyId)

    // Get comparable properties
    const comparables = await sql`
      SELECT *,
        ST_Distance(
          location::geometry,
          (SELECT location::geometry FROM properties WHERE id = ${propertyId})
        ) * 111000 as distance_meters
      FROM properties 
      WHERE property_category = ${property.property_category}
        AND borough = ${property.borough}
        AND status = 'Available'
        AND id != ${propertyId}
        AND asking_price IS NOT NULL
      ORDER BY distance_meters ASC
      LIMIT 10
    `

    return {
      property,
      comparables,
      insights: this.generateInsights(property, comparables),
    }
  }

  async getManhattanConversionOpportunities() {
    const cacheKey = "manhattan:conversion-opportunities"

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }

    // Find office buildings in Manhattan built before 1991 (467-m eligible)
    const opportunities = await sql`
      SELECT 
        p.*,
        pd.office_sf,
        pd.occupancy_rate,
        pd.class_rating,
        ai.risk_score,
        ai.potential_roi,
        ai.confidence,
        ST_X(p.location::geometry) as lng,
        ST_Y(p.location::geometry) as lat
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN ai_insights ai ON p.id = ai.property_id
      WHERE p.borough = 'Manhattan'
        AND p.property_category = 'Office Buildings'
        AND p.year_built < 1991
        AND p.status = 'Available'
      ORDER BY ai.potential_roi DESC NULLS LAST
      LIMIT 50
    `

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(opportunities))

    return opportunities
  }

  private generateInsights(property: any, comparables: any[]) {
    if (!comparables.length) {
      return { message: "No comparable properties found" }
    }

    const avgPrice =
      comparables.reduce((sum, p) => sum + (Number.parseFloat(p.asking_price) || 0), 0) / comparables.length
    const avgPricePerSqft =
      comparables.reduce((sum, p) => sum + (Number.parseFloat(p.price_per_sf) || 0), 0) / comparables.length

    const propertyPrice = Number.parseFloat(property.asking_price) || 0
    const priceDiff = propertyPrice > 0 ? ((propertyPrice - avgPrice) / avgPrice) * 100 : 0

    return {
      avgComparablePrice: Math.round(avgPrice),
      avgPricePerSqft: Math.round(avgPricePerSqft),
      priceDifferencePercent: Math.round(priceDiff * 100) / 100,
      recommendation:
        priceDiff > 10
          ? "Consider lowering price"
          : priceDiff < -10
            ? "Opportunity to increase price"
            : "Competitively priced",
      comparableCount: comparables.length,
      marketPosition: priceDiff > 15 ? "Premium" : priceDiff < -15 ? "Value" : "Market Rate",
    }
  }

  private async invalidateCache() {
    // Invalidate property-related cache keys
    const keys = await redis.keys("properties:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
