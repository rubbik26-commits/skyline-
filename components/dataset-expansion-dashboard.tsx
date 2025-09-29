"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Database, RefreshCw, Plus, BarChart3, MapPin } from "lucide-react"
import { useAutoExpandingDataset } from "@/hooks/use-auto-expanding-dataset"
import type { EnhancedProperty } from "@/data/enhanced-property-data"

interface DatasetExpansionDashboardProps {
  baseProperties: EnhancedProperty[]
  onPropertiesUpdate: (properties: EnhancedProperty[]) => void
}

export function DatasetExpansionDashboard({ baseProperties, onPropertiesUpdate }: DatasetExpansionDashboardProps) {
  const {
    properties,
    stats,
    isExpanding,
    expansionHistory,
    expandDataset,
    resetDataset,
    getGrowthPattern,
    totalExpansions,
    totalGenerated,
    averageExpansionSize,
  } = useAutoExpandingDataset(baseProperties)

  // Update parent component when properties change
  React.useEffect(() => {
    onPropertiesUpdate(properties)
  }, [properties, onPropertiesUpdate])

  const growthPattern = getGrowthPattern()
  const progressToNext500 = ((properties.length % 500) / 500) * 100

  return (
    <div className="space-y-4">
      {/* Auto-Expansion Status */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Database className="h-5 w-5" />
            Auto-Expanding Dataset
            <Badge variant="outline" className="ml-auto">
              {isExpanding ? "Expanding..." : "Active"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{properties.length.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Properties</div>
              <div className="text-xs text-green-600 mt-1">+{totalGenerated} generated</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalExpansions}</div>
              <div className="text-sm text-muted-foreground">Expansions</div>
              <div className="text-xs text-blue-600 mt-1">~{averageExpansionSize} avg/expansion</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.byBorough ? Object.keys(stats.byBorough).length : 5}
              </div>
              <div className="text-sm text-muted-foreground">Boroughs</div>
              <div className="text-xs text-purple-600 mt-1">NYC Coverage</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats?.byCategory ? Object.keys(stats.byCategory).length : 8}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-xs text-orange-600 mt-1">Property Types</div>
            </div>
          </div>

          {/* Progress to next milestone */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to {Math.ceil(properties.length / 500) * 500} properties</span>
              <span>{properties.length % 500}/500</span>
            </div>
            <Progress value={progressToNext500} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Manual Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Manual Expansion Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => expandDataset(15)} disabled={isExpanding} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add 15 Properties
            </Button>

            <Button
              onClick={() => expandDataset(25)}
              disabled={isExpanding}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add 25 Properties
            </Button>

            <Button
              onClick={() => expandDataset(50)}
              disabled={isExpanding}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add 50 Properties
            </Button>

            <Button
              onClick={resetDataset}
              disabled={isExpanding}
              variant="destructive"
              className="flex items-center gap-2 ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Dataset
            </Button>
          </div>

          {isExpanding && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating new properties across all 5 boroughs...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Pattern Table */}
      {growthPattern && growthPattern.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dataset Growth Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Refresh #</th>
                    <th className="text-left p-2">Properties Added</th>
                    <th className="text-left p-2">Total Properties</th>
                    <th className="text-left p-2">Analytics Updated</th>
                    <th className="text-left p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {growthPattern.slice(-10).map((expansion, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{expansion.refreshNumber}</td>
                      <td className="p-2">+{expansion.propertiesAdded}</td>
                      <td className="p-2">{expansion.totalProperties.toLocaleString()}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          ✅ Updated
                        </Badge>
                      </td>
                      <td className="p-2 text-muted-foreground">{expansion.timestamp.toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Borough Distribution */}
      {stats?.byBorough && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.byBorough).map(([borough, count]) => (
                <div key={borough} className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-lg">{count}</div>
                  <div className="text-sm text-muted-foreground">{borough}</div>
                  <div className="text-xs text-blue-600 mt-1">{((count / properties.length) * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
