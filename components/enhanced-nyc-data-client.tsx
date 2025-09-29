"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  MapPin,
  FileText,
  BarChart3,
  Target,
  Lightbulb,
} from "lucide-react"

interface NYCDataClientProps {
  onDataUpdate?: (data: any) => void
}

interface NYCDataResponse {
  success: boolean
  data: any
  analysis: {
    conversionOpportunities: number
    averageAge: number
    zoningCompatibility: number
    marketActivity: string
    riskFactors: string[]
    recommendations: string[]
  }
  metadata: {
    source: string
    focus: string
    timestamp: string
    recordCount: number
  }
  api_info: {
    endpoints: string[]
    focus: string
    rate_limit: string
    cache_duration: string
  }
}

export function EnhancedNYCDataClient({ onDataUpdate }: NYCDataClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<NYCDataResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedDataType, setSelectedDataType] = useState("all")
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const dataTypeOptions = [
    { value: "all", label: "All Manhattan Data", icon: Database },
    { value: "conversion-permits", label: "Conversion Permits", icon: FileText },
    { value: "commercial-properties", label: "Commercial Properties", icon: Building2 },
    { value: "office-sales", label: "Office Sales", icon: TrendingUp },
    { value: "zoning", label: "Zoning Data", icon: MapPin },
    { value: "violations", label: "HPD Violations", icon: AlertCircle },
  ]

  const fetchNYCData = async (dataType: string = selectedDataType) => {
    setIsLoading(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/nyc-open-data?type=${dataType}`)
      const result: NYCDataResponse = await response.json()

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch NYC data")
      }

      setData(result)

      if (onDataUpdate) {
        onDataUpdate(result)
      }

      // Reset progress after a delay
      setTimeout(() => setAnalysisProgress(0), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch NYC data"
      setError(errorMessage)
      console.error("NYC Data fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const runCustomAnalysis = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/nyc-open-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          filters: { focus: "manhattan-conversions" },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setData((prev) => (prev ? { ...prev, analysis: result.analysis } : null))
      }
    } catch (err) {
      console.error("Analysis error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch data on component mount
    fetchNYCData("all")
  }, [])

  const getMarketActivityColor = (activity: string) => {
    switch (activity) {
      case "HIGH":
        return "text-green-600"
      case "MODERATE":
        return "text-yellow-600"
      case "LOW":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Data Client Card */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Building2 className="h-5 w-5" />
            Enhanced NYC Open Data Client - Manhattan Focus
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time NYC Open Data integration with AI-powered conversion analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Source:</label>
              <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                <SelectTrigger className="border-blue-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataTypeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => fetchNYCData(selectedDataType)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-4 w-4 mr-2" />
                {isLoading ? "Fetching..." : "Fetch Data"}
              </Button>

              <Button
                onClick={runCustomAnalysis}
                disabled={isLoading || !data}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white bg-transparent"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>

          {/* Analysis Progress */}
          {analysisProgress > 0 && analysisProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-700">Processing Manhattan conversion data...</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Success Status */}
          {data && !error && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                Data updated: {new Date(data.metadata.timestamp).toLocaleTimeString()}({data.metadata.recordCount}{" "}
                records)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Analysis Dashboard */}
      {data && data.analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Opportunities</p>
                  <p className="text-2xl font-bold text-green-600">{data.analysis.conversionOpportunities}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Building Age</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(data.analysis.averageAge)} yrs</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Market Activity</p>
                  <p className={`text-2xl font-bold ${getMarketActivityColor(data.analysis.marketActivity)}`}>
                    {data.analysis.marketActivity}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
                  <p className="text-2xl font-bold text-purple-600">{data.api_info.endpoints.length}</p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Recommendations */}
      {data && data.analysis && data.analysis.recommendations.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-amber-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Sources Status */}
      {data && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <Clock className="h-5 w-5" />
              Data Sources Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.api_info.endpoints.map((endpoint) => (
                <div key={endpoint} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Badge variant="outline" className="text-xs">
                    {endpoint.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Focus: {data.metadata.focus}</p>
              <p>Rate Limit: {data.api_info.rate_limit}</p>
              <p>Cache Duration: {data.api_info.cache_duration}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
