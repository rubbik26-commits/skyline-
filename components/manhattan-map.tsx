"use client"

import { useEffect, useRef, useState } from "react"
import type { Property } from "@/data/property-data"

interface ManhattanMapProps {
  properties: Property[]
}

export function ManhattanMap({ properties }: ManhattanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => setIsLoaded(true)
        document.head.appendChild(script)
      } else {
        setIsLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const L = (window as any).L
    if (!L) return

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7589, -73.9851], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLoaded])

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const L = (window as any).L
    if (!L) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add markers for properties with coordinates
    properties.forEach((property, index) => {
      // Generate approximate coordinates for Manhattan properties
      const lat = 40.7589 + (Math.random() - 0.5) * 0.1
      const lng = -73.9851 + (Math.random() - 0.5) * 0.05

      const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current)

      const statusColor =
        property.status === "Completed" ? "#10b981" : property.status === "Underway" ? "#f59e0b" : "#6b7280"

      marker.bindPopup(`
        <div class="p-3 min-w-[200px]">
          <h4 class="font-semibold text-lg mb-2">${property.address}</h4>
          <div class="space-y-1 text-sm">
            <p><strong>Submarket:</strong> ${property.submarket || "N/A"}</p>
            <p><strong>Units:</strong> ${property.units ? property.units.toLocaleString() : "N/A"}</p>
            <p><strong>GSF:</strong> ${property.gsf ? property.gsf.toLocaleString() : "N/A"}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${property.status || "N/A"}</span></p>
            ${property.notes ? `<p class="mt-2 p-2 bg-gray-100 rounded text-xs">${property.notes}</p>` : ""}
            ${property.pressLink ? `<a href="${property.pressLink}" target="_blank" class="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">View Article</a>` : ""}
          </div>
        </div>
      `)

      markersRef.current.push(marker)
    })
  }, [properties, isLoaded])

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gradient-to-br from-[#4682B4]/5 to-[#5B9BD5]/5 rounded-lg flex items-center justify-center border border-[#4682B4]/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4682B4] mx-auto mb-4"></div>
          <p className="text-[#4682B4] font-medium">Loading Interactive Map...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="h-96 w-full rounded-lg border border-[#4682B4]/20" style={{ minHeight: "400px" }} />
  )
}
