export interface EnhancedProperty {
  id?: string
  address: string
  borough: "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island"
  submarket: string
  propertyCategory:
    | "Office Buildings"
    | "Multifamily Apartment Buildings"
    | "Mixed-Use Buildings"
    | "Development Sites"
    | "Industrial"
    | "Retail Condos"
    | "Ground Leases"
    | "Office-to-Residential Conversion"
  units: number | null
  gsf: number | null
  type: string
  status: "Completed" | "Underway" | "Projected" | "Available" | "Under Contract" | "Sold"
  notes: string
  eligible: boolean
  pressLink: string
  lat: number
  lng: number
  // Enhanced fields for multi-category analysis
  lastUpdated?: Date
  coordinates?: [number, number]
  zoning?: string
  yearBuilt?: number
  askingPrice?: number
  pricePerSF?: number
  capRate?: number
  noi?: number
  aiInsights?: {
    riskScore: number
    potentialROI: number
    marketTrend: "bullish" | "bearish" | "neutral"
    confidence: number
    categorySpecificMetrics?: {
      [key: string]: any
    }
  }
  // Category-specific fields
  categoryDetails?: {
    // Office Buildings
    classRating?: "A" | "B" | "C"
    occupancyRate?: number
    majorTenants?: string[]
    // Multifamily
    unitMix?: { [key: string]: number }
    rentStabilized?: number
    // Mixed-Use
    retailSF?: number
    officeSF?: number
    residentialUnits?: number
    // Development Sites
    buildableArea?: number
    maxFAR?: number
    proposedUse?: string
    // Industrial
    ceilingHeight?: number
    loadingDocks?: number
    // Retail Condos
    frontage?: number
    groundFloor?: boolean
    // Ground Leases
    leaseExpiration?: string
    groundRent?: number
  }
}

// Import existing Manhattan office-to-residential data
import { propertyData as manhattanConversions } from "./property-data"

// Convert existing data to new format
const enhancedManhattanConversions: EnhancedProperty[] = manhattanConversions.map((prop) => ({
  ...prop,
  borough: "Manhattan" as const,
  propertyCategory: "Office-to-Residential Conversion" as const,
  zoning: "Mixed Residential/Commercial",
  categoryDetails: {
    classRating: "B" as const,
    occupancyRate: 85,
    proposedUse: "Residential Conversion",
  },
}))

export const enhancedPropertyData: EnhancedProperty[] = [
  // Preserve all existing Manhattan office-to-residential conversions
  ...enhancedManhattanConversions,

  // MANHATTAN - Office Buildings
  {
    address: "1 World Trade Center",
    borough: "Manhattan",
    submarket: "Financial District",
    propertyCategory: "Office Buildings",
    units: null,
    gsf: 3500000,
    type: "Class A Office",
    status: "Available",
    notes: "Premier office tower with harbor views",
    eligible: true,
    pressLink: "https://1wtc.com",
    lat: 40.7127,
    lng: -74.0134,
    yearBuilt: 2014,
    askingPrice: 2500000000,
    pricePerSF: 714,
    capRate: 4.2,
    noi: 105000000,
    zoning: "Commercial",
    categoryDetails: {
      classRating: "A",
      occupancyRate: 92,
      majorTenants: ["Conde Nast", "KKR", "Moody's"],
    },
  },
  {
    address: "432 Park Avenue",
    borough: "Manhattan",
    submarket: "Midtown East",
    propertyCategory: "Office Buildings",
    units: null,
    gsf: 2800000,
    type: "Class A Office",
    status: "Available",
    notes: "Luxury office tower",
    eligible: true,
    pressLink: "",
    lat: 40.7614,
    lng: -73.9776,
    yearBuilt: 2015,
    askingPrice: 1800000000,
    pricePerSF: 643,
    capRate: 3.8,
    noi: 68400000,
    zoning: "Commercial",
    categoryDetails: {
      classRating: "A",
      occupancyRate: 88,
      majorTenants: ["Private Equity Firms", "Hedge Funds"],
    },
  },

  // MANHATTAN - Multifamily Apartment Buildings
  {
    address: "15 Central Park West",
    borough: "Manhattan",
    submarket: "Upper West Side",
    propertyCategory: "Multifamily Apartment Buildings",
    units: 202,
    gsf: 1200000,
    type: "Luxury Condo",
    status: "Available",
    notes: "Ultra-luxury residential building",
    eligible: true,
    pressLink: "",
    lat: 40.7677,
    lng: -73.9807,
    yearBuilt: 2008,
    askingPrice: 850000000,
    pricePerSF: 708,
    capRate: 2.8,
    noi: 23800000,
    zoning: "Residential",
    categoryDetails: {
      unitMix: { "1BR": 45, "2BR": 78, "3BR": 56, "4BR+": 23 },
      rentStabilized: 0,
    },
  },
  {
    address: "220 Central Park South",
    borough: "Manhattan",
    submarket: "Midtown West",
    propertyCategory: "Multifamily Apartment Buildings",
    units: 118,
    gsf: 950000,
    type: "Luxury Condo",
    status: "Available",
    notes: "Billionaire's Row luxury tower",
    eligible: true,
    pressLink: "",
    lat: 40.7661,
    lng: -73.9807,
    yearBuilt: 2019,
    askingPrice: 1200000000,
    pricePerSF: 1263,
    capRate: 2.2,
    noi: 26400000,
    zoning: "Residential",
    categoryDetails: {
      unitMix: { "2BR": 28, "3BR": 45, "4BR+": 45 },
      rentStabilized: 0,
    },
  },

  // MANHATTAN - Mixed-Use Buildings
  {
    address: "Time Warner Center",
    borough: "Manhattan",
    submarket: "Midtown West",
    propertyCategory: "Mixed-Use Buildings",
    units: 198,
    gsf: 2800000,
    type: "Mixed-Use",
    status: "Available",
    notes: "Iconic mixed-use development",
    eligible: true,
    pressLink: "",
    lat: 40.7681,
    lng: -73.9819,
    yearBuilt: 2003,
    askingPrice: 2200000000,
    pricePerSF: 786,
    capRate: 4.5,
    noi: 99000000,
    zoning: "Mixed-Use",
    categoryDetails: {
      retailSF: 750000,
      officeSF: 1200000,
      residentialUnits: 198,
    },
  },

  // MANHATTAN - Development Sites
  {
    address: "250 Water Street",
    borough: "Manhattan",
    submarket: "Financial District",
    propertyCategory: "Development Sites",
    units: null,
    gsf: null,
    type: "Development Site",
    status: "Available",
    notes: "Prime development opportunity",
    eligible: true,
    pressLink: "",
    lat: 40.7067,
    lng: -74.0033,
    askingPrice: 450000000,
    zoning: "Mixed Residential/Commercial",
    categoryDetails: {
      buildableArea: 1500000,
      maxFAR: 18.0,
      proposedUse: "Mixed-Use Tower",
    },
  },

  // MANHATTAN - Industrial
  {
    address: "540 W 26th Street",
    borough: "Manhattan",
    submarket: "Chelsea",
    propertyCategory: "Industrial",
    units: null,
    gsf: 450000,
    type: "Industrial/Warehouse",
    status: "Available",
    notes: "Last-mile distribution facility",
    eligible: true,
    pressLink: "",
    lat: 40.7505,
    lng: -74.0065,
    yearBuilt: 1985,
    askingPrice: 180000000,
    pricePerSF: 400,
    capRate: 5.2,
    noi: 9360000,
    zoning: "Manufacturing",
    categoryDetails: {
      ceilingHeight: 24,
      loadingDocks: 12,
    },
  },

  // MANHATTAN - Retail Condos
  {
    address: "724 Fifth Avenue",
    borough: "Manhattan",
    submarket: "Midtown East",
    propertyCategory: "Retail Condos",
    units: null,
    gsf: 15000,
    type: "Retail Condo",
    status: "Available",
    notes: "Prime Fifth Avenue retail",
    eligible: true,
    pressLink: "",
    lat: 40.7614,
    lng: -73.9776,
    yearBuilt: 1920,
    askingPrice: 75000000,
    pricePerSF: 5000,
    capRate: 3.5,
    noi: 2625000,
    zoning: "Commercial",
    categoryDetails: {
      frontage: 50,
      groundFloor: true,
    },
  },

  // MANHATTAN - Ground Leases
  {
    address: "11 Madison Avenue",
    borough: "Manhattan",
    submarket: "Flatiron",
    propertyCategory: "Ground Leases",
    units: null,
    gsf: 1200000,
    type: "Ground Lease",
    status: "Available",
    notes: "Historic office building ground lease",
    eligible: true,
    pressLink: "",
    lat: 40.742,
    lng: -73.9876,
    yearBuilt: 1909,
    askingPrice: 350000000,
    pricePerSF: 292,
    zoning: "Commercial",
    categoryDetails: {
      leaseExpiration: "2069-12-31",
      groundRent: 12000000,
    },
  },

  // BROOKLYN - Office Buildings
  {
    address: "1 MetroTech Center",
    borough: "Brooklyn",
    submarket: "Downtown Brooklyn",
    propertyCategory: "Office Buildings",
    units: null,
    gsf: 1800000,
    type: "Class A Office",
    status: "Available",
    notes: "Premier Brooklyn office tower",
    eligible: true,
    pressLink: "",
    lat: 40.6943,
    lng: -73.9857,
    yearBuilt: 1992,
    askingPrice: 650000000,
    pricePerSF: 361,
    capRate: 5.8,
    noi: 37700000,
    zoning: "Commercial",
    categoryDetails: {
      classRating: "A",
      occupancyRate: 94,
      majorTenants: ["JPMorgan Chase", "NYU", "Polytechnic Institute"],
    },
  },

  // BROOKLYN - Multifamily Apartment Buildings
  {
    address: "1 Brooklyn Bridge Park",
    borough: "Brooklyn",
    submarket: "Brooklyn Heights",
    propertyCategory: "Multifamily Apartment Buildings",
    units: 438,
    gsf: 1100000,
    type: "Luxury Rental",
    status: "Available",
    notes: "Waterfront luxury rental building",
    eligible: true,
    pressLink: "",
    lat: 40.7022,
    lng: -73.9969,
    yearBuilt: 2018,
    askingPrice: 520000000,
    pricePerSF: 473,
    capRate: 4.2,
    noi: 21840000,
    zoning: "Residential",
    categoryDetails: {
      unitMix: { Studio: 87, "1BR": 175, "2BR": 131, "3BR": 45 },
      rentStabilized: 88,
    },
  },

  // BROOKLYN - Mixed-Use Buildings
  {
    address: "300 Ashland Place",
    borough: "Brooklyn",
    submarket: "Fort Greene",
    propertyCategory: "Mixed-Use Buildings",
    units: 755,
    gsf: 1400000,
    type: "Mixed-Use",
    status: "Available",
    notes: "Major mixed-use development",
    eligible: true,
    pressLink: "",
    lat: 40.6886,
    lng: -73.9779,
    yearBuilt: 2016,
    askingPrice: 680000000,
    pricePerSF: 486,
    capRate: 4.8,
    noi: 32640000,
    zoning: "Mixed-Use",
    categoryDetails: {
      retailSF: 150000,
      officeSF: 200000,
      residentialUnits: 755,
    },
  },

  // BROOKLYN - Development Sites
  {
    address: "80 Flatbush Avenue",
    borough: "Brooklyn",
    submarket: "Downtown Brooklyn",
    propertyCategory: "Development Sites",
    units: null,
    gsf: null,
    type: "Development Site",
    status: "Available",
    notes: "Major development opportunity",
    eligible: true,
    pressLink: "",
    lat: 40.6892,
    lng: -73.9814,
    askingPrice: 280000000,
    zoning: "Mixed Residential/Commercial",
    categoryDetails: {
      buildableArea: 1200000,
      maxFAR: 12.0,
      proposedUse: "Mixed-Use Tower",
    },
  },

  // BROOKLYN - Industrial
  {
    address: "25-30 44th Drive",
    borough: "Brooklyn",
    submarket: "Sunset Park",
    propertyCategory: "Industrial",
    units: null,
    gsf: 850000,
    type: "Industrial/Warehouse",
    status: "Available",
    notes: "Large industrial complex",
    eligible: true,
    pressLink: "",
    lat: 40.6562,
    lng: -74.0154,
    yearBuilt: 1960,
    askingPrice: 255000000,
    pricePerSF: 300,
    capRate: 6.2,
    noi: 15810000,
    zoning: "Manufacturing",
    categoryDetails: {
      ceilingHeight: 28,
      loadingDocks: 24,
    },
  },

  // QUEENS - Office Buildings
  {
    address: "23-01 44th Drive",
    borough: "Queens",
    submarket: "Long Island City",
    propertyCategory: "Office Buildings",
    units: null,
    gsf: 1200000,
    type: "Class A Office",
    status: "Available",
    notes: "Modern office tower in LIC",
    eligible: true,
    pressLink: "",
    lat: 40.7505,
    lng: -73.9426,
    yearBuilt: 2019,
    askingPrice: 480000000,
    pricePerSF: 400,
    capRate: 5.5,
    noi: 26400000,
    zoning: "Commercial",
    categoryDetails: {
      classRating: "A",
      occupancyRate: 89,
      majorTenants: ["WeWork", "Tech Startups", "Media Companies"],
    },
  },

  // QUEENS - Multifamily Apartment Buildings
  {
    address: "4545 Center Boulevard",
    borough: "Queens",
    submarket: "Long Island City",
    propertyCategory: "Multifamily Apartment Buildings",
    units: 709,
    gsf: 950000,
    type: "Luxury Rental",
    status: "Available",
    notes: "Waterfront luxury rental",
    eligible: true,
    pressLink: "",
    lat: 40.7434,
    lng: -73.9473,
    yearBuilt: 2017,
    askingPrice: 420000000,
    pricePerSF: 442,
    capRate: 4.5,
    noi: 18900000,
    zoning: "Residential",
    categoryDetails: {
      unitMix: { Studio: 142, "1BR": 284, "2BR": 213, "3BR": 70 },
      rentStabilized: 142,
    },
  },

  // BRONX - Office Buildings
  {
    address: "1 Fordham Plaza",
    borough: "Bronx",
    submarket: "Fordham",
    propertyCategory: "Office Buildings",
    units: null,
    gsf: 650000,
    type: "Class B Office",
    status: "Available",
    notes: "Major Bronx office building",
    eligible: true,
    pressLink: "",
    lat: 40.8623,
    lng: -73.9003,
    yearBuilt: 1985,
    askingPrice: 195000000,
    pricePerSF: 300,
    capRate: 7.2,
    noi: 14040000,
    zoning: "Commercial",
    categoryDetails: {
      classRating: "B",
      occupancyRate: 91,
      majorTenants: ["Government Agencies", "Non-Profits", "Healthcare"],
    },
  },

  // BRONX - Multifamily Apartment Buildings
  {
    address: "101 Lincoln Avenue",
    borough: "Bronx",
    submarket: "South Bronx",
    propertyCategory: "Multifamily Apartment Buildings",
    units: 234,
    gsf: 285000,
    type: "Affordable Housing",
    status: "Available",
    notes: "Affordable housing complex",
    eligible: true,
    pressLink: "",
    lat: 40.8176,
    lng: -73.9182,
    yearBuilt: 2020,
    askingPrice: 85500000,
    pricePerSF: 300,
    capRate: 5.8,
    noi: 4959000,
    zoning: "Residential",
    categoryDetails: {
      unitMix: { "1BR": 94, "2BR": 94, "3BR": 46 },
      rentStabilized: 234,
    },
  },

  // STATEN ISLAND - Office Buildings
  {
    address: "1 Richmond Avenue",
    borough: "Staten Island",
    submarket: "St. George",
    propertyCategory: "Office Buildings",
    units: null,
    gsf: 450000,
    type: "Class B Office",
    status: "Available",
    notes: "Staten Island office building",
    eligible: true,
    pressLink: "",
    lat: 40.6436,
    lng: -74.0736,
    yearBuilt: 1990,
    askingPrice: 112500000,
    pricePerSF: 250,
    capRate: 8.0,
    noi: 9000000,
    zoning: "Commercial",
    categoryDetails: {
      classRating: "B",
      occupancyRate: 85,
      majorTenants: ["Local Government", "Healthcare", "Professional Services"],
    },
  },

  // STATEN ISLAND - Industrial
  {
    address: "2500 Richmond Terrace",
    borough: "Staten Island",
    submarket: "Mariners Harbor",
    propertyCategory: "Industrial",
    units: null,
    gsf: 1200000,
    type: "Industrial/Warehouse",
    status: "Available",
    notes: "Large industrial facility",
    eligible: true,
    pressLink: "",
    lat: 40.6436,
    lng: -74.1581,
    yearBuilt: 1975,
    askingPrice: 240000000,
    pricePerSF: 200,
    capRate: 7.5,
    noi: 18000000,
    zoning: "Manufacturing",
    categoryDetails: {
      ceilingHeight: 32,
      loadingDocks: 36,
    },
  },
]

export const enhancedPropertyStats = {
  totalProperties: enhancedPropertyData.length,
  totalUnits: enhancedPropertyData.reduce((sum, prop) => sum + (prop.units || 0), 0),
  totalGSF: enhancedPropertyData.reduce((sum, prop) => sum + (prop.gsf || 0), 0),
  totalValue: enhancedPropertyData.reduce((sum, prop) => sum + (prop.askingPrice || 0), 0),

  // By Borough
  byBorough: {
    Manhattan: enhancedPropertyData.filter((p) => p.borough === "Manhattan").length,
    Brooklyn: enhancedPropertyData.filter((p) => p.borough === "Brooklyn").length,
    Queens: enhancedPropertyData.filter((p) => p.borough === "Queens").length,
    Bronx: enhancedPropertyData.filter((p) => p.borough === "Bronx").length,
    "Staten Island": enhancedPropertyData.filter((p) => p.borough === "Staten Island").length,
  },

  // By Category
  byCategory: {
    "Office Buildings": enhancedPropertyData.filter((p) => p.propertyCategory === "Office Buildings").length,
    "Multifamily Apartment Buildings": enhancedPropertyData.filter(
      (p) => p.propertyCategory === "Multifamily Apartment Buildings",
    ).length,
    "Mixed-Use Buildings": enhancedPropertyData.filter((p) => p.propertyCategory === "Mixed-Use Buildings").length,
    "Development Sites": enhancedPropertyData.filter((p) => p.propertyCategory === "Development Sites").length,
    Industrial: enhancedPropertyData.filter((p) => p.propertyCategory === "Industrial").length,
    "Retail Condos": enhancedPropertyData.filter((p) => p.propertyCategory === "Retail Condos").length,
    "Ground Leases": enhancedPropertyData.filter((p) => p.propertyCategory === "Ground Leases").length,
    "Office-to-Residential Conversion": enhancedPropertyData.filter(
      (p) => p.propertyCategory === "Office-to-Residential Conversion",
    ).length,
  },

  // By Status
  byStatus: {
    Available: enhancedPropertyData.filter((p) => p.status === "Available").length,
    "Under Contract": enhancedPropertyData.filter((p) => p.status === "Under Contract").length,
    Sold: enhancedPropertyData.filter((p) => p.status === "Sold").length,
    Completed: enhancedPropertyData.filter((p) => p.status === "Completed").length,
    Underway: enhancedPropertyData.filter((p) => p.status === "Underway").length,
    Projected: enhancedPropertyData.filter((p) => p.status === "Projected").length,
  },
}

console.log("Enhanced Property Dataset Verification:", enhancedPropertyStats)
