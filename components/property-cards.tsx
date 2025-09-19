"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import type { PropertyData } from "@/types/property"

interface PropertyCardsProps {
  data: PropertyData[]
}

export function PropertyCards({ data }: PropertyCardsProps) {
  const formatNumber = (num?: number | null) => {
    if (num == null) return "—"
    return num.toLocaleString()
  }

  const getBadgeClass = (type: string, value?: string) => {
    if (!value) return ""

    if (type === "type") {
      const val = value.toLowerCase()
      if (val.includes("condo")) return "badge-condo"
      if (val.includes("converted") || val.includes("historical")) return "badge-converted"
      if (val.includes("potential")) return "badge-potential"
      return "badge-rental"
    }

    if (type === "status") {
      const status = value.toLowerCase()
      if (status.includes("completed")) return "badge-completed"
      if (status.includes("underway")) return "badge-underway"
      if (status.includes("planned")) return "badge-planned"
      if (status.includes("converted")) return "badge-converted"
      if (status.includes("potential")) return "badge-potential"
      return "badge-projected"
    }

    return ""
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No properties match your current filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((prop, index) => (
        <Card
          key={index}
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary"
        >
          <CardHeader className="pb-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary leading-tight">{prop.address}</h3>
              <p className="text-sm text-muted-foreground font-medium">{prop.submarket || "Location not specified"}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Units</div>
                <div className="text-lg font-bold">{formatNumber(prop.units)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">GSF</div>
                <div className="text-lg font-bold">{formatNumber(prop.gsf)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  467-M Eligible
                </div>
                <div className="text-lg font-bold">{prop.eligible ? "✅ Yes" : "❌ No"}</div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={getBadgeClass("type", prop.type)}>{prop.type || "Type not specified"}</Badge>
              <Badge className={getBadgeClass("status", prop.status)}>{prop.status || "Status unknown"}</Badge>
            </div>

            {/* Notes */}
            {prop.notes && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                {prop.notes.length > 150 ? `${prop.notes.substring(0, 150)}...` : prop.notes}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t">
              {prop.pressLink ? (
                <a
                  href={prop.pressLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />📰 View Details →
                </a>
              ) : (
                <span className="text-muted-foreground text-sm">No press coverage available</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
