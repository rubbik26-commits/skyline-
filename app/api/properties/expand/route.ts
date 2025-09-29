import { type NextRequest, NextResponse } from "next/server"
import { PropertyDatasetManager } from "@/lib/services/property-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, count, borough } = body

    if (action !== "expand") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const manager = PropertyDatasetManager.getInstance()
    const expansionCount = count || undefined
    const newProperties = manager.expandDataset(expansionCount)
    const stats = manager.getExpansionStats()

    console.log(`[v0] API: Expanded dataset by ${newProperties.length} properties`)

    return NextResponse.json({
      success: true,
      newProperties,
      stats,
      message: `Added ${newProperties.length} new properties. Total: ${stats.totalProperties}`,
    })
  } catch (error) {
    console.error("[v0] API Error expanding dataset:", error)
    return NextResponse.json({ error: "Failed to expand dataset" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const manager = PropertyDatasetManager.getInstance()
    const stats = manager.getExpansionStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("[v0] API Error getting dataset stats:", error)
    return NextResponse.json({ error: "Failed to get dataset stats" }, { status: 500 })
  }
}
