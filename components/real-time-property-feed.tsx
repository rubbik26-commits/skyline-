"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building, DollarSign, TrendingUp, TrendingDown, MapPin, Clock, Eye, Heart, Share2, Filter } from "lucide-react"

interface PropertyUpdate {
  id: string
  type: "new_listing" | "price_change" | "status_change" | "conversion_update"
  property: {
    address: string
    submarket: string
    price: number
    priceChange?: number
    status: string
    category: string
    gsf: number
    units?: number
  }
  timestamp: Date
  details: string
}

export function RealTimePropertyFeed() {
  const [updates, setUpdates] = useState<PropertyUpdate[]>([])
  const [isLive, setIsLive] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const mockUpdate: PropertyUpdate = {
        id: `update-${Date.now()}`,
        type: ["new_listing", "price_change", "status_change", "conversion_update"][
          Math.floor(Math.random() * 4)
        ] as PropertyUpdate["type"],
        property: {
          address: [
            "123 Broadway",
            "456 Park Avenue",
            "789 Madison Avenue",
            "321 Fifth Avenue",
            "654 Lexington Avenue",
          ][Math.floor(Math.random() * 5)],
          submarket: ["Midtown South", "Financial District", "Tribeca", "SoHo", "Chelsea"][
            Math.floor(Math.random() * 5)
          ],
          price: Math.floor(Math.random() * 50000000) + 5000000,
          priceChange: Math.random() > 0.5 ? (Math.random() - 0.5) * 2000000 : undefined,
          status: ["Available", "Under Contract", "Sold", "Underway", "Completed"][Math.floor(Math.random() * 5)],
          category: ["Office Buildings", "Mixed-Use Buildings", "Development Sites"][Math.floor(Math.random() * 3)],
          gsf: Math.floor(Math.random() * 100000) + 10000,
          units: Math.floor(Math.random() * 200) + 50,
        },
        timestamp: new Date(),
        details: "Property details updated with latest market information",
      }

      setUpdates((prev) => [mockUpdate, ...prev.slice(0, 49)]) // Keep last 50 updates
    }, 2000)

    return () => clearInterval(interval)
  }, [isLive])

  const getUpdateIcon = (type: PropertyUpdate["type"]) => {
    switch (type) {
      case "new_listing":
        return <Building className="h-4 w-4 text-blue-500" />
      case "price_change":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "status_change":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "conversion_update":
        return <TrendingUp className="h-4 w-4 text-purple-500" />
    }
  }

  const getUpdateColor = (type: PropertyUpdate["type"]) => {
    switch (type) {
      case "new_listing":
        return "bg-blue-50 border-blue-200"
      case "price_change":
        return "bg-green-50 border-green-200"
      case "status_change":
        return "bg-orange-50 border-orange-200"
      case "conversion_update":
        return "bg-purple-50 border-purple-200"
    }
  }

  const getUpdateTitle = (type: PropertyUpdate["type"]) => {
    switch (type) {
      case "new_listing":
        return "New Listing"
      case "price_change":
        return "Price Update"
      case "status_change":
        return "Status Change"
      case "conversion_update":
        return "Conversion Update"
    }
  }

  const filteredUpdates = filter === "all" ? updates : updates.filter((update) => update.type === filter)

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Real-Time Property Feed
            {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilter(filter === "all" ? "price_change" : "all")}>
              <Filter className="h-4 w-4 mr-1" />
              {filter === "all" ? "All" : "Price Changes"}
            </Button>
            <Button variant={isLive ? "default" : "outline"} size="sm" onClick={() => setIsLive(!isLive)}>
              {isLive ? "Live" : "Paused"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No updates yet</p>
              </div>
            ) : (
              filteredUpdates.map((update) => (
                <div
                  key={update.id}
                  className={`p-4 rounded-lg border ${getUpdateColor(update.type)} hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getUpdateIcon(update.type)}
                      <span className="font-medium text-sm">{getUpdateTitle(update.type)}</span>
                      <Badge variant="outline" className="text-xs">
                        {update.property.submarket}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{update.timestamp.toLocaleTimeString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{update.property.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-mono font-medium">${(update.property.price / 1000000).toFixed(1)}M</span>
                        {update.property.priceChange && (
                          <span
                            className={`ml-2 flex items-center gap-1 ${
                              update.property.priceChange > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {update.property.priceChange > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            ${Math.abs(update.property.priceChange / 1000000).toFixed(1)}M
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">GSF: </span>
                        <span className="font-mono">{update.property.gsf.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {update.property.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
