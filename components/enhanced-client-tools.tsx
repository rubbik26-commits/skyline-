"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Building2,
  Users,
  PieChart,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Property {
  address?: string
  submarket?: string
  units?: number
  gsf?: number
  status?: string
  type?: string
}

interface EnhancedClientToolsProps {
  properties: Property[]
  className?: string
}

export function EnhancedClientTools({ properties, className }: EnhancedClientToolsProps) {
  const [selectedTool, setSelectedTool] = useState("calculator")
  const [calculatorInputs, setCalculatorInputs] = useState({
    acquisitionPrice: 15000000,
    conversionCost: 8000000,
    units: 45,
    avgRent: 4500,
    occupancyRate: 95,
    expenses: 35,
  })

  // Calculate real-time metrics
  const totalInvestment = calculatorInputs.acquisitionPrice + calculatorInputs.conversionCost
  const annualRevenue = calculatorInputs.units * calculatorInputs.avgRent * 12 * (calculatorInputs.occupancyRate / 100)
  const annualExpenses = annualRevenue * (calculatorInputs.expenses / 100)
  const netOperatingIncome = annualRevenue - annualExpenses
  const capRate = (netOperatingIncome / totalInvestment) * 100
  const cashOnCashReturn = ((netOperatingIncome - totalInvestment * 0.05) / (totalInvestment * 0.25)) * 100

  // Market insights
  const marketInsights = {
    averageConversionTime: "18-24 months",
    successRate: "78%",
    averageROI: "22.3%",
    marketTrend: "Strong Growth",
    riskLevel: "Moderate",
    competitionLevel: "High",
  }

  // Property scoring algorithm
  const calculatePropertyScore = (property: Property) => {
    let score = 50 // Base score

    // Location scoring
    if (property.submarket?.includes("Midtown")) score += 15
    if (property.submarket?.includes("Financial")) score += 20
    if (property.submarket?.includes("Tribeca") || property.submarket?.includes("SoHo")) score += 25

    // Size scoring
    if (property.units && property.units > 50) score += 10
    if (property.gsf && property.gsf > 100000) score += 10

    // Status scoring
    if (property.status === "Completed") score += 20
    if (property.status === "Underway") score += 15
    if (property.status === "Projected") score += 10

    return Math.min(100, Math.max(0, score))
  }

  const tools = [
    {
      id: "calculator",
      name: "ROI Calculator",
      icon: Calculator,
      description: "Calculate investment returns and cash flow projections",
    },
    {
      id: "market",
      name: "Market Analysis",
      icon: TrendingUp,
      description: "Real-time market trends and competitive analysis",
    },
    {
      id: "scoring",
      name: "Property Scoring",
      icon: Target,
      description: "AI-powered property evaluation and ranking system",
    },
    {
      id: "reports",
      name: "Investment Reports",
      icon: FileText,
      description: "Generate comprehensive investment analysis reports",
    },
  ]

  return (
    <Card className={cn("border-blue-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Zap className="h-5 w-5" />
          Enhanced Client Tools
          <Badge variant="secondary" className="ml-auto">
            Professional Suite
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTool} onValueChange={setSelectedTool}>
          <TabsList className="grid w-full grid-cols-4">
            {tools.map((tool) => (
              <TabsTrigger key={tool.id} value={tool.id} className="text-xs">
                <tool.icon className="h-3 w-3 mr-1" />
                {tool.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ROI Calculator */}
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600">Investment Parameters</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Acquisition Price</label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={calculatorInputs.acquisitionPrice}
                        onChange={(e) =>
                          setCalculatorInputs((prev) => ({
                            ...prev,
                            acquisitionPrice: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Conversion Cost</label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={calculatorInputs.conversionCost}
                        onChange={(e) =>
                          setCalculatorInputs((prev) => ({
                            ...prev,
                            conversionCost: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Number of Units</label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={calculatorInputs.units}
                        onChange={(e) =>
                          setCalculatorInputs((prev) => ({
                            ...prev,
                            units: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Average Monthly Rent</label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={calculatorInputs.avgRent}
                        onChange={(e) =>
                          setCalculatorInputs((prev) => ({
                            ...prev,
                            avgRent: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600">Financial Projections</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Total Investment</span>
                    <span className="text-lg font-bold text-blue-600">${totalInvestment.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Annual NOI</span>
                    <span className="text-lg font-bold text-green-600">${netOperatingIncome.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Cap Rate</span>
                    <span className="text-lg font-bold text-purple-600">{capRate.toFixed(2)}%</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Cash-on-Cash Return</span>
                    <span className="text-lg font-bold text-orange-600">{cashOnCashReturn.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Investment Quality</span>
                    <span className="font-medium">{capRate > 6 ? "Excellent" : capRate > 4 ? "Good" : "Fair"}</span>
                  </div>
                  <Progress value={Math.min(100, capRate * 15)} className="h-2" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Market Analysis */}
          <TabsContent value="market" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Market Trend</span>
                  </div>
                  <div className="text-2xl font-bold">{marketInsights.marketTrend}</div>
                  <div className="text-sm text-gray-600">Conversion activity up 23%</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{marketInsights.successRate}</div>
                  <div className="text-sm text-gray-600">Of completed projects</div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-600">Average ROI</span>
                  </div>
                  <div className="text-2xl font-bold">{marketInsights.averageROI}</div>
                  <div className="text-sm text-gray-600">12-month average</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Conversion Time</span>
                    <Badge variant="outline">{marketInsights.averageConversionTime}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Permit Processing</span>
                    <Badge variant="outline">4-6 months</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Construction Phase</span>
                    <Badge variant="outline">12-18 months</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lease-up Period</span>
                    <Badge variant="outline">3-6 months</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Risk</span>
                    <Badge variant="secondary">{marketInsights.riskLevel}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Competition Level</span>
                    <Badge variant="destructive">{marketInsights.competitionLevel}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Regulatory Risk</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Construction Risk</span>
                    <Badge variant="secondary">Moderate</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Property Scoring */}
          <TabsContent value="scoring" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-600">AI Property Evaluation</h3>
              <div className="text-sm text-gray-600">
                Properties are scored based on location, size, status, and market conditions
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {properties.slice(0, 10).map((property, index) => {
                const score = calculatePropertyScore(property)
                const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-blue-600" : "text-orange-600"
                const scoreBg = score >= 80 ? "bg-green-50" : score >= 60 ? "bg-blue-50" : "bg-orange-50"

                return (
                  <Card
                    key={index}
                    className={cn(
                      "border-l-4",
                      score >= 80 ? "border-l-green-500" : score >= 60 ? "border-l-blue-500" : "border-l-orange-500",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{property.address}</div>
                          <div className="text-xs text-gray-600">{property.submarket}</div>
                        </div>
                        <div className={cn("text-right", scoreBg, "px-2 py-1 rounded")}>
                          <div className={cn("text-lg font-bold", scoreColor)}>{score}</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Units:</span>
                          <span className="ml-1 font-medium">{property.units || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">GSF:</span>
                          <span className="ml-1 font-medium">{property.gsf?.toLocaleString() || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="ml-1 font-medium">{property.status}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <Progress value={score} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Investment Reports */}
          <TabsContent value="reports" className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Professional Investment Reports</h3>
              <p className="text-gray-600 mb-6">
                Generate comprehensive analysis reports for your investment decisions
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PieChart className="h-4 w-4 mr-2" />
                  Market Summary
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Property Analysis
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 bg-transparent">
                  <Calculator className="h-4 w-4 mr-2" />
                  Financial Model
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Risk Assessment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
