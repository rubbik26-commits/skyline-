import "server-only"
import { sql } from "@/lib/database/neon"
import { redis } from "@/lib/database/redis"

export class AnalyticsEngine {
  async getDashboardMetrics() {
    const cacheKey = "dashboard:metrics"

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }

    // Calculate comprehensive metrics
    const metrics = await sql`
      WITH property_stats AS (
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN status = 'Available' THEN 1 END) as active_listings,
          COUNT(CASE WHEN status = 'Sold' AND updated_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_sales,
          COUNT(CASE WHEN status = 'Under Contract' THEN 1 END) as under_contract,
          AVG(CASE WHEN status = 'Available' AND asking_price IS NOT NULL THEN asking_price END) as avg_active_price,
          AVG(CASE WHEN status = 'Sold' AND updated_at >= CURRENT_DATE - INTERVAL '30 days' AND asking_price IS NOT NULL THEN asking_price END) as avg_sale_price,
          SUM(CASE WHEN status = 'Available' AND asking_price IS NOT NULL THEN asking_price ELSE 0 END) as total_market_value,
          SUM(CASE WHEN status = 'Available' AND units IS NOT NULL THEN units ELSE 0 END) as total_units,
          SUM(CASE WHEN status = 'Available' AND gsf IS NOT NULL THEN gsf ELSE 0 END) as total_gsf,
          AVG(CASE WHEN cap_rate IS NOT NULL THEN cap_rate END) as avg_cap_rate
        FROM properties
      ),
      market_stats AS (
        SELECT 
          AVG(CASE WHEN metric_name = 'days_on_market' THEN metric_value END) as avg_days_on_market,
          AVG(CASE WHEN metric_name = 'absorption_rate' THEN metric_value END) as avg_absorption_rate,
          COUNT(CASE WHEN date_recorded >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_data_points
        FROM market_data 
        WHERE date_recorded >= CURRENT_DATE - INTERVAL '30 days'
      ),
      performance_stats AS (
        SELECT 
          COUNT(*) as total_api_calls,
          AVG(metric_value) as avg_response_time
        FROM performance_metrics 
        WHERE measurement_time >= CURRENT_DATE - INTERVAL '24 hours'
          AND metric_name = 'api_response_time'
      )
      SELECT 
        ps.*,
        ms.avg_days_on_market,
        ms.avg_absorption_rate,
        ms.weekly_data_points,
        perf.total_api_calls,
        perf.avg_response_time
      FROM property_stats ps
      CROSS JOIN market_stats ms
      CROSS JOIN performance_stats perf
    `

    const result = {
      totalProperties: Number.parseInt(metrics[0].total_properties) || 0,
      activeListings: Number.parseInt(metrics[0].active_listings) || 0,
      recentSales: Number.parseInt(metrics[0].recent_sales) || 0,
      underContract: Number.parseInt(metrics[0].under_contract) || 0,
      avgActivePrice: Number.parseFloat(metrics[0].avg_active_price) || 0,
      avgSalePrice: Number.parseFloat(metrics[0].avg_sale_price) || 0,
      totalMarketValue: Number.parseFloat(metrics[0].total_market_value) || 0,
      totalUnits: Number.parseInt(metrics[0].total_units) || 0,
      totalGSF: Number.parseInt(metrics[0].total_gsf) || 0,
      avgCapRate: Number.parseFloat(metrics[0].avg_cap_rate) || 0,
      avgDaysOnMarket: Number.parseFloat(metrics[0].avg_days_on_market) || 0,
      avgAbsorptionRate: Number.parseFloat(metrics[0].avg_absorption_rate) || 0,
      weeklyDataPoints: Number.parseInt(metrics[0].weekly_data_points) || 0,
      dailyApiCalls: Number.parseInt(metrics[0].total_api_calls) || 0,
      avgResponseTime: Number.parseFloat(metrics[0].avg_response_time) || 0,
      lastUpdated: new Date().toISOString(),
      marketActivity: this.assessMarketActivity(metrics[0]),
      performanceGrade: this.calculatePerformanceGrade(metrics[0]),
    }

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result))

    return result
  }

  async getMarketTrends(borough?: string, days = 30) {
    const cacheKey = `market-trends:${borough || "all"}:${days}`

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }

    const trends = await sql`
      SELECT 
        date_recorded as date,
        borough,
        metric_name,
        AVG(metric_value) as avg_value,
        COUNT(*) as data_points,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value
      FROM market_data
      WHERE date_recorded >= CURRENT_DATE - INTERVAL '${days} days'
        ${borough ? sql`AND borough = ${borough}` : sql``}
      GROUP BY date_recorded, borough, metric_name
      ORDER BY date_recorded DESC, borough, metric_name
    `

    // Cache for 15 minutes
    await redis.setex(cacheKey, 900, JSON.stringify(trends))

    return trends
  }

  async getBoroughAnalytics() {
    const cacheKey = "borough:analytics"

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }

    const analytics = await sql`
      SELECT 
        borough,
        COUNT(*) as total_properties,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_properties,
        AVG(CASE WHEN asking_price IS NOT NULL THEN asking_price END) as avg_price,
        AVG(CASE WHEN price_per_sf IS NOT NULL THEN price_per_sf END) as avg_price_per_sf,
        AVG(CASE WHEN cap_rate IS NOT NULL THEN cap_rate END) as avg_cap_rate,
        SUM(CASE WHEN units IS NOT NULL THEN units ELSE 0 END) as total_units,
        SUM(CASE WHEN gsf IS NOT NULL THEN gsf ELSE 0 END) as total_gsf,
        COUNT(CASE WHEN eligible = true THEN 1 END) as eligible_properties
      FROM properties
      GROUP BY borough
      ORDER BY total_properties DESC
    `

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, JSON.stringify(analytics))

    return analytics
  }

  async getPerformanceMetrics(hours = 24) {
    const metrics = await sql`
      SELECT 
        metric_name,
        AVG(metric_value) as avg_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        COUNT(*) as sample_count,
        DATE_TRUNC('hour', measurement_time) as hour
      FROM performance_metrics
      WHERE measurement_time >= CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
      GROUP BY metric_name, DATE_TRUNC('hour', measurement_time)
      ORDER BY hour DESC, metric_name
    `

    return metrics
  }

  async recordMetric(name: string, value: number, unit?: string, metadata?: object) {
    await sql`
      INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metadata, measurement_time, created_at)
      VALUES (${name}, ${value}, ${unit || "count"}, ${JSON.stringify(metadata || {})}, NOW(), NOW())
    `
  }

  async recordAnalyticsEvent(eventType: string, eventData: object, userId?: string, propertyId?: string) {
    await sql`
      INSERT INTO analytics_events (event_type, event_data, user_id, property_id, created_at)
      VALUES (${eventType}, ${JSON.stringify(eventData)}, ${userId}, ${propertyId}, NOW())
    `
  }

  private assessMarketActivity(metrics: any): string {
    const recentSales = Number.parseInt(metrics.recent_sales) || 0
    const activeListings = Number.parseInt(metrics.active_listings) || 0
    const underContract = Number.parseInt(metrics.under_contract) || 0

    const activityRatio = (recentSales + underContract) / Math.max(activeListings, 1)

    if (activityRatio > 0.3) return "VERY_STRONG"
    if (activityRatio > 0.2) return "STRONG"
    if (activityRatio > 0.1) return "MODERATE"
    if (activityRatio > 0.05) return "SLOW"
    return "VERY_SLOW"
  }

  private calculatePerformanceGrade(metrics: any): string {
    const avgResponseTime = Number.parseFloat(metrics.avg_response_time) || 0
    const dailyApiCalls = Number.parseInt(metrics.total_api_calls) || 0

    let score = 100

    // Penalize slow response times
    if (avgResponseTime > 1000) score -= 20
    else if (avgResponseTime > 500) score -= 10
    else if (avgResponseTime > 200) score -= 5

    // Reward high API usage (indicates active system)
    if (dailyApiCalls > 1000) score += 5
    else if (dailyApiCalls < 100) score -= 5

    if (score >= 95) return "A+"
    if (score >= 90) return "A"
    if (score >= 85) return "B+"
    if (score >= 80) return "B"
    if (score >= 75) return "C+"
    if (score >= 70) return "C"
    return "D"
  }
}
