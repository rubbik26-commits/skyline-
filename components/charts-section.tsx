"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "@/types/property"

interface ChartsSectionProps {
  data: PropertyData[]
}

export function ChartsSection({ data }: ChartsSectionProps) {
  // Calculate chart data
  const submarketData = data.reduce(
    (acc, prop) => {
      if (prop.units && prop.submarket) {
        acc[prop.submarket] = (acc[prop.submarket] || 0) + prop.units
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const statusData = data.reduce(
    (acc, prop) => {
      if (prop.status) {
        acc[prop.status] = (acc[prop.status] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const typeData = data.reduce(
    (acc, prop) => {
      if (prop.type) {
        acc[prop.type] = (acc[prop.type] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const scatterData = data
    .filter((prop) => prop.units && prop.gsf)
    .map((prop) => ({
      x: prop.gsf!,
      y: prop.units!,
      label: prop.address,
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Units by Submarket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(submarketData)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([submarket, units]) => (
                <div key={submarket} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-4">{submarket}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{
                        width: `${Math.max(20, (units / Math.max(...Object.values(submarketData))) * 100)}px`,
                      }}
                    />
                    <span className="text-sm font-mono w-16 text-right">{units.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚧 Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(statusData)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-4">{status}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-secondary rounded-full"
                      style={{
                        width: `${Math.max(20, (count / Math.max(...Object.values(statusData))) * 100)}px`,
                      }}
                    />
                    <span className="text-sm font-mono w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏗️ Projects by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(typeData)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-4">{type}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-accent rounded-full"
                      style={{
                        width: `${Math.max(20, (count / Math.max(...Object.values(typeData))) * 100)}px`,
                      }}
                    />
                    <span className="text-sm font-mono w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📈 Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-green-800 dark:text-green-300">High Activity</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Financial District leads with {submarketData["Financial District"] || 0} units in pipeline
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-blue-800 dark:text-blue-300">Strong Pipeline</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {statusData["Underway"] || 0} projects underway, {statusData["Projected"] || 0} projected
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-semibold text-purple-800 dark:text-purple-300">Tax Incentives</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                {data.filter((p) => p.eligible).length} properties eligible for 467-M benefits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
