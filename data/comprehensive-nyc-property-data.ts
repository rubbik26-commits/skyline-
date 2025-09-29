export interface ComprehensiveProperty {
  id: string
  address: string
  borough: "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island"
  propertyCategory:
    | "Office Buildings"
    | "Multifamily Apartment Buildings"
    | "Mixed-Use Buildings"
    | "Development Sites"
    | "Industrial"
    | "Retail Condos"
    | "Ground Leases"
    | "Office-to-Residential Conversion"
  submarket: string
  units?: number
  gsf?: number
  askingPrice?: number
  pricePerSF?: number
  capRate?: number
  noi?: number
  status: "Available" | "Under Contract" | "Sold" | "Underway" | "Completed" | "Projected"
  zoning: string
  yearBuilt: number
  notes: string
  eligible: boolean
  pressLink?: string
  lat: number
  lng: number
  lastUpdated: Date
  categoryDetails: {
    // Office Buildings
    classRating?: "A" | "B" | "C"
    occupancyRate?: number
    majorTenants?: string[]

    // Multifamily
    rentStabilized?: number
    marketRate?: number
    avgRent?: number

    // Mixed-Use
    retailSF?: number
    officeSF?: number
    residentialUnits?: number

    // Development Sites
    buildableGSF?: number
    zoningFAR?: number
    airRights?: number

    // Industrial
    ceilingHeight?: number
    loadingDocks?: number
    railAccess?: boolean

    // Retail Condos
    frontage?: number
    storefront?: boolean
    basement?: boolean

    // Ground Leases
    leaseExpiration?: Date
    groundRent?: number
    escalations?: string
  }
  aiInsights?: {
    riskScore: number
    potentialROI: number
    marketTrend: "bullish" | "bearish" | "neutral"
    confidence: number
    investmentGrade: "A" | "B" | "C" | "D"
  }
}

// Comprehensive NYC Property Dataset - All Boroughs & Categories
export const comprehensiveNYCPropertyData: ComprehensiveProperty[] = [
  // MANHATTAN - Office Buildings
  {
    id: "MAN-OFF-001",
    address: "350 Fifth Avenue",
    borough: "Manhattan",
    propertyCategory: "Office Buildings",
    submarket: "Midtown South",
    gsf: 1200000,
    askingPrice: 450000000,
    pricePerSF: 375,
    capRate: 4.2,
    noi: 18900000,
    status: "Available",
    zoning: "C6-4",
    yearBuilt: 1931,
    notes: "Empire State Building area, Class A office building",
    eligible: true,
    lat: 40.7484,
    lng: -73.9857,
    lastUpdated: new Date(),
    categoryDetails: {
      classRating: "A",
      occupancyRate: 92,
      majorTenants: ["Tech Corp", "Law Firm LLP", "Financial Services Inc"],
    },
    aiInsights: {
      riskScore: 2.1,
      potentialROI: 8.5,
      marketTrend: "bullish",
      confidence: 87,
      investmentGrade: "A",
    },
  },
  {
    id: "MAN-OFF-002",
    address: "200 Park Avenue",
    borough: "Manhattan",
    propertyCategory: "Office Buildings",
    submarket: "Midtown East",
    gsf: 2100000,
    askingPrice: 850000000,
    pricePerSF: 405,
    capRate: 3.8,
    noi: 32300000,
    status: "Available",
    zoning: "C5-3",
    yearBuilt: 1963,
    notes: "MetLife Building, prime Midtown location",
    eligible: true,
    lat: 40.7527,
    lng: -73.9772,
    lastUpdated: new Date(),
    categoryDetails: {
      classRating: "A",
      occupancyRate: 95,
      majorTenants: ["Investment Bank", "Consulting Group", "Insurance Co"],
    },
    aiInsights: {
      riskScore: 1.8,
      potentialROI: 9.2,
      marketTrend: "bullish",
      confidence: 91,
      investmentGrade: "A",
    },
  },

  // MANHATTAN - Multifamily Apartment Buildings
  {
    id: "MAN-MUL-001",
    address: "145 Central Park West",
    borough: "Manhattan",
    propertyCategory: "Multifamily Apartment Buildings",
    submarket: "Upper West Side",
    units: 180,
    gsf: 350000,
    askingPrice: 125000000,
    pricePerSF: 357,
    capRate: 3.2,
    noi: 4000000,
    status: "Available",
    zoning: "R10A",
    yearBuilt: 1925,
    notes: "Pre-war luxury building facing Central Park",
    eligible: true,
    lat: 40.7749,
    lng: -73.9761,
    lastUpdated: new Date(),
    categoryDetails: {
      rentStabilized: 45,
      marketRate: 135,
      avgRent: 4500,
    },
    aiInsights: {
      riskScore: 2.5,
      potentialROI: 7.8,
      marketTrend: "bullish",
      confidence: 85,
      investmentGrade: "A",
    },
  },

  // MANHATTAN - Mixed-Use Buildings
  {
    id: "MAN-MIX-001",
    address: "125 Greenwich Street",
    borough: "Manhattan",
    propertyCategory: "Mixed-Use Buildings",
    submarket: "Tribeca",
    units: 45,
    gsf: 125000,
    askingPrice: 85000000,
    pricePerSF: 680,
    capRate: 4.1,
    noi: 3485000,
    status: "Available",
    zoning: "C6-2A",
    yearBuilt: 1890,
    notes: "Historic mixed-use with retail and residential",
    eligible: true,
    lat: 40.7092,
    lng: -74.0131,
    lastUpdated: new Date(),
    categoryDetails: {
      retailSF: 15000,
      officeSF: 35000,
      residentialUnits: 45,
    },
    aiInsights: {
      riskScore: 3.2,
      potentialROI: 9.5,
      marketTrend: "bullish",
      confidence: 82,
      investmentGrade: "A",
    },
  },

  // MANHATTAN - Development Sites
  {
    id: "MAN-DEV-001",
    address: "425 Park Avenue South",
    borough: "Manhattan",
    propertyCategory: "Development Sites",
    submarket: "Flatiron",
    gsf: 25000,
    askingPrice: 45000000,
    pricePerSF: 1800,
    status: "Available",
    zoning: "C6-2",
    yearBuilt: 1920,
    notes: "Development opportunity with air rights",
    eligible: true,
    lat: 40.742,
    lng: -73.9876,
    lastUpdated: new Date(),
    categoryDetails: {
      buildableGSF: 185000,
      zoningFAR: 12.0,
      airRights: 160000,
    },
    aiInsights: {
      riskScore: 4.5,
      potentialROI: 15.2,
      marketTrend: "bullish",
      confidence: 78,
      investmentGrade: "B",
    },
  },

  // MANHATTAN - Industrial
  {
    id: "MAN-IND-001",
    address: "525 West 52nd Street",
    borough: "Manhattan",
    propertyCategory: "Industrial",
    submarket: "Hell's Kitchen",
    gsf: 85000,
    askingPrice: 35000000,
    pricePerSF: 412,
    capRate: 5.2,
    noi: 1820000,
    status: "Available",
    zoning: "M1-5",
    yearBuilt: 1955,
    notes: "Industrial building with truck access",
    eligible: true,
    lat: 40.7648,
    lng: -73.9924,
    lastUpdated: new Date(),
    categoryDetails: {
      ceilingHeight: 18,
      loadingDocks: 4,
      railAccess: false,
    },
    aiInsights: {
      riskScore: 3.8,
      potentialROI: 8.9,
      marketTrend: "neutral",
      confidence: 75,
      investmentGrade: "B",
    },
  },

  // MANHATTAN - Retail Condos
  {
    id: "MAN-RET-001",
    address: "725 Fifth Avenue",
    borough: "Manhattan",
    propertyCategory: "Retail Condos",
    submarket: "Midtown East",
    gsf: 8500,
    askingPrice: 25000000,
    pricePerSF: 2941,
    capRate: 3.5,
    noi: 875000,
    status: "Available",
    zoning: "C5-3",
    yearBuilt: 1985,
    notes: "Prime Fifth Avenue retail condo",
    eligible: true,
    lat: 40.7614,
    lng: -73.9776,
    lastUpdated: new Date(),
    categoryDetails: {
      frontage: 45,
      storefront: true,
      basement: true,
    },
    aiInsights: {
      riskScore: 2.8,
      potentialROI: 6.5,
      marketTrend: "neutral",
      confidence: 80,
      investmentGrade: "A",
    },
  },

  // MANHATTAN - Ground Leases
  {
    id: "MAN-GRD-001",
    address: "345 Madison Avenue",
    borough: "Manhattan",
    propertyCategory: "Ground Leases",
    submarket: "Midtown East",
    gsf: 450000,
    askingPrice: 75000000,
    pricePerSF: 167,
    status: "Available",
    zoning: "C5-3",
    yearBuilt: 1960,
    notes: "Ground lease opportunity, 45 years remaining",
    eligible: true,
    lat: 40.7505,
    lng: -73.9799,
    lastUpdated: new Date(),
    categoryDetails: {
      leaseExpiration: new Date("2069-12-31"),
      groundRent: 2500000,
      escalations: "3% every 10 years",
    },
    aiInsights: {
      riskScore: 3.5,
      potentialROI: 11.2,
      marketTrend: "bullish",
      confidence: 73,
      investmentGrade: "B",
    },
  },

  // BROOKLYN - Office Buildings
  {
    id: "BRK-OFF-001",
    address: "1 MetroTech Center",
    borough: "Brooklyn",
    propertyCategory: "Office Buildings",
    submarket: "Downtown Brooklyn",
    gsf: 1800000,
    askingPrice: 285000000,
    pricePerSF: 158,
    capRate: 5.8,
    noi: 16530000,
    status: "Available",
    zoning: "C6-4",
    yearBuilt: 1992,
    notes: "Major downtown Brooklyn office complex",
    eligible: true,
    lat: 40.6943,
    lng: -73.9851,
    lastUpdated: new Date(),
    categoryDetails: {
      classRating: "A",
      occupancyRate: 88,
      majorTenants: ["JPMorgan Chase", "NYC DOE", "Verizon"],
    },
    aiInsights: {
      riskScore: 3.2,
      potentialROI: 9.8,
      marketTrend: "bullish",
      confidence: 84,
      investmentGrade: "A",
    },
  },

  // BROOKLYN - Multifamily Apartment Buildings
  {
    id: "BRK-MUL-001",
    address: "525 Court Street",
    borough: "Brooklyn",
    propertyCategory: "Multifamily Apartment Buildings",
    submarket: "Carroll Gardens",
    units: 85,
    gsf: 125000,
    askingPrice: 42000000,
    pricePerSF: 336,
    capRate: 4.2,
    noi: 1764000,
    status: "Available",
    zoning: "R6B",
    yearBuilt: 1920,
    notes: "Pre-war multifamily in prime Carroll Gardens",
    eligible: true,
    lat: 40.6788,
    lng: -73.9991,
    lastUpdated: new Date(),
    categoryDetails: {
      rentStabilized: 65,
      marketRate: 20,
      avgRent: 2800,
    },
    aiInsights: {
      riskScore: 2.8,
      potentialROI: 8.5,
      marketTrend: "bullish",
      confidence: 86,
      investmentGrade: "A",
    },
  },

  // QUEENS - Office Buildings
  {
    id: "QNS-OFF-001",
    address: "23-01 44th Drive",
    borough: "Queens",
    propertyCategory: "Office Buildings",
    submarket: "Long Island City",
    gsf: 650000,
    askingPrice: 95000000,
    pricePerSF: 146,
    capRate: 6.2,
    noi: 5890000,
    status: "Available",
    zoning: "C4-5",
    yearBuilt: 1985,
    notes: "Modern office building with Manhattan views",
    eligible: true,
    lat: 40.7505,
    lng: -73.9426,
    lastUpdated: new Date(),
    categoryDetails: {
      classRating: "B",
      occupancyRate: 91,
      majorTenants: ["Media Company", "Architecture Firm", "Tech Startup"],
    },
    aiInsights: {
      riskScore: 3.5,
      potentialROI: 10.2,
      marketTrend: "bullish",
      confidence: 82,
      investmentGrade: "B",
    },
  },

  // QUEENS - Industrial
  {
    id: "QNS-IND-001",
    address: "47-40 21st Street",
    borough: "Queens",
    propertyCategory: "Industrial",
    submarket: "Long Island City",
    gsf: 285000,
    askingPrice: 45000000,
    pricePerSF: 158,
    capRate: 6.8,
    noi: 3060000,
    status: "Available",
    zoning: "M1-4",
    yearBuilt: 1965,
    notes: "Large industrial facility with rail access",
    eligible: true,
    lat: 40.7445,
    lng: -73.9385,
    lastUpdated: new Date(),
    categoryDetails: {
      ceilingHeight: 24,
      loadingDocks: 12,
      railAccess: true,
    },
    aiInsights: {
      riskScore: 4.2,
      potentialROI: 11.5,
      marketTrend: "bullish",
      confidence: 79,
      investmentGrade: "B",
    },
  },

  // BRONX - Multifamily Apartment Buildings
  {
    id: "BRX-MUL-001",
    address: "1255 Grand Concourse",
    borough: "Bronx",
    propertyCategory: "Multifamily Apartment Buildings",
    submarket: "Concourse",
    units: 125,
    gsf: 185000,
    askingPrice: 28000000,
    pricePerSF: 151,
    capRate: 5.5,
    noi: 1540000,
    status: "Available",
    zoning: "R7-1",
    yearBuilt: 1935,
    notes: "Art Deco multifamily on Grand Concourse",
    eligible: true,
    lat: 40.8315,
    lng: -73.9265,
    lastUpdated: new Date(),
    categoryDetails: {
      rentStabilized: 95,
      marketRate: 30,
      avgRent: 1850,
    },
    aiInsights: {
      riskScore: 3.8,
      potentialROI: 9.2,
      marketTrend: "bullish",
      confidence: 81,
      investmentGrade: "B",
    },
  },

  // STATEN ISLAND - Mixed-Use Buildings
  {
    id: "SI-MIX-001",
    address: "1255 Richmond Avenue",
    borough: "Staten Island",
    propertyCategory: "Mixed-Use Buildings",
    submarket: "New Springville",
    units: 24,
    gsf: 45000,
    askingPrice: 8500000,
    pricePerSF: 189,
    capRate: 6.8,
    noi: 578000,
    status: "Available",
    zoning: "C3-2",
    yearBuilt: 1995,
    notes: "Mixed-use building near Staten Island Mall",
    eligible: true,
    lat: 40.5795,
    lng: -74.1502,
    lastUpdated: new Date(),
    categoryDetails: {
      retailSF: 8000,
      officeSF: 12000,
      residentialUnits: 24,
    },
    aiInsights: {
      riskScore: 4.5,
      potentialROI: 8.9,
      marketTrend: "neutral",
      confidence: 75,
      investmentGrade: "B",
    },
  },

  // MANHATTAN - Office-to-Residential Conversions (preserving original data)
  {
    id: "MAN-CON-001",
    address: "25 Water St.",
    borough: "Manhattan",
    propertyCategory: "Office-to-Residential Conversion",
    submarket: "Financial District",
    units: 1320,
    gsf: 1044351,
    askingPrice: 285000000,
    pricePerSF: 273,
    capRate: 4.5,
    noi: 12825000,
    status: "Underway",
    zoning: "C6-2",
    yearBuilt: 1970,
    notes: "Largest conversion; press reported.",
    eligible: true,
    pressLink: "https://commercialobserver.com/2023/10/25-water-st-office-to-resi-conversion/",
    lat: 40.7029,
    lng: -74.0106,
    lastUpdated: new Date(),
    categoryDetails: {
      residentialUnits: 1320,
    },
    aiInsights: {
      riskScore: 3.5,
      potentialROI: 12.8,
      marketTrend: "bullish",
      confidence: 88,
      investmentGrade: "A",
    },
  },
  {
    id: "MAN-CON-002",
    address: "85 Broad St.",
    borough: "Manhattan",
    propertyCategory: "Office-to-Residential Conversion",
    submarket: "Financial District",
    units: 1171,
    gsf: 1007569,
    askingPrice: 245000000,
    pricePerSF: 243,
    capRate: 4.8,
    noi: 11760000,
    status: "Projected",
    zoning: "C6-2",
    yearBuilt: 1965,
    notes: "Comptroller eligible.",
    eligible: true,
    pressLink: "https://commercialobserver.com/2024/09/office-to-residential-conversion-85-broad-street/",
    lat: 40.7064,
    lng: -74.0115,
    lastUpdated: new Date(),
    categoryDetails: {
      residentialUnits: 1171,
    },
    aiInsights: {
      riskScore: 3.2,
      potentialROI: 13.5,
      marketTrend: "bullish",
      confidence: 85,
      investmentGrade: "A",
    },
  },
]

// Enhanced analytics and statistics
export const comprehensivePropertyStats = {
  totalProperties: comprehensiveNYCPropertyData.length,
  totalUnits: comprehensiveNYCPropertyData.reduce((sum, prop) => sum + (prop.units || 0), 0),
  totalGSF: comprehensiveNYCPropertyData.reduce((sum, prop) => sum + (prop.gsf || 0), 0),
  totalValue: comprehensiveNYCPropertyData.reduce((sum, prop) => sum + (prop.askingPrice || 0), 0),

  boroughBreakdown: {
    Manhattan: comprehensiveNYCPropertyData.filter((p) => p.borough === "Manhattan").length,
    Brooklyn: comprehensiveNYCPropertyData.filter((p) => p.borough === "Brooklyn").length,
    Queens: comprehensiveNYCPropertyData.filter((p) => p.borough === "Queens").length,
    Bronx: comprehensiveNYCPropertyData.filter((p) => p.borough === "Bronx").length,
    "Staten Island": comprehensiveNYCPropertyData.filter((p) => p.borough === "Staten Island").length,
  },

  categoryBreakdown: {
    "Office Buildings": comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Office Buildings").length,
    "Multifamily Apartment Buildings": comprehensiveNYCPropertyData.filter(
      (p) => p.propertyCategory === "Multifamily Apartment Buildings",
    ).length,
    "Mixed-Use Buildings": comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Mixed-Use Buildings")
      .length,
    "Development Sites": comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Development Sites").length,
    Industrial: comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Industrial").length,
    "Retail Condos": comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Retail Condos").length,
    "Ground Leases": comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Ground Leases").length,
    "Office-to-Residential Conversion": comprehensiveNYCPropertyData.filter(
      (p) => p.propertyCategory === "Office-to-Residential Conversion",
    ).length,
  },

  avgMetrics: {
    pricePerSF:
      comprehensiveNYCPropertyData.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) /
      comprehensiveNYCPropertyData.length,
    capRate:
      comprehensiveNYCPropertyData.reduce((sum, p) => sum + (p.capRate || 0), 0) / comprehensiveNYCPropertyData.length,
    riskScore:
      comprehensiveNYCPropertyData.reduce((sum, p) => sum + (p.aiInsights?.riskScore || 0), 0) /
      comprehensiveNYCPropertyData.length,
    potentialROI:
      comprehensiveNYCPropertyData.reduce((sum, p) => sum + (p.aiInsights?.potentialROI || 0), 0) /
      comprehensiveNYCPropertyData.length,
  },
}

console.log("Comprehensive NYC Property Dataset:", comprehensivePropertyStats)
