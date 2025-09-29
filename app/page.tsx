"use client"

import { useState, useEffect, Suspense, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building, Home, Download, RefreshCw, Filter, Map, TrendingUp, DollarSign, MapPin } from "lucide-react"
import { enhancedPropertyData, type EnhancedProperty } from "@/data/enhanced-property-data"
import { SkylinePageBoundary, SkylineWidgetBoundary } from "@/components/skyline-error-boundary"
import { SkylineWidgetLoader } from "@/components/skyline-loading"
import { SkylineAnalyticsDashboard } from "@/components/skyline-analytics"
import { SkylineThemeSelector } from "@/components/skyline-theme-provider"
import { APIIntegrationDashboard } from "@/components/api-integration-dashboard"
import { ManhattanMap } from "@/components/manhattan-map"
import { DataChangesTracker } from "@/components/data-changes-tracker"
import { ExecutiveSummary } from "@/components/executive-summary"
import { TradingDashboard } from "@/components/trading-dashboard"
import { MarketTicker } from "@/components/market-ticker"
import { NYCOpenDataIntegration } from "@/components/nyc-open-data-client"
import { EnhancedMarketIntelligence } from "@/components/enhanced-market-intelligence"
import { EnhancedMultiCategoryAIChat } from "@/components/enhanced-multi-category-ai-chat"
import { EnhancedClientTools } from "@/components/enhanced-client-tools"
import { MultiBoroughPropertyFilters } from "@/components/multi-borough-property-filters"
import { DeploymentStatusWidget } from "@/components/deployment-status-widget"
import { DatasetExpansionDashboard } from "@/components/dataset-expansion-dashboard"

const usePerformanceMonitoring = () => {
  useEffect(() => {
    console.log("[v0] Dashboard performance metrics:", {
      loadTime: performance.now(),
      memory: (performance as any).memory?.usedJSHeapSize || "N/A",
      timing: performance.getEntriesByType("navigation")[0] || "N/A",
    })
  }, [])
}

export default function Dashboard() {
  const [filteredData, setFilteredData] = useState<EnhancedProperty[]>(enhancedPropertyData)
  const [allProperties, setAllProperties] = useState<EnhancedProperty[]>(enhancedPropertyData) // Track all properties including generated ones
  const [searchTerm, setSearchTerm] = useState("")
  const [submarketFilter, setSubmarketFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [boroughFilter, setBoroughFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState("table")
  const [dashboardMode, setDashboardMode] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [apiData, setApiData] = useState<any>(null)

  usePerformanceMonitoring()

  const { boroughs, categories, submarkets, statuses } = useMemo(
    () => ({
      boroughs: [...new Set(allProperties.map((p) => p.borough).filter(Boolean))].sort(),
      categories: [...new Set(allProperties.map((p) => p.propertyCategory).filter(Boolean))].sort(),
      submarkets: [...new Set(allProperties.map((p) => p.submarket).filter(Boolean))].sort(),
      statuses: [...new Set(allProperties.map((p) => p.status).filter(Boolean))].sort(),
    }),
    [],
  )

  const enhancedStats = useMemo(
    () => ({
      totalProperties: filteredData.length,
      totalUnits: filteredData.reduce((sum, prop) => sum + (prop.units || 0), 0),
      totalValue: filteredData.reduce((sum, prop) => sum + (prop.askingPrice || 0), 0),
      completedCount: filteredData.filter((prop) => prop.status === "Completed").length,
      underwayCount: filteredData.filter((prop) => prop.status === "Underway").length,
      projectedCount: filteredData.filter((prop) => prop.status === "Projected").length,
      availableCount: filteredData.filter((prop) => prop.status === "Available").length,
      eligibleCount: filteredData.filter((prop) => prop.eligible).length,
      totalGSF: filteredData.reduce((sum, prop) => sum + (prop.gsf || 0), 0),
      marketActivity: "STRONG",
      roiProjection: "+24.3%",
      avgCapRate:
        filteredData.length > 0
          ? filteredData.reduce((sum, prop) => sum + (prop.capRate || 0), 0) / filteredData.length
          : 0,
    }),
    [filteredData],
  )

  const filterProperties = useCallback(
    (properties: EnhancedProperty[]) => {
      return properties.filter((property) => {
        // Search filter
        if (
          searchTerm &&
          !(
            (property.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (property.borough || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (property.submarket || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (property.propertyCategory || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (property.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
          )
        ) {
          return false
        }

        // Borough filter
        if (boroughFilter !== "all" && property.borough !== boroughFilter) return false

        // Category filter
        if (categoryFilter !== "all" && property.propertyCategory !== categoryFilter) return false

        // Submarket filter
        if (submarketFilter !== "all" && property.submarket !== submarketFilter) return false

        // Status filter
        if (statusFilter !== "all" && property.status !== statusFilter) return false

        return true
      })
    },
    [searchTerm, boroughFilter, categoryFilter, submarketFilter, statusFilter],
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = filterProperties(allProperties) // Use allProperties instead of enhancedPropertyData
      setFilteredData(filtered)
      console.log("[v0] Filtered properties:", filtered.length)
    }, 100) // Debounce filtering

    return () => clearTimeout(timeoutId)
  }, [filterProperties, allProperties]) // Add allProperties as dependency

  const handleFiltersChange = useCallback((filters: any) => {
    setBoroughFilter(filters.borough || "all")
    setCategoryFilter(filters.category || "all")
    setSubmarketFilter(filters.submarket || "all")
    setStatusFilter(filters.status || "all")
    setSearchTerm(filters.search || "")
  }, [])

  const getBadgeVariant = useCallback((value: string) => {
    const lowerValue = value.toLowerCase()
    if (lowerValue.includes("completed")) return "default"
    if (lowerValue.includes("underway")) return "secondary"
    if (lowerValue.includes("projected")) return "outline"
    if (lowerValue.includes("available")) return "default"
    return "secondary"
  }, [])

  const refreshData = useCallback(() => {
    setIsLoading(true)
    console.log("[v0] Refreshing data...")
    setTimeout(() => {
      setSearchTerm("")
      setBoroughFilter("all")
      setCategoryFilter("all")
      setSubmarketFilter("all")
      setStatusFilter("all")
      setFilteredData(allProperties) // Use allProperties instead of enhancedPropertyData
      setIsLoading(false)
      console.log("[v0] Data refreshed successfully")
    }, 1000)
  }, [allProperties]) // Add allProperties as dependency

  const exportCSV = useCallback(() => {
    console.log("[v0] Exporting CSV with", filteredData.length, "properties")
    const headers = [
      "Address",
      "Borough",
      "Property Category",
      "Submarket",
      "Units",
      "GSF",
      "Type",
      "Status",
      "Asking Price",
      "Price Per SF",
      "Cap Rate",
      "Notes",
      "Eligible",
      "Press Link",
    ]

    let csv = headers.join(",") + "\n"

    filteredData.forEach((row) => {
      const values = [
        `"${(row.address || "").replace(/"/g, '""')}"`,
        `"${(row.borough || "").replace(/"/g, '""')}"`,
        `"${(row.propertyCategory || "").replace(/"/g, '""')}"`,
        `"${(row.submarket || "").replace(/"/g, '""')}"`,
        row.units || "",
        row.gsf || "",
        `"${(row.type || "").replace(/"/g, '""')}"`,
        `"${(row.status || "").replace(/"/g, '""')}"`,
        row.askingPrice || "",
        row.pricePerSF || "",
        row.capRate || "",
        `"${(row.notes || "").replace(/"/g, '""')}"`,
        row.eligible ? "Yes" : "No",
        `"${(row.pressLink || "").replace(/"/g, '""')}"`,
      ]
      csv += values.join(",") + "\n"
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `nyc_real_estate_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    console.log("[v0] CSV export completed")
  }, [filteredData])

  const handleAPIDataUpdate = useCallback(
    (newData: any) => {
      console.log("[v0] API data updated:", newData)
      setApiData(newData)

      // Cross-reference with existing properties
      if (newData.permits) {
        const matchedProperties = filteredData.filter((prop) =>
          newData.permits.some((permit: any) => permit.house_no && prop.address?.includes(permit.house_no)),
        )
        console.log("[v0] Matched properties with permits:", matchedProperties.length)
      }
    },
    [filteredData],
  )

  const handlePropertiesUpdate = useCallback((updatedProperties: EnhancedProperty[]) => {
    setAllProperties(updatedProperties)
    console.log("[v0] Properties updated from dataset expansion:", updatedProperties.length)
  }, [])

  return (
    <SkylinePageBoundary>
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b-2 border-blue-600 p-3 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 lg:gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 md:mb-2 text-slate-800 leading-tight">
                  🏢 SKYLINE PROPERTIES
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-slate-600 font-medium leading-relaxed">
                  NYC Real Estate Analytics • All 5 Boroughs • 8 Property Categories • Market Intelligence
                </p>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-2 justify-center lg:justify-start">
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Manhattan
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Brooklyn
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Queens
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Bronx
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Staten Island
                  </Badge>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">LIVE DATA</div>
                <div className="text-xs sm:text-sm text-slate-500">Real-time market analysis</div>
                <div className="text-xs text-slate-400 mt-1 leading-tight">
                  {enhancedStats.totalProperties} Properties • ${(enhancedStats.totalValue / 1000000000).toFixed(1)}B
                  Value
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 md:px-4 space-y-3 md:space-y-6 lg:space-y-8 py-3 md:py-6 lg:py-8">
          <SkylineWidgetBoundary widgetName="Market Ticker">
            <Suspense fallback={<SkylineWidgetLoader title="Market Ticker" type="metric" />}>
              <MarketTicker />
            </Suspense>
          </SkylineWidgetBoundary>

          <SkylineWidgetBoundary widgetName="AI Real Estate Assistant">
            <Suspense fallback={<SkylineWidgetLoader title="AI Assistant" type="chart" />}>
              <EnhancedMultiCategoryAIChat />
            </Suspense>
          </SkylineWidgetBoundary>

          <SkylineWidgetBoundary widgetName="Enhanced Stats Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
                <CardContent className="flex items-center justify-between p-3 md:p-4 lg:p-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Total Properties</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 group-hover:scale-105 transition-transform leading-tight">
                      {enhancedStats.totalProperties.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 truncate">All boroughs</span>
                    </div>
                  </div>
                  <Building className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 ml-2" />
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
                <CardContent className="flex items-center justify-between p-3 md:p-4 lg:p-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Total Value</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 group-hover:scale-105 transition-transform leading-tight">
                      ${(enhancedStats.totalValue / 1000000000).toFixed(1)}B
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 truncate">Portfolio value</span>
                    </div>
                  </div>
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 ml-2" />
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
                <CardContent className="flex items-center justify-between p-3 md:p-4 lg:p-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Avg Cap Rate</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 group-hover:scale-105 transition-transform leading-tight">
                      {enhancedStats.avgCapRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-xs text-purple-600 truncate">Market average</span>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0 ml-2" />
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
                <CardContent className="flex items-center justify-between p-3 md:p-4 lg:p-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Available</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-600 group-hover:scale-105 transition-transform leading-tight">
                      {enhancedStats.availableCount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-xs text-orange-600 truncate">Ready to buy</span>
                    </div>
                  </div>
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0 ml-2" />
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
                <CardContent className="flex items-center justify-between p-3 md:p-4 lg:p-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Total Units</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 group-hover:scale-105 transition-transform leading-tight">
                      {enhancedStats.totalUnits.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-600 truncate">Residential units</span>
                    </div>
                  </div>
                  <Home className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 ml-2" />
                </CardContent>
              </Card>
            </div>
          </SkylineWidgetBoundary>

          <SkylineWidgetBoundary widgetName="Enhanced Client Tools">
            <EnhancedClientTools properties={filteredData} />
          </SkylineWidgetBoundary>

          {/* Dashboard Mode Selector */}
          <SkylineWidgetBoundary widgetName="Dashboard Controls">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600 text-sm md:text-base">
                  <Filter className="h-4 w-4 md:h-5 md:w-5" />
                  Dashboard Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                  <Button
                    variant={dashboardMode === "overview" ? "default" : "outline"}
                    onClick={() => setDashboardMode("overview")}
                    className="text-xs md:text-sm px-3 py-2"
                  >
                    Overview
                  </Button>
                  <Button
                    variant={dashboardMode === "executive" ? "default" : "outline"}
                    onClick={() => setDashboardMode("executive")}
                    className="text-xs md:text-sm px-3 py-2"
                  >
                    Executive
                  </Button>
                  <Button
                    variant={dashboardMode === "trading" ? "default" : "outline"}
                    onClick={() => setDashboardMode("trading")}
                    className="text-xs md:text-sm px-3 py-2"
                  >
                    Trading
                  </Button>
                  <Button
                    variant={dashboardMode === "analytics" ? "default" : "outline"}
                    onClick={() => setDashboardMode("analytics")}
                    className="text-xs md:text-sm px-3 py-2"
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs md:text-sm px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
                    asChild
                  >
                    <a href="/intelligence">🧠 Intelligence Platform</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SkylineWidgetBoundary>

          {/* Conditional Dashboard Content with Suspense */}
          {dashboardMode === "executive" && (
            <SkylineWidgetBoundary widgetName="Executive Summary">
              <Suspense fallback={<SkylineWidgetLoader title="Executive Summary" type="chart" />}>
                <ExecutiveSummary properties={filteredData} />
              </Suspense>
            </SkylineWidgetBoundary>
          )}

          {dashboardMode === "trading" && (
            <SkylineWidgetBoundary widgetName="Trading Dashboard">
              <Suspense fallback={<SkylineWidgetLoader title="Trading Dashboard" type="chart" />}>
                <TradingDashboard properties={filteredData} />
              </Suspense>
            </SkylineWidgetBoundary>
          )}

          {dashboardMode === "analytics" && (
            <SkylineWidgetBoundary widgetName="AI Analytics">
              <Suspense fallback={<SkylineWidgetLoader title="AI Analytics" type="chart" />}>
                <SkylineAnalyticsDashboard properties={filteredData} />
              </Suspense>
            </SkylineWidgetBoundary>
          )}

          {dashboardMode === "overview" && (
            <>
              {/* NYC Open Data Integration */}
              <SkylineWidgetBoundary widgetName="NYC Open Data Integration">
                <Suspense fallback={<SkylineWidgetLoader title="NYC Open Data" type="table" />}>
                  <NYCOpenDataIntegration onDataUpdate={handleAPIDataUpdate} />
                </Suspense>
              </SkylineWidgetBoundary>

              {/* Enhanced Market Intelligence */}
              <SkylineWidgetBoundary widgetName="Enhanced Market Intelligence">
                <Suspense fallback={<SkylineWidgetLoader title="Market Intelligence" type="chart" />}>
                  <EnhancedMarketIntelligence />
                </Suspense>
              </SkylineWidgetBoundary>

              {/* API Integration Dashboard */}
              <SkylineWidgetBoundary widgetName="API Integration">
                <Suspense fallback={<SkylineWidgetLoader title="API Integration" type="metric" />}>
                  <APIIntegrationDashboard />
                </Suspense>
              </SkylineWidgetBoundary>

              {/* AI Analytics Dashboard */}
              <SkylineWidgetBoundary widgetName="AI Analytics">
                <Suspense fallback={<SkylineWidgetLoader title="AI Analytics" type="chart" />}>
                  <SkylineAnalyticsDashboard properties={filteredData} />
                </Suspense>
              </SkylineWidgetBoundary>
            </>
          )}

          {/* Data Management */}
          <SkylineWidgetBoundary widgetName="Data Management">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-600 text-sm md:text-base">
                      <Filter className="h-4 w-4 md:h-5 md:w-5" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
                      <Button
                        onClick={refreshData}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-xs md:text-sm px-3 py-2"
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Refreshing..." : "Refresh Data"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={exportCSV}
                        className="flex items-center justify-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent text-xs md:text-sm px-3 py-2"
                      >
                        <Download className="h-3 w-3 md:h-4 md:w-4" />
                        Export CSV
                      </Button>
                      <div className="flex items-center gap-2 sm:ml-auto">
                        <label className="text-xs md:text-sm font-medium whitespace-nowrap">View:</label>
                        <Select value={viewMode} onValueChange={setViewMode}>
                          <SelectTrigger className="w-20 sm:w-24 md:w-32 border-blue-300 text-xs md:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="table">Table</SelectItem>
                            <SelectItem value="cards">Cards</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-3">
                <SkylineThemeSelector />
                <DeploymentStatusWidget />
              </div>
            </div>
          </SkylineWidgetBoundary>

          {/* Dataset Expansion Dashboard */}
          <SkylineWidgetBoundary widgetName="Auto-Expanding Dataset">
            <DatasetExpansionDashboard
              baseProperties={enhancedPropertyData}
              onPropertiesUpdate={handlePropertiesUpdate}
            />
          </SkylineWidgetBoundary>

          <SkylineWidgetBoundary widgetName="Multi-Borough Property Filters">
            <MultiBoroughPropertyFilters onFiltersChange={handleFiltersChange} />
          </SkylineWidgetBoundary>

          {/* Data Changes Tracker */}
          <SkylineWidgetBoundary widgetName="Data Changes Tracker">
            <DataChangesTracker />
          </SkylineWidgetBoundary>

          {/* Main Content */}
          <div className="space-y-4 md:space-y-8">
            {viewMode === "table" && (
              <SkylineWidgetBoundary widgetName="Property Table">
                {isLoading ? (
                  <SkylineWidgetLoader title="Property Data" type="table" />
                ) : (
                  <Card className="border-blue-200">
                    <CardContent className="p-0">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[800px] md:min-w-[1200px] lg:min-w-[1400px]">
                          <Table className="w-full table-fixed">
                            <TableHeader>
                              <TableRow className="border-blue-200">
                                <TableHead className="w-[140px] md:w-[180px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Address
                                </TableHead>
                                <TableHead className="w-[80px] md:w-[100px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Borough
                                </TableHead>
                                <TableHead className="w-[100px] md:w-[140px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Category
                                </TableHead>
                                <TableHead className="w-[90px] md:w-[120px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Submarket
                                </TableHead>
                                <TableHead className="w-[60px] md:w-[80px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Units
                                </TableHead>
                                <TableHead className="w-[80px] md:w-[100px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Price
                                </TableHead>
                                <TableHead className="w-[70px] md:w-[80px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Cap Rate
                                </TableHead>
                                <TableHead className="w-[80px] md:w-[100px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Status
                                </TableHead>
                                <TableHead className="w-[60px] md:w-[80px] text-blue-600 font-semibold text-xs md:text-sm px-2 md:px-4">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredData.map((property, index) => (
                                <TableRow key={index} className="border-blue-100 hover:bg-blue-50">
                                  <TableCell className="font-medium text-xs md:text-sm px-2 md:px-4 truncate">
                                    {property.address}
                                  </TableCell>
                                  <TableCell className="text-xs md:text-sm px-2 md:px-4">
                                    <Badge variant="outline" className="text-xs px-1 py-0.5">
                                      {property.borough}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs md:text-sm px-2 md:px-4">
                                    <Badge variant="secondary" className="text-xs px-1 py-0.5 truncate max-w-full">
                                      {property.propertyCategory?.replace(" Buildings", "").replace(" Apartment", "")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs md:text-sm px-2 md:px-4 truncate">
                                    {property.submarket || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-xs md:text-sm px-2 md:px-4">
                                    {property.units ? property.units.toLocaleString() : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-xs md:text-sm px-2 md:px-4">
                                    {property.askingPrice ? `$${(property.askingPrice / 1000000).toFixed(0)}M` : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-xs md:text-sm px-2 md:px-4">
                                    {property.capRate ? `${property.capRate.toFixed(1)}%` : "N/A"}
                                  </TableCell>
                                  <TableCell className="px-2 md:px-4">
                                    <Badge
                                      variant={getBadgeVariant(property.status || "")}
                                      className="text-xs px-1 py-0.5"
                                    >
                                      {property.status || "N/A"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="px-2 md:px-4">
                                    {property.pressLink && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                                        asChild
                                      >
                                        <a href={property.pressLink} target="_blank" rel="noopener noreferrer">
                                          View
                                        </a>
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </SkylineWidgetBoundary>
            )}

            {viewMode === "cards" && (
              <SkylineWidgetBoundary widgetName="Property Cards">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkylineWidgetLoader key={i} title="Property" type="metric" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                    {filteredData.map((property, index) => (
                      <Card key={index} className="border-blue-200 hover:border-blue-400 transition-colors">
                        <CardHeader className="pb-2 md:pb-3">
                          <CardTitle className="text-sm md:text-base lg:text-lg text-blue-600 leading-tight">
                            {property.address}
                          </CardTitle>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {property.borough}
                            </Badge>
                            <Badge variant="secondary" className="text-xs px-2 py-1 truncate max-w-[120px]">
                              {property.propertyCategory?.replace(" Buildings", "")}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs md:text-sm text-muted-foreground">Submarket:</span>
                            <span className="text-xs md:text-sm truncate max-w-[120px]">
                              {property.submarket || "N/A"}
                            </span>
                          </div>
                          {property.units && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs md:text-sm text-muted-foreground">Units:</span>
                              <span className="text-xs md:text-sm">{property.units.toLocaleString()}</span>
                            </div>
                          )}
                          {property.askingPrice && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs md:text-sm text-muted-foreground">Price:</span>
                              <span className="text-xs md:text-sm font-semibold text-green-600">
                                ${(property.askingPrice / 1000000).toFixed(0)}M
                              </span>
                            </div>
                          )}
                          {property.capRate && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs md:text-sm text-muted-foreground">Cap Rate:</span>
                              <span className="text-xs md:text-sm font-semibold text-purple-600">
                                {property.capRate.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-xs md:text-sm text-muted-foreground">Status:</span>
                            <Badge variant={getBadgeVariant(property.status || "")} className="text-xs px-2 py-1">
                              {property.status || "N/A"}
                            </Badge>
                          </div>
                          {property.notes && (
                            <div className="mt-2 md:mt-3 p-2 bg-muted rounded text-xs md:text-sm leading-relaxed">
                              {property.notes}
                            </div>
                          )}
                          {property.pressLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 md:mt-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent text-xs md:text-sm"
                              asChild
                            >
                              <a href={property.pressLink} target="_blank" rel="noopener noreferrer">
                                View Article
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </SkylineWidgetBoundary>
            )}

            {/* Map Section with Suspense */}
            <SkylineWidgetBoundary widgetName="Interactive Map">
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-600 text-sm md:text-base">
                    <Map className="h-4 w-4 md:h-5 md:w-5" />
                    Interactive NYC Real Estate Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-4 lg:p-6">
                  <Suspense fallback={<SkylineWidgetLoader title="Interactive Map" type="chart" />}>
                    <ManhattanMap properties={filteredData} />
                  </Suspense>
                </CardContent>
              </Card>
            </SkylineWidgetBoundary>
          </div>
        </div>
      </div>
    </SkylinePageBoundary>
  )
}
