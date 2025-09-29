import { type NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { propertyId, changes, updateType } = await request.json()

    // Validate webhook signature (in production, verify this is from trusted source)
    const signature = request.headers.get("x-webhook-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Update database (simulated - in real app, update your database here)
    console.log(`[v0] Updating property ${propertyId} with changes:`, changes)

    // Selective cache revalidation based on update type
    switch (updateType) {
      case "property":
        await revalidateTag(`property-${propertyId}`)
        await revalidateTag("properties")
        break
      case "market-data":
        await revalidateTag("market-data")
        break
      case "analytics":
        await revalidateTag("analytics")
        break
      default:
        // Revalidate all related caches
        await revalidateTag("properties")
        await revalidateTag("market-data")
        await revalidateTag("analytics")
    }

    return NextResponse.json({
      success: true,
      message: "Cache revalidated successfully",
      propertyId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
