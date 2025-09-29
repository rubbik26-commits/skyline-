"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Database, Brain, Home } from "lucide-react"
import Link from "next/link"

export function NavigationHeader() {
  return (
    <Card className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b-2 border-blue-600 rounded-none">
      <CardContent className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Manhattan Real Estate Intelligence</h1>
                <p className="text-sm text-slate-600">Comprehensive AI-powered analysis platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/intelligence">
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Brain className="h-4 w-4" />
                  Intelligence Platform
                </Button>
              </Link>

              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Database className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
