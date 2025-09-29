import type { EnhancedProperty } from "@/data/enhanced-property-data"

// Property generation templates for different categories and boroughs
const PROPERTY_TEMPLATES = {
  addresses: {
    Manhattan: [
      "Broadway",
      "Park Avenue",
      "Madison Avenue",
      "Fifth Avenue",
      "Lexington Avenue",
      "Third Avenue",
      "Second Avenue",
      "First Avenue",
      "York Avenue",
      "East End Avenue",
      "West End Avenue",
      "Amsterdam Avenue",
      "Columbus Avenue",
      "Central Park West",
      "Riverside Drive",
      "Wall Street",
      "Water Street",
      "Pearl Street",
      "Stone Street",
    ],
    Brooklyn: [
      "Atlantic Avenue",
      "Flatbush Avenue",
      "Fourth Avenue",
      "Fifth Avenue",
      "Seventh Avenue",
      "Eighth Avenue",
      "Prospect Park West",
      "Ocean Parkway",
      "Eastern Parkway",
      "Kings Highway",
      "Bay Ridge Avenue",
      "Court Street",
      "Smith Street",
      "Carroll Street",
      "President Street",
    ],
    Queens: [
      "Queens Boulevard",
      "Northern Boulevard",
      "Roosevelt Avenue",
      "Jamaica Avenue",
      "Hillside Avenue",
      "Union Turnpike",
      "Grand Central Parkway",
      "Astoria Boulevard",
      "Ditmars Boulevard",
      "Steinway Street",
      "31st Avenue",
      "Broadway",
      "Vernon Boulevard",
      "Jackson Avenue",
      "Thomson Avenue",
    ],
    Bronx: [
      "Grand Concourse",
      "Fordham Road",
      "Boston Road",
      "Southern Boulevard",
      "Third Avenue",
      "Webster Avenue",
      "Jerome Avenue",
      "University Avenue",
      "Morris Avenue",
      "Melrose Avenue",
      "East Tremont Avenue",
      "Westchester Avenue",
      "Bruckner Boulevard",
      "Cross Bronx Expressway",
    ],
    "Staten Island": [
      "Victory Boulevard",
      "Forest Avenue",
      "Richmond Avenue",
      "Hylan Boulevard",
      "Amboy Road",
      "Clove Road",
      "Targee Street",
      "Bay Street",
      "Richmond Terrace",
      "Arthur Kill Road",
      "Drumgoole Road",
      "Page Avenue",
      "Arden Avenue",
      "Great Kills Road",
      "Bloomingdale Road",
    ],
  },
  submarkets: {
    Manhattan: [
      "Financial District",
      "Tribeca",
      "SoHo",
      "Greenwich Village",
      "East Village",
      "Lower East Side",
      "Chelsea",
      "Flatiron",
      "Gramercy",
      "Midtown West",
      "Midtown East",
      "Hell's Kitchen",
      "Upper East Side",
      "Upper West Side",
      "Harlem",
      "Washington Heights",
      "Inwood",
    ],
    Brooklyn: [
      "Downtown Brooklyn",
      "Brooklyn Heights",
      "DUMBO",
      "Fort Greene",
      "Park Slope",
      "Prospect Heights",
      "Crown Heights",
      "Bedford-Stuyvesant",
      "Williamsburg",
      "Greenpoint",
      "Long Island City",
      "Sunset Park",
      "Bay Ridge",
      "Bensonhurst",
      "Sheepshead Bay",
      "Coney Island",
    ],
    Queens: [
      "Long Island City",
      "Astoria",
      "Sunnyside",
      "Woodside",
      "Jackson Heights",
      "Elmhurst",
      "Corona",
      "Flushing",
      "Forest Hills",
      "Rego Park",
      "Kew Gardens",
      "Jamaica",
      "Far Rockaway",
    ],
    Bronx: [
      "South Bronx",
      "Mott Haven",
      "Melrose",
      "Morrisania",
      "Fordham",
      "University Heights",
      "Tremont",
      "Belmont",
      "Bronx Park",
      "Riverdale",
      "Kingsbridge",
      "Concourse",
    ],
    "Staten Island": [
      "St. George",
      "Stapleton",
      "New Brighton",
      "West Brighton",
      "Port Richmond",
      "Mariners Harbor",
      "New Springville",
      "Todt Hill",
      "Great Kills",
      "Tottenville",
      "Annadale",
      "Eltingville",
    ],
  },
}

const PROPERTY_CATEGORIES: EnhancedProperty["propertyCategory"][] = [
  "Office Buildings",
  "Multifamily Apartment Buildings",
  "Mixed-Use Buildings",
  "Development Sites",
  "Industrial",
  "Retail Condos",
  "Ground Leases",
  "Office-to-Residential Conversion",
]

const PROPERTY_STATUSES: EnhancedProperty["status"][] = [
  "Available",
  "Under Contract",
  "Sold",
  "Completed",
  "Underway",
  "Projected",
]

// Generate random coordinates within borough bounds
const BOROUGH_BOUNDS = {
  Manhattan: { lat: [40.7, 40.8], lng: [-74.02, -73.93] },
  Brooklyn: { lat: [40.57, 40.74], lng: [-74.05, -73.83] },
  Queens: { lat: [40.54, 40.8], lng: [-73.96, -73.7] },
  Bronx: { lat: [40.79, 40.92], lng: [-73.93, -73.75] },
  "Staten Island": { lat: [40.5, 40.65], lng: [-74.26, -74.05] },
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomPrice(category: string, gsf?: number): number {
  const basePrices = {
    "Office Buildings": { min: 300, max: 800 }, // per SF
    "Multifamily Apartment Buildings": { min: 400, max: 1200 },
    "Mixed-Use Buildings": { min: 350, max: 900 },
    "Development Sites": { min: 200000000, max: 800000000 }, // flat price
    Industrial: { min: 150, max: 400 },
    "Retail Condos": { min: 2000, max: 8000 },
    "Ground Leases": { min: 200, max: 600 },
    "Office-to-Residential Conversion": { min: 250, max: 700 },
  }

  const priceRange = basePrices[category as keyof typeof basePrices]
  if (category === "Development Sites") {
    return getRandomNumber(priceRange.min, priceRange.max)
  }

  const pricePerSF = getRandomNumber(priceRange.min, priceRange.max)
  const totalGSF = gsf || getRandomNumber(50000, 2000000)
  return pricePerSF * totalGSF
}

function generateCoordinates(borough: EnhancedProperty["borough"]): [number, number] {
  const bounds = BOROUGH_BOUNDS[borough]
  const lat = bounds.lat[0] + Math.random() * (bounds.lat[1] - bounds.lat[0])
  const lng = bounds.lng[0] + Math.random() * (bounds.lng[1] - bounds.lng[0])
  return [lat, lng]
}

export function generateProperty(borough?: EnhancedProperty["borough"]): EnhancedProperty {
  const selectedBorough = borough || getRandomElement(Object.keys(BOROUGH_BOUNDS) as EnhancedProperty["borough"][])
  const category = getRandomElement(PROPERTY_CATEGORIES)
  const status = getRandomElement(PROPERTY_STATUSES)
  const submarket = getRandomElement(PROPERTY_TEMPLATES.submarkets[selectedBorough])
  const streetName = getRandomElement(PROPERTY_TEMPLATES.addresses[selectedBorough])
  const streetNumber = getRandomNumber(1, 9999)
  const address = `${streetNumber} ${streetName}`

  const gsf = category === "Development Sites" ? null : getRandomNumber(25000, 3000000)
  const units = ["Multifamily Apartment Buildings", "Mixed-Use Buildings", "Office-to-Residential Conversion"].includes(
    category,
  )
    ? getRandomNumber(50, 800)
    : null

  const askingPrice = getRandomPrice(category, gsf || undefined)
  const pricePerSF = gsf ? Math.round(askingPrice / gsf) : null
  const capRate = Math.round((2.5 + Math.random() * 6) * 10) / 10 // 2.5% to 8.5%
  const noi = Math.round(askingPrice * (capRate / 100))

  const [lat, lng] = generateCoordinates(selectedBorough)

  const property: EnhancedProperty = {
    id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    address,
    borough: selectedBorough,
    submarket,
    propertyCategory: category,
    units,
    gsf,
    type: category.replace(" Buildings", "").replace("Office-to-Residential Conversion", "Conversion"),
    status,
    notes: `Generated ${category.toLowerCase()} in ${submarket}`,
    eligible: Math.random() > 0.3, // 70% eligible
    pressLink: "",
    lat,
    lng,
    yearBuilt: getRandomNumber(1950, 2024),
    askingPrice,
    pricePerSF,
    capRate,
    noi,
    zoning:
      category.includes("Office") || category.includes("Industrial")
        ? "Commercial"
        : category.includes("Residential") || category.includes("Multifamily")
          ? "Residential"
          : "Mixed-Use",
    lastUpdated: new Date(),
    coordinates: [lat, lng],
    aiInsights: {
      riskScore: Math.round(Math.random() * 100),
      potentialROI: Math.round((5 + Math.random() * 20) * 10) / 10,
      marketTrend: getRandomElement(["bullish", "bearish", "neutral"] as const),
      confidence: Math.round((60 + Math.random() * 40) * 10) / 10,
    },
  }

  return property
}

export function generateMultipleProperties(count: number, borough?: EnhancedProperty["borough"]): EnhancedProperty[] {
  const properties: EnhancedProperty[] = []
  for (let i = 0; i < count; i++) {
    properties.push(generateProperty(borough))
  }
  return properties
}

export class PropertyDatasetManager {
  private static instance: PropertyDatasetManager
  private properties: EnhancedProperty[] = []
  private expansionCount = 0

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): PropertyDatasetManager {
    if (!PropertyDatasetManager.instance) {
      PropertyDatasetManager.instance = new PropertyDatasetManager()
    }
    return PropertyDatasetManager.instance
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("property_dataset")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          this.properties = parsed.properties || []
          this.expansionCount = parsed.expansionCount || 0
          console.log("[v0] Loaded dataset from localStorage:", this.properties.length, "properties")
        } catch (error) {
          console.error("[v0] Error loading dataset from localStorage:", error)
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      const dataToStore = {
        properties: this.properties,
        expansionCount: this.expansionCount,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem("property_dataset", JSON.stringify(dataToStore))
      console.log("[v0] Saved dataset to localStorage:", this.properties.length, "properties")
    }

    // Server-side global storage
    if (typeof global !== "undefined") {
      ;(global as any).propertyDataset = {
        properties: this.properties,
        expansionCount: this.expansionCount,
        lastUpdated: new Date().toISOString(),
      }
      console.log("[v0] Saved dataset to global storage:", this.properties.length, "properties")
    }
  }

  expandDataset(count?: number): EnhancedProperty[] {
    const expansionSize = count || this.getAutoExpansionSize()
    const newProperties = generateMultipleProperties(expansionSize)

    this.properties.push(...newProperties)
    this.expansionCount++
    this.saveToStorage()

    console.log(`[v0] Dataset expanded by ${expansionSize} properties. Total: ${this.properties.length}`)
    return newProperties
  }

  private getAutoExpansionSize(): number {
    // Progressive expansion: starts at 15-20, grows over time
    const baseSize = 15
    const variability = 5
    const growthFactor = Math.floor(this.expansionCount / 3) * 2 // +2 every 3 expansions

    return baseSize + Math.floor(Math.random() * variability) + growthFactor
  }

  getAllProperties(): EnhancedProperty[] {
    return [...this.properties]
  }

  getExpansionStats() {
    return {
      totalProperties: this.properties.length,
      expansionCount: this.expansionCount,
      lastExpansion: this.properties.length > 0 ? this.properties[this.properties.length - 1]?.lastUpdated : null,
      byBorough: this.getPropertyCountByBorough(),
      byCategory: this.getPropertyCountByCategory(),
    }
  }

  private getPropertyCountByBorough() {
    const counts: Record<string, number> = {}
    this.properties.forEach((prop) => {
      counts[prop.borough] = (counts[prop.borough] || 0) + 1
    })
    return counts
  }

  private getPropertyCountByCategory() {
    const counts: Record<string, number> = {}
    this.properties.forEach((prop) => {
      counts[prop.propertyCategory] = (counts[prop.propertyCategory] || 0) + 1
    })
    return counts
  }

  resetDataset() {
    this.properties = []
    this.expansionCount = 0
    this.saveToStorage()
    console.log("[v0] Dataset reset")
  }
}
