"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react"
import type { PropertyData } from "@/types/property"

interface PropertyTableProps {
  data: PropertyData[]
  expandedRows: Set<number>
  setExpandedRows: (rows: Set<number>) => void
}

export function PropertyTable({ data, expandedRows, setExpandedRows }: PropertyTableProps) {
  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const getBadgeVariant = (type: string, value?: string) => {
    if (!value) return "secondary"

    if (type === "type") {
      const val = value.toLowerCase()
      if (val.includes("condo")) return "default"
      if (val.includes("converted") || val.includes("historical")) return "secondary"
      if (val.includes("potential")) return "outline"
      return "default"
    }

    if (type === "status") {
      const status = value.toLowerCase()
      if (status.includes("completed")) return "default"
      if (status.includes("underway")) return "secondary"
      if (status.includes("planned")) return "outline"
      return "secondary"
    }

    return "secondary"
  }

  const formatNumber = (num?: number | null) => {
    if (num == null) return "—"
    return num.toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader className="dashboard-gradient text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">📋 Properties: {data.length.toLocaleString()}</CardTitle>
          <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            {" "}
            {/* Minimum width to ensure all columns are visible */}
            <table className="w-full table-fixed">
              {" "}
              {/* Fixed table layout for consistent column widths */}
              <thead className="bg-primary text-primary-foreground sticky top-0 z-10">
                <tr>
                  <th className="w-12 p-3 text-left"></th>
                  <th className="w-48 p-3 text-left font-semibold">Address</th>
                  <th className="w-32 p-3 text-left font-semibold">Submarket</th>
                  <th className="w-20 p-3 text-right font-semibold">Units</th>
                  <th className="w-24 p-3 text-right font-semibold">GSF</th>
                  <th className="w-32 p-3 text-left font-semibold">Type</th>
                  <th className="w-28 p-3 text-left font-semibold">Status</th>
                  <th className="w-80 p-3 text-left font-semibold">Notes</th>
                  <th className="w-20 p-3 text-center font-semibold">Eligible</th>
                  <th className="w-20 p-3 text-left font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      No properties match your filters
                    </td>
                  </tr>
                ) : (
                  data.map((prop, index) => (
                    <>
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <Button variant="ghost" size="sm" onClick={() => toggleRow(index)} className="h-8 w-8 p-0">
                            {expandedRows.has(index) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-primary truncate" title={prop.address}>
                            {prop.address}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div className="truncate" title={prop.submarket || ""}>
                            {prop.submarket || "—"}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono">{formatNumber(prop.units)}</td>
                        <td className="p-3 text-right font-mono">{formatNumber(prop.gsf)}</td>
                        <td className="p-3">
                          <Badge
                            variant={getBadgeVariant("type", prop.type)}
                            className={`badge-${
                              prop.type?.toLowerCase().includes("condo")
                                ? "condo"
                                : prop.type?.toLowerCase().includes("converted")
                                  ? "converted"
                                  : prop.type?.toLowerCase().includes("potential")
                                    ? "potential"
                                    : "rental"
                            } text-xs`}
                          >
                            <div className="truncate max-w-24" title={prop.type || ""}>
                              {prop.type || "—"}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={getBadgeVariant("status", prop.status)}
                            className={`badge-${
                              prop.status?.toLowerCase().includes("completed")
                                ? "completed"
                                : prop.status?.toLowerCase().includes("underway")
                                  ? "underway"
                                  : prop.status?.toLowerCase().includes("planned")
                                    ? "planned"
                                    : "projected"
                            } text-xs`}
                          >
                            <div className="truncate max-w-20" title={prop.status || ""}>
                              {prop.status || "—"}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-muted-foreground line-clamp-2" title={prop.notes || ""}>
                            {prop.notes || "—"}
                          </div>
                        </td>
                        <td className="p-3 text-center">{prop.eligible ? "✅" : "❌"}</td>
                        <td className="p-3">
                          {prop.pressLink ? (
                            <a
                              href={prop.pressLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="sr-only">Link</span>
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(index) && (
                        <tr className="bg-muted/30">
                          <td colSpan={10} className="p-6">
                            <div className="bg-card rounded-lg p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">📍 Address</div>
                                  <div className="font-semibold">{prop.address}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">🏙️ Submarket</div>
                                  <div>{prop.submarket || "Not specified"}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">🏠 Units</div>
                                  <div className="font-mono">{formatNumber(prop.units)}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">📐 GSF</div>
                                  <div className="font-mono">{formatNumber(prop.gsf)}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">🏗️ Type</div>
                                  <div>{prop.type || "Not specified"}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">📊 Status</div>
                                  <div>{prop.status || "Not specified"}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">✅ 467-M Eligible</div>
                                  <div>{prop.eligible ? "Yes" : "No"}</div>
                                </div>
                                {prop.lat && prop.lng && (
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">🗺️ Coordinates</div>
                                    <div className="font-mono text-sm">
                                      {prop.lat.toFixed(4)}, {prop.lng.toFixed(4)}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {prop.notes && (
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground mb-2">📝 Notes</div>
                                  <div className="text-sm leading-relaxed">{prop.notes}</div>
                                </div>
                              )}
                              {prop.pressLink && (
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground mb-2">
                                    🔗 Press Coverage
                                  </div>
                                  <a
                                    href={prop.pressLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    View Article →
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
