import { type NextRequest, NextResponse } from "next/server"

interface ErrorReport {
  id: string
  timestamp: string
  level: "error" | "warning" | "info"
  message: string
  stack?: string
  component?: string
  userId?: string
  metadata?: Record<string, any>
}

// In-memory error storage (in production, use a database)
const errorStore: ErrorReport[] = []

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    const errorReport: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...errorData,
    }

    errorStore.push(errorReport)

    // Keep only last 1000 errors
    if (errorStore.length > 1000) {
      errorStore.splice(0, errorStore.length - 1000)
    }

    console.error("Client Error Report:", errorReport)

    return NextResponse.json({
      success: true,
      id: errorReport.id,
    })
  } catch (error) {
    console.error("Error reporting failed:", error)
    return NextResponse.json({ success: false, error: "Failed to report error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let filtered = errorStore

    if (level) {
      filtered = filtered.filter((e) => e.level === level)
    }

    const recent = filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: recent,
      total: filtered.length,
    })
  } catch (error) {
    console.error("Error fetching error reports:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch error reports" }, { status: 500 })
  }
}
