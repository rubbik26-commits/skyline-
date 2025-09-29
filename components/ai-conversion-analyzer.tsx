"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Lightbulb,
  MapPin,
  Clock,
  Zap,
  Star,
} from "lucide-react"

interface ConversionScore {
  overall: number
  location: number
  building: number
  financial: number
  market: number
  risk: number
}

interface PropertyAnalysis {
  property: any
  conversionScore: ConversionScore
  aiAnalysis: string
  recommendations: string[]
  financialProjections: {
    acquisitionCost: number
    conversionCost: number
    totalInvestment: number
    estimatedUnits: number
    projectedAnnualRent: number
    projectedCapRate: number
    breakEvenMonths: number
    fiveYearROI: number
  }
}

interface AnalysisResponse {
  success: boolean
  type: string
  marketAnalysis?: string
  topOpportunities?: PropertyAnalysis[]
  marketMetrics?: {
    totalProperties: number
    avgConversionScore: number
    topSubmarkets: string[]
  }
  propertiesAnalyzed: number
  timestamp: string
}

interface AIConversionAnalyzerProps {
  properties: any[]
  onAnalysisComplete?: (analysis: AnalysisResponse) => void
}

export function AIConversionAnalyzer({ properties, onAnalysisComplete }: AIConversionAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState("comprehensive")
  const [filters, setFilters] = useState({
    borough: "all",
    priceRange: [0, 100000000] as [number, number],
    propertyType: "all",
  })
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const analysisTypes = [
    { value: "comprehensive", label: "Comprehensive Analysis", icon: Brain },
    { value: "market", label: "Market Trends", icon: TrendingUp },
    { value: "property", label: "Property Scoring", icon: Building2 },
    { value: "financial", label: "Financial Analysis", icon: DollarSign },
  ]

  const runAnalysis = async () => {
    if (properties.length === 0) {
      setError("No properties available for analysis")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)

      const response = await fetch("/api/ai-conversion-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          properties,
          analysisType,
          filters,
        }),
      })

      const result: AnalysisResponse = await response.json()

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!result.success) {
        throw new Error(result.error || "Analysis failed")
      }

      setAnalysis(result)
      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }

      // Reset progress after delay
      setTimeout(() => setAnalysisProgress(0), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed"
      setError(errorMessage)
      console.error("AI Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    // Auto-run comprehensive analysis on component mount
    if (properties.length > 0) {
      runAnalysis()
    }
  }, [properties.length])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 65) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Excellent" }
    if (score >= 65) return { variant: "secondary" as const, label: "Good" }
    return { variant: "destructive" as const, label: "Caution" }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <Brain className="h-5 w-5" />
            AI-Powered Manhattan Conversion Analyzer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced AI analysis of office-to-residential conversion opportunities in Manhattan
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Type:</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="border-purple-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Borough Filter:</label>
              <Select value={filters.borough} onValueChange={(value) => setFilters({ ...filters, borough: value })}>
                <SelectTrigger className="border-purple-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boroughs</SelectItem>
                  <SelectItem value="Manhattan">Manhattan</SelectItem>
                  <SelectItem value="Brooklyn">Brooklyn</SelectItem>
                  <SelectItem value="Queens">Queens</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Property Type:</label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
              >
                <SelectTrigger className="border-purple-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Office Buildings">Office Buildings</SelectItem>
                  <SelectItem value="Mixed-Use Buildings">Mixed-Use</SelectItem>
                  <SelectItem value="Industrial Buildings">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || properties.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
          </Button>

          {/* Analysis Progress */}
          {analysisProgress > 0 && analysisProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600 animate-pulse" />
                <span className="text-sm text-purple-700">AI analyzing conversion opportunities...</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Top Opportunities</TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Market Metrics */}
            {analysis.marketMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Properties Analyzed</p>
                        <p className="text-2xl font-bold text-green-600">{analysis.propertiesAnalyzed}</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Conversion Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(analysis.marketMetrics.avgConversionScore)}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Top Submarkets</p>
                        <p className="text-lg font-bold text-purple-600">
                          {analysis.marketMetrics.topSubmarkets.length}
                        </p>
                      </div>
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analysis Summary */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-600">
                  <CheckCircle className="h-5 w-5" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.topOpportunities?.filter((op) => op.conversionScore.overall >= 80).length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Excellent Opportunities</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysis.topOpportunities?.filter(
                        (op) => op.conversionScore.overall >= 65 && op.conversionScore.overall < 80,
                      ).length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Good Opportunities</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.topOpportunities?.reduce(
                        (sum, op) => sum + op.financialProjections.estimatedUnits,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Units Potential</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis.topOpportunities
                        ? Math.round(
                            analysis.topOpportunities.reduce(
                              (sum, op) => sum + op.financialProjections.projectedCapRate,
                              0,
                            ) / analysis.topOpportunities.length,
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Projected Cap Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            {analysis.topOpportunities && analysis.topOpportunities.length > 0 ? (
              <div className="space-y-4">
                {analysis.topOpportunities.map((opportunity, index) => {
                  const scoreBadge = getScoreBadge(opportunity.conversionScore.overall)
                  return (
                    <Card key={index} className="border-blue-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-blue-600">
                              {opportunity.property.address || `Property ${index + 1}`}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {opportunity.property.submarket} • {opportunity.property.propertyCategory}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
                            <div className="text-right">
                              <div
                                className={`text-2xl font-bold ${getScoreColor(opportunity.conversionScore.overall)}`}
                              >
                                {opportunity.conversionScore.overall}
                              </div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(opportunity.conversionScore.location)}`}>
                              {opportunity.conversionScore.location}
                            </div>
                            <div className="text-xs text-muted-foreground">Location</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(opportunity.conversionScore.building)}`}>
                              {opportunity.conversionScore.building}
                            </div>
                            <div className="text-xs text-muted-foreground">Building</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-lg font-bold ${getScoreColor(opportunity.conversionScore.financial)}`}
                            >
                              {opportunity.conversionScore.financial}
                            </div>
                            <div className="text-xs text-muted-foreground">Financial</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(opportunity.conversionScore.market)}`}>
                              {opportunity.conversionScore.market}
                            </div>
                            <div className="text-xs text-muted-foreground">Market</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(opportunity.conversionScore.risk)}`}>
                              {opportunity.conversionScore.risk}
                            </div>
                            <div className="text-xs text-muted-foreground">Risk</div>
                          </div>
                        </div>

                        {/* Financial Projections */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Total Investment</div>
                            <div className="text-lg font-bold">
                              ${(opportunity.financialProjections.totalInvestment / 1000000).toFixed(1)}M
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Est. Units</div>
                            <div className="text-lg font-bold">{opportunity.financialProjections.estimatedUnits}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Projected Cap Rate</div>
                            <div className="text-lg font-bold text-green-600">
                              {opportunity.financialProjections.projectedCapRate.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">5-Year ROI</div>
                            <div className="text-lg font-bold text-purple-600">
                              {opportunity.financialProjections.fiveYearROI.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {opportunity.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              AI Recommendations
                            </h4>
                            <div className="space-y-1">
                              {opportunity.recommendations.map((rec, recIndex) => (
                                <div
                                  key={recIndex}
                                  className="text-sm p-2 bg-amber-50 rounded border-l-2 border-amber-400"
                                >
                                  {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No opportunities analyzed yet. Run an analysis to see results.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            {analysis.marketAnalysis ? (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    AI Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{analysis.marketAnalysis}</div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    Market analysis not available. Try running a market or comprehensive analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Star className="h-5 w-5" />
                  Key AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2">Market Opportunity</h4>
                    <p className="text-sm text-blue-700">
                      Manhattan's office-to-residential conversion market shows strong fundamentals with{" "}
                      {analysis.propertiesAnalyzed} properties analyzed. Current market conditions favor selective
                      conversions in prime submarkets.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-800 mb-2">Investment Strategy</h4>
                    <p className="text-sm text-green-700">
                      Focus on pre-war buildings in Midtown South and Financial District for optimal conversion
                      potential. Target properties with existing residential zoning or favorable mixed-use designations.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <h4 className="font-semibold text-purple-800 mb-2">Financial Outlook</h4>
                    <p className="text-sm text-purple-700">
                      Average projected cap rates of{" "}
                      {analysis.topOpportunities
                        ? Math.round(
                            analysis.topOpportunities.reduce(
                              (sum, op) => sum + op.financialProjections.projectedCapRate,
                              0,
                            ) / analysis.topOpportunities.length,
                          )
                        : "N/A"}
                      % indicate strong return potential. Consider 18-24 month conversion timelines for financial
                      planning.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <h4 className="font-semibold text-amber-800 mb-2">Risk Considerations</h4>
                    <p className="text-sm text-amber-700">
                      Monitor zoning compliance costs and construction timeline risks. Market saturation in premium
                      areas may impact future returns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Metadata */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Analysis completed: {new Date(analysis.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Powered by GPT-4o-mini
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
