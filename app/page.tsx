"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BarChart3, Search, Filter, Download, RefreshCw, Moon, Sun } from "lucide-react"
import type { PropertyData } from "@/types/property"
import { PropertyTable } from "@/components/property-table"
import { PropertyCards } from "@/components/property-cards"
import { ChartsSection } from "@/components/charts-section"
import { InteractiveMap } from "@/components/interactive-map"
import { DataProcessing } from "@/components/data-processing"
import { useTheme } from "@/hooks/use-theme"
import { useNotification } from "@/hooks/use-notification"
import { propertyData } from "@/data/property-data"
import { EnhancedStatsCards } from "@/components/enhanced-stats-cards"
import { APIDataPanel } from "@/components/api-data-panel"
import { EconomicIndicatorsChart } from "@/components/economic-indicators-chart"
import { ComprehensiveAPIIntegration } from "@/components/comprehensive-api-integration"

export default function ManhattanDashboard() {
  const [filteredData, setFilteredData] = useState<PropertyData[]>(propertyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [submarketFilter, setSubmarketFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [minUnits, setMinUnits] = useState("")
  const [maxUnits, setMaxUnits] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [apiData, setApiData] = useState<any>(null)
  const [lastDataRefresh, setLastDataRefresh] = useState<Date>(new Date())

  const { isDark, toggleTheme } = useTheme()
  const { showNotification } = useNotification()

  // Filter options
  const submarkets = useMemo(() => [...new Set(propertyData.map((p) => p.submarket).filter(Boolean))].sort(), [])

  const types = useMemo(() => [...new Set(propertyData.map((p) => p.type).filter(Boolean))].sort(), [])

  const statuses = useMemo(() => [...new Set(propertyData.map((p) => p.status).filter(Boolean))].sort(), [])

  // Apply filters
  useEffect(() => {
    const filtered = propertyData.filter((prop) => {
      // Search filter
      if (
        searchTerm &&
        !(
          (prop.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (prop.submarket || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (prop.notes || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (prop.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (prop.status || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false
      }

      // Other filters
      if (submarketFilter !== "all" && prop.submarket !== submarketFilter) return false
      if (typeFilter !== "all" && prop.type !== typeFilter) return false
      if (statusFilter !== "all" && prop.status !== statusFilter) return false

      const units = prop.units || 0
      const min = Number.parseInt(minUnits) || 0
      const max = Number.parseInt(maxUnits) || Number.POSITIVE_INFINITY
      if (units < min || units > max) return false

      return true
    })

    setFilteredData(filtered)
  }, [searchTerm, submarketFilter, typeFilter, statusFilter, minUnits, maxUnits])

  const handleExportCSV = () => {
    const headers = ["Address", "Submarket", "Units", "GSF", "Type", "Status", "Notes", "Eligible", "Press Link"]

    let csv = headers.join(",") + "\n"

    filteredData.forEach((row) => {
      const values = [
        `"${(row.address || "").replace(/"/g, '""')}"`,
        `"${(row.submarket || "").replace(/"/g, '""')}"`,
        row.units || "",
        row.gsf || "",
        `"${(row.type || "").replace(/"/g, '""')}"`,
        `"${(row.status || "").replace(/"/g, '""')}"`,
        `"${(row.notes || "").replace(/"/g, '""')}"`,
        row.eligible ? "Yes" : "No",
        `"${(row.pressLink || "").replace(/"/g, '""')}"`,
      ]
      csv += values.join(",") + "\n"
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `manhattan_office_conversions_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    showNotification("CSV export completed!", "success")
  }

  const handleRefresh = () => {
    setSearchTerm("")
    setSubmarketFilter("all")
    setTypeFilter("all")
    setStatusFilter("all")
    setMinUnits("")
    setMaxUnits("")
    setFilteredData(propertyData)
    setLastDataRefresh(new Date())
    showNotification(`Data refreshed successfully! ${propertyData.length} properties loaded.`, "success")
  }

  const handleAPIDataUpdate = (data: any) => {
    setApiData(data)
    setLastDataRefresh(new Date())
    showNotification("Dashboard enhanced with comprehensive API data!", "success")
  }

  const handleAnalyticsClick = (type: string) => {
    showNotification(`Opening ${type} analytics...`, "info")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="dashboard-gradient text-white p-8 mb-8 shimmer">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-balance">Manhattan Office-to-Residential Conversions</h1>
              <p className="text-lg opacity-90">
                Comprehensive real-time tracking with AI-powered insights and live market data
              </p>
              <div className="mt-2 text-sm opacity-75">
                {propertyData.length} properties • Last updated: {lastDataRefresh.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDark} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Enhanced Stats Cards with AI Insights */}
        <EnhancedStatsCards data={filteredData} apiData={apiData} onAnalyticsClick={handleAnalyticsClick} />

        {/* Comprehensive API Integration Panel */}
        <ComprehensiveAPIIntegration onDataUpdate={handleAPIDataUpdate} />

        {/* API Data Integration Panel */}
        <APIDataPanel onDataUpdate={handleAPIDataUpdate} />

        {/* Economic Indicators Chart */}
        <EconomicIndicatorsChart apiData={apiData} />

        {/* Data Management */}
        <Card className="border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <BarChart3 className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Label htmlFor="view-mode">View:</Label>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "cards")}>
                  <TabsList>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing */}
        <DataProcessing />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Properties</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search addresses, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Submarket</Label>
                <Select value={submarketFilter} onValueChange={setSubmarketFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Submarkets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submarkets</SelectItem>
                    {submarkets.map((submarket) => (
                      <SelectItem key={submarket} value={submarket}>
                        {submarket}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-units">Min Units</Label>
                <Input
                  id="min-units"
                  type="number"
                  placeholder="0"
                  value={minUnits}
                  onChange={(e) => setMinUnits(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-units">Max Units</Label>
                <Input
                  id="max-units"
                  type="number"
                  placeholder="No limit"
                  value={maxUnits}
                  onChange={(e) => setMaxUnits(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Table/Cards - Full Width */}
        <div className="w-full">
          {viewMode === "table" ? (
            <PropertyTable data={filteredData} expandedRows={expandedRows} setExpandedRows={setExpandedRows} />
          ) : (
            <PropertyCards data={filteredData} />
          )}
        </div>

        {/* Charts */}
        <ChartsSection data={filteredData} />

        {/* Interactive Map */}
        <div className="w-full">
          <InteractiveMap data={filteredData} />
        </div>
      </div>
    </div>
  )
}
