import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, tag, secret } = body

    // Verify secret token for security
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        {
          error: "Invalid secret",
        },
        { status: 401 },
      )
    }

    console.log("[v0] Revalidation request:", { path, tag })

    // Revalidate by path
    if (path) {
      revalidatePath(path)
      console.log(`[v0] Revalidated path: ${path}`)
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag)
      console.log(`[v0] Revalidated tag: ${tag}`)
    }

    // Default revalidation for property-related pages
    if (!path && !tag) {
      revalidatePath("/properties")
      revalidatePath("/dashboard")
      revalidatePath("/")
      console.log("[v0] Revalidated default property pages")
    }

    return NextResponse.json({
      success: true,
      revalidated: {
        path: path || "default paths",
        tag: tag || "none",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Revalidation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ISR revalidation endpoint active",
    usage: {
      revalidatePath: 'POST with { path: "/path/to/revalidate", secret: "token" }',
      revalidateTag: 'POST with { tag: "tag-name", secret: "token" }',
      default: 'POST with { secret: "token" } to revalidate property pages',
    },
    timestamp: new Date().toISOString(),
  })
}
