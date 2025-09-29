import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  // Add performance headers
  response.headers.set("x-response-time", `${Date.now() - start}ms`)
  response.headers.set("x-pathname", request.nextUrl.pathname)

  response.headers.set("x-content-type-options", "nosniff")
  response.headers.set("x-frame-options", "DENY")
  response.headers.set("x-xss-protection", "1; mode=block")
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin")

  if (process.env.VERCEL_DEPLOYMENT_ID) {
    response.headers.set("x-deployment-id", process.env.VERCEL_DEPLOYMENT_ID)
  }

  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    response.headers.set("x-commit-sha", process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
}
