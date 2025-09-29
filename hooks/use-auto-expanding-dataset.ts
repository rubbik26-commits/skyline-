"use client"

import { useState, useEffect, useCallback } from "react"
import type { EnhancedProperty } from "@/data/enhanced-property-data"
import { PropertyDatasetManager } from "@/lib/services/property-generator"

interface DatasetStats {
  totalProperties: number
  expansionCount: number
  lastExpansion: Date | null
  byBorough: Record<string, number>
  byCategory: Record<string, number>
}

export function useAutoExpandingDataset(baseProperties: EnhancedProperty[]) {
  const [properties, setProperties] = useState<EnhancedProperty[]>(baseProperties)
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [isExpanding, setIsExpanding] = useState(false)
  const [expansionHistory, setExpansionHistory] = useState<
    Array<{
      timestamp: Date
      count: number
      totalAfter: number
    }>
  >([])

  const manager = PropertyDatasetManager.getInstance()

  // Load existing expanded properties on mount
  useEffect(() => {
    const expandedProperties = manager.getAllProperties()
    if (expandedProperties.length > 0) {
      console.log("[v0] Loading existing expanded properties:", expandedProperties.length)
      setProperties([...baseProperties, ...expandedProperties])
    }

    const currentStats = manager.getExpansionStats()
    setStats(currentStats)
  }, [baseProperties])

  // Auto-expansion trigger on component refresh
  useEffect(() => {
    const shouldAutoExpand = Math.random() > 0.3 // 70% chance to auto-expand

    if (shouldAutoExpand) {
      console.log("[v0] Auto-expansion triggered on component refresh")
      expandDataset()
    }
  }, []) // Only run once on mount

  const expandDataset = useCallback(
    async (count?: number) => {
      if (isExpanding) return

      setIsExpanding(true)
      console.log("[v0] Starting dataset expansion...")

      try {
        // Client-side expansion
        const newProperties = manager.expandDataset(count)
        const updatedStats = manager.getExpansionStats()

        setProperties((prev) => [...prev, ...newProperties])
        setStats(updatedStats)

        // Track expansion history
        setExpansionHistory((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            count: newProperties.length,
            totalAfter:
              prev.length > 0
                ? prev[prev.length - 1].totalAfter + newProperties.length
                : baseProperties.length + newProperties.length,
          },
        ])

        // Also call API for server-side tracking
        try {
          const response = await fetch("/api/properties/expand", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "expand", count }),
          })

          if (response.ok) {
            const apiResult = await response.json()
            console.log("[v0] Server-side expansion completed:", apiResult.message)
          }
        } catch (apiError) {
          console.warn("[v0] Server-side expansion failed, continuing with client-side only:", apiError)
        }
      } catch (error) {
        console.error("[v0] Dataset expansion failed:", error)
      } finally {
        setIsExpanding(false)
      }
    },
    [isExpanding, baseProperties.length, manager],
  )

  const manualExpand = useCallback(
    async (count = 25) => {
      console.log(`[v0] Manual expansion requested: ${count} properties`)
      await expandDataset(count)
    },
    [expandDataset],
  )

  const resetDataset = useCallback(() => {
    manager.resetDataset()
    setProperties(baseProperties)
    setStats(manager.getExpansionStats())
    setExpansionHistory([])
    console.log("[v0] Dataset reset to base properties")
  }, [baseProperties, manager])

  const getGrowthPattern = useCallback(() => {
    if (expansionHistory.length === 0) return null

    return expansionHistory.map((expansion, index) => ({
      refreshNumber: index + 1,
      propertiesAdded: expansion.count,
      totalProperties: expansion.totalAfter,
      timestamp: expansion.timestamp,
    }))
  }, [expansionHistory])

  return {
    properties,
    stats,
    isExpanding,
    expansionHistory,
    expandDataset: manualExpand,
    resetDataset,
    getGrowthPattern,
    // Analytics
    totalExpansions: stats?.expansionCount || 0,
    totalGenerated: (stats?.totalProperties || 0) - baseProperties.length,
    averageExpansionSize: stats?.expansionCount
      ? Math.round(((stats?.totalProperties || 0) - baseProperties.length) / stats.expansionCount)
      : 0,
  }
}
