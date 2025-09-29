import { type NextRequest, NextResponse } from "next/server"
import { createStreamingResponse } from "@/lib/streaming-utils"
import { comprehensiveNYCPropertyData } from "@/data/comprehensive-nyc-property-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const borough = searchParams.get("borough")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const chunkSize = Number.parseInt(searchParams.get("chunkSize") || "100")

    console.log("[v0] Streaming properties request:", { borough, category, status, chunkSize })

    // Filter data based on query parameters
    let filteredData = comprehensiveNYCPropertyData

    if (borough && borough !== "all") {
      filteredData = filteredData.filter((p) => p.borough === borough)
    }

    if (category && category !== "all") {
      filteredData = filteredData.filter((p) => p.propertyCategory === category)
    }

    if (status && status !== "all") {
      filteredData = filteredData.filter((p) => p.status === status)
    }

    console.log(`[v0] Streaming ${filteredData.length} properties in chunks of ${chunkSize}`)

    // Create streaming response
    const stream = createStreamingResponse(filteredData, chunkSize)

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Streaming properties error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
