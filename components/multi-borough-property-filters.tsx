"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, MapPin, DollarSign, Square, Filter, X } from "lucide-react"

interface FilterState {
  borough: string
  category: string
  submarket: string
  status: string
  minPrice: string
  maxPrice: string
  minGSF: string
  maxGSF: string
  search: string
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterState) => void
}

const boroughs = [
  { value: "all", label: "All Boroughs" },
  { value: "Manhattan", label: "Manhattan" },
  { value: "Brooklyn", label: "Brooklyn" },
  { value: "Queens", label: "Queens" },
  { value: "Bronx", label: "Bronx" },
  { value: "Staten Island", label: "Staten Island" },
]

const propertyCategories = [
  { value: "all", label: "All Property Types" },
  { value: "Office Buildings", label: "Office Buildings" },
  { value: "Multifamily Apartment Buildings", label: "Multifamily Apartments" },
  { value: "Mixed-Use Buildings", label: "Mixed-Use Buildings" },
  { value: "Development Sites", label: "Development Sites" },
  { value: "Industrial", label: "Industrial" },
  { value: "Retail Condos", label: "Retail Condos" },
  { value: "Ground Leases", label: "Ground Leases" },
  { value: "Office-to-Residential Conversion", label: "Office-to-Residential" },
]

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "Available", label: "Available" },
  { value: "Under Contract", label: "Under Contract" },
  { value: "Sold", label: "Sold" },
  { value: "Completed", label: "Completed" },
  { value: "Underway", label: "Underway" },
  { value: "Projected", label: "Projected" },
]

const priceRanges = [
  { value: "any", label: "Any Price" }, // Changed empty string to "any"
  { value: "0-50000000", label: "Under $50M" },
  { value: "50000000-100000000", label: "$50M - $100M" },
  { value: "100000000-250000000", label: "$100M - $250M" },
  { value: "250000000-500000000", label: "$250M - $500M" },
  { value: "500000000-1000000000", label: "$500M - $1B" },
  { value: "1000000000-", label: "Over $1B" },
]

const gsfRanges = [
  { value: "any", label: "Any Size" }, // Changed empty string to "any"
  { value: "0-100000", label: "Under 100K SF" },
  { value: "100000-250000", label: "100K - 250K SF" },
  { value: "250000-500000", label: "250K - 500K SF" },
  { value: "500000-1000000", label: "500K - 1M SF" },
  { value: "1000000-", label: "Over 1M SF" },
]

export function MultiBoroughPropertyFilters({ onFiltersChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    borough: "all",
    category: "all",
    submarket: "all",
    status: "all",
    minPrice: "",
    maxPrice: "",
    minGSF: "",
    maxGSF: "",
    search: "",
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)

    // Update active filters for display
    const active = Object.entries(newFilters)
      .filter(([k, v]) => v && v !== "all" && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
    setActiveFilters(active)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      borough: "all",
      category: "all",
      submarket: "all",
      status: "all",
      minPrice: "",
      maxPrice: "",
      minGSF: "",
      maxGSF: "",
      search: "",
    }
    setFilters(clearedFilters)
    setActiveFilters([])
    onFiltersChange(clearedFilters)
  }

  const setPriceRange = (range: string) => {
    if (!range || range === "any") {
      // Added check for "any" value
      updateFilter("minPrice", "")
      updateFilter("maxPrice", "")
      return
    }

    const [min, max] = range.split("-")
    updateFilter("minPrice", min || "")
    updateFilter("maxPrice", max || "")
  }

  const setGSFRange = (range: string) => {
    if (!range || range === "any") {
      // Added check for "any" value
      updateFilter("minGSF", "")
      updateFilter("maxGSF", "")
      return
    }

    const [min, max] = range.split("-")
    updateFilter("minGSF", min || "")
    updateFilter("maxGSF", max || "")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Property Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFilters.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search by address, submarket, or notes..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Primary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              Borough
            </label>
            <Select value={filters.borough} onValueChange={(value) => updateFilter("borough", value)}>
              <SelectTrigger className="text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {boroughs.map((borough) => (
                  <SelectItem key={borough.value} value={borough.value} className="text-xs md:text-sm">
                    {borough.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium flex items-center gap-1">
              <Building className="h-3 w-3 md:h-4 md:w-4" />
              Property Type
            </label>
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger className="text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {propertyCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-xs md:text-sm">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger className="text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-xs md:text-sm">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
              Price Range
            </label>
            <Select onValueChange={setPriceRange}>
              <SelectTrigger className="text-xs md:text-sm">
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value} className="text-xs md:text-sm">
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium flex items-center gap-1">
              <Square className="h-3 w-3 md:h-4 md:w-4" />
              Size Range (GSF)
            </label>
            <Select onValueChange={setGSFRange}>
              <SelectTrigger className="text-xs md:text-sm">
                <SelectValue placeholder="Select size range" />
              </SelectTrigger>
              <SelectContent>
                {gsfRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value} className="text-xs md:text-sm">
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium">Custom Price Range</label>
            <div className="flex gap-2">
              <Input
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                type="number"
                className="text-xs md:text-sm"
              />
              <Input
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                type="number"
                className="text-xs md:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="text-xs md:text-sm font-medium">Active Filters</label>
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs px-3 py-1 bg-transparent">
                  <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 leading-tight">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
