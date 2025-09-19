"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "@/types/property"

interface InteractiveMapProps {
  data: PropertyData[]
}

export function InteractiveMap({ data }: InteractiveMapProps) {
  const propertiesWithCoords = data.filter((p) => p.lat && p.lng)

  return (
    <Card>
      <CardHeader className="dashboard-gradient text-white">
        <CardTitle className="flex items-center gap-2">🗺️ Interactive Property Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 bg-muted/30 rounded-b-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🗺️</div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Interactive Map</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {propertiesWithCoords.length} properties with coordinates
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-card rounded-lg">
                  <div className="font-semibold text-primary">Financial District</div>
                  <div className="text-muted-foreground">
                    {data.filter((p) => p.submarket === "Financial District").length} properties
                  </div>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <div className="font-semibold text-secondary">Midtown East</div>
                  <div className="text-muted-foreground">
                    {data.filter((p) => p.submarket === "Midtown East").length} properties
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
