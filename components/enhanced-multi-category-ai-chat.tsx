"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Bot, User, TrendingUp, Building, MapPin, DollarSign } from "lucide-react"

import { comprehensiveNYCPropertyData, comprehensivePropertyStats } from "@/data/comprehensive-nyc-property-data"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  category?: string
  borough?: string
  insights?: {
    marketTrend?: string
    priceRange?: string
    roi?: string
    riskLevel?: string
    propertyCount?: string
    avgPrice?: string
  }
}

const generateAIResponse = (userMessage: string): Message => {
  const message = userMessage.toLowerCase()
  const timestamp = new Date()

  // Borough-specific responses with real data
  if (message.includes("brooklyn")) {
    const brooklynProperties = comprehensiveNYCPropertyData.filter((p) => p.borough === "Brooklyn")
    const avgPrice = brooklynProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / brooklynProperties.length
    const avgCapRate = brooklynProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / brooklynProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Brooklyn's real estate market shows strong fundamentals with ${brooklynProperties.length} properties in our database. Downtown Brooklyn leads with Class A office buildings achieving ${avgCapRate.toFixed(1)}% cap rates. Multifamily properties in waterfront areas like DUMBO and Brooklyn Heights command premium pricing at $${avgPrice.toFixed(0)}/SF. The borough offers excellent value compared to Manhattan with 25-40% lower acquisition costs while maintaining strong rental demand.`,
      timestamp,
      borough: "Brooklyn",
      insights: {
        marketTrend: "Strong Growth",
        priceRange: `$${Math.round(avgPrice * 0.8)}-${Math.round(avgPrice * 1.2)}/SF`,
        roi: `${(avgCapRate * 0.9).toFixed(1)}-${(avgCapRate * 1.1).toFixed(1)}%`,
        riskLevel: "Moderate",
        propertyCount: `${brooklynProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("queens")) {
    const queensProperties = comprehensiveNYCPropertyData.filter((p) => p.borough === "Queens")
    const avgPrice = queensProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / queensProperties.length
    const avgCapRate = queensProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / queensProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Queens, particularly Long Island City, represents exceptional development opportunities with ${queensProperties.length} properties tracked. Industrial facilities average ${avgCapRate.toFixed(1)}% cap rates with strong logistics demand. The multifamily market benefits from Manhattan proximity while offering 30-50% cost savings. New office developments are achieving Class A status with modern amenities and Manhattan skyline views.`,
      timestamp,
      borough: "Queens",
      insights: {
        marketTrend: "Rapid Development",
        priceRange: `$${Math.round(avgPrice * 0.85)}-${Math.round(avgPrice * 1.15)}/SF`,
        roi: `${(avgCapRate * 0.95).toFixed(1)}-${(avgCapRate * 1.05).toFixed(1)}%`,
        riskLevel: "Low-Moderate",
        propertyCount: `${queensProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("bronx")) {
    const bronxProperties = comprehensiveNYCPropertyData.filter((p) => p.borough === "Bronx")
    const avgPrice = bronxProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / bronxProperties.length
    const avgCapRate = bronxProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / bronxProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `The Bronx offers exceptional value opportunities with ${bronxProperties.length} properties showing strong fundamentals. Cap rates average ${avgCapRate.toFixed(1)}% across asset classes, significantly higher than Manhattan. The South Bronx is experiencing major revitalization with new transit investments and affordable housing initiatives. Multifamily properties provide stable cash flow with rent-stabilized units offering predictable returns.`,
      timestamp,
      borough: "Bronx",
      insights: {
        marketTrend: "Value Opportunity",
        priceRange: `$${Math.round(avgPrice * 0.8)}-${Math.round(avgPrice * 1.2)}/SF`,
        roi: `${(avgCapRate * 0.9).toFixed(1)}-${(avgCapRate * 1.1).toFixed(1)}%`,
        riskLevel: "Moderate-High",
        propertyCount: `${bronxProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("staten island")) {
    const siProperties = comprehensiveNYCPropertyData.filter((p) => p.borough === "Staten Island")
    const avgPrice = siProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / siProperties.length
    const avgCapRate = siProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / siProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Staten Island provides the most affordable entry point into NYC real estate with ${siProperties.length} tracked properties. Mixed-use buildings achieve ${avgCapRate.toFixed(1)}% cap rates while industrial properties benefit from port proximity and logistics advantages. The residential market maintains stability with high owner-occupancy rates and strong community fundamentals.`,
      timestamp,
      borough: "Staten Island",
      insights: {
        marketTrend: "Stable Growth",
        priceRange: `$${Math.round(avgPrice * 0.75)}-${Math.round(avgPrice * 1.25)}/SF`,
        roi: `${(avgCapRate * 0.85).toFixed(1)}-${(avgCapRate * 1.15).toFixed(1)}%`,
        riskLevel: "Low",
        propertyCount: `${siProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  // Category-specific responses with real data
  if (message.includes("office") || message.includes("commercial")) {
    const officeProperties = comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Office Buildings")
    const avgPrice = officeProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / officeProperties.length
    const avgCapRate = officeProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / officeProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `NYC office buildings show a bifurcated market across ${officeProperties.length} tracked properties. Class A properties in prime locations maintain strong fundamentals with ${avgCapRate.toFixed(1)}% average cap rates. Manhattan CBD properties command $${avgPrice.toFixed(0)}/SF while outer borough Class A buildings offer 15-25% discounts. Value-add opportunities exist in Class B/C buildings, especially for mixed-use conversions.`,
      timestamp,
      category: "Office Buildings",
      insights: {
        marketTrend: "Bifurcated Market",
        priceRange: `$${Math.round(avgPrice * 0.7)}-${Math.round(avgPrice * 1.3)}/SF`,
        roi: `${(avgCapRate * 0.8).toFixed(1)}-${(avgCapRate * 1.2).toFixed(1)}%`,
        riskLevel: "Varies by Class",
        propertyCount: `${officeProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("multifamily") || message.includes("apartment") || message.includes("residential")) {
    const multifamilyProperties = comprehensiveNYCPropertyData.filter(
      (p) => p.propertyCategory === "Multifamily Apartment Buildings",
    )
    const avgPrice =
      multifamilyProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / multifamilyProperties.length
    const avgCapRate =
      multifamilyProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / multifamilyProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Multifamily properties represent the strongest asset class with ${multifamilyProperties.length} properties in our database. Average cap rates of ${avgCapRate.toFixed(1)}% reflect strong fundamentals and consistent demand. Manhattan luxury buildings achieve premium pricing while outer borough properties offer superior cash-on-cash returns. Rent-stabilized units provide steady income with market-rate units offering upside potential.`,
      timestamp,
      category: "Multifamily Apartment Buildings",
      insights: {
        marketTrend: "Strong Fundamentals",
        priceRange: `$${Math.round(avgPrice * 0.6)}-${Math.round(avgPrice * 1.4)}/SF`,
        roi: `${(avgCapRate * 0.9).toFixed(1)}-${(avgCapRate * 1.1).toFixed(1)}%`,
        riskLevel: "Low-Moderate",
        propertyCount: `${multifamilyProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("mixed-use") || message.includes("mixed use")) {
    const mixedUseProperties = comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Mixed-Use Buildings")
    const avgPrice = mixedUseProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / mixedUseProperties.length
    const avgCapRate = mixedUseProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / mixedUseProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Mixed-use properties offer diversified income streams with ${mixedUseProperties.length} properties tracked. Average cap rates of ${avgCapRate.toFixed(1)}% reflect stable ground floor retail income combined with residential appreciation potential. These properties benefit from zoning flexibility and typically command premium valuations in transit-accessible locations.`,
      timestamp,
      category: "Mixed-Use Buildings",
      insights: {
        marketTrend: "High Demand",
        priceRange: `$${Math.round(avgPrice * 0.8)}-${Math.round(avgPrice * 1.2)}/SF`,
        roi: `${(avgCapRate * 0.95).toFixed(1)}-${(avgCapRate * 1.05).toFixed(1)}%`,
        riskLevel: "Moderate",
        propertyCount: `${mixedUseProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("development") || message.includes("land") || message.includes("site")) {
    const developmentProperties = comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Development Sites")
    const avgPrice =
      developmentProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / developmentProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Development sites command premium pricing with ${developmentProperties.length} opportunities tracked. Manhattan sites with high FAR average $${avgPrice.toFixed(0)}/SF while outer borough sites offer 40-60% cost savings. Key success factors include zoning compliance, FAR utilization, and transit proximity. Current construction costs range $400-600/SF depending on asset class and finishes.`,
      timestamp,
      category: "Development Sites",
      insights: {
        marketTrend: "Limited Supply",
        priceRange: `$${Math.round(avgPrice * 0.6)}-${Math.round(avgPrice * 1.4)}/SF`,
        roi: "15-25% on completion",
        riskLevel: "High",
        propertyCount: `${developmentProperties.length} sites`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  if (message.includes("industrial") || message.includes("warehouse") || message.includes("logistics")) {
    const industrialProperties = comprehensiveNYCPropertyData.filter((p) => p.propertyCategory === "Industrial")
    const avgPrice = industrialProperties.reduce((sum, p) => sum + (p.pricePerSF || 0), 0) / industrialProperties.length
    const avgCapRate = industrialProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / industrialProperties.length

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Industrial properties benefit from e-commerce growth with ${industrialProperties.length} facilities tracked. Average cap rates of ${avgCapRate.toFixed(1)}% reflect strong last-mile delivery demand. Brooklyn and Queens facilities command $${avgPrice.toFixed(0)}/SF with premium features including 24+ foot ceilings, multiple loading docks, and rail access driving higher valuations.`,
      timestamp,
      category: "Industrial",
      insights: {
        marketTrend: "E-commerce Driven",
        priceRange: `$${Math.round(avgPrice * 0.7)}-${Math.round(avgPrice * 1.3)}/SF`,
        roi: `${(avgCapRate * 0.9).toFixed(1)}-${(avgCapRate * 1.1).toFixed(1)}%`,
        riskLevel: "Low-Moderate",
        propertyCount: `${industrialProperties.length} properties`,
        avgPrice: `$${avgPrice.toFixed(0)}/SF`,
      },
    }
  }

  // Investment and market analysis responses with comprehensive data
  if (message.includes("invest") || message.includes("buy") || message.includes("purchase")) {
    const totalValue = comprehensivePropertyStats.totalValue
    const avgROI = comprehensivePropertyStats.avgMetrics.potentialROI
    const avgCapRate = comprehensivePropertyStats.avgMetrics.capRate

    return {
      id: Date.now().toString(),
      type: "ai",
      content: `Current market conditions across ${comprehensivePropertyStats.totalProperties} tracked properties show selective opportunities. Total market value of $${(totalValue / 1000000000).toFixed(1)}B with average ROI potential of ${avgROI.toFixed(1)}%. Focus strategies: 1) Class A multifamily in transit hubs (${avgCapRate.toFixed(1)}% avg cap rates), 2) Value-add office conversions, 3) Industrial properties for e-commerce demand, 4) Development sites with pre-approved zoning. Financing available at 5-7% for qualified buyers.`,
      timestamp,
      insights: {
        marketTrend: "Selective Opportunities",
        priceRange: `$${comprehensivePropertyStats.avgMetrics.pricePerSF.toFixed(0)}/SF average`,
        roi: `${avgROI.toFixed(1)}% average potential`,
        riskLevel: "Strategy Dependent",
        propertyCount: `${comprehensivePropertyStats.totalProperties} total properties`,
        avgPrice: `$${(totalValue / 1000000).toFixed(0)}M average`,
      },
    }
  }

  // Default comprehensive response with real market data
  return {
    id: Date.now().toString(),
    type: "ai",
    content: `I'm your NYC Real Estate AI Assistant with access to ${comprehensivePropertyStats.totalProperties} properties across all five boroughs. Our database covers ${comprehensivePropertyStats.totalGSF.toLocaleString()} SF valued at $${(comprehensivePropertyStats.totalValue / 1000000000).toFixed(1)}B. I can analyze Office Buildings, Multifamily Properties, Mixed-Use Developments, Development Sites, Industrial Facilities, Retail Condos, and Ground Leases with current market data. What specific market insights would you like to explore?`,
    timestamp,
    insights: {
      marketTrend: "Comprehensive Coverage",
      priceRange: `$${comprehensivePropertyStats.avgMetrics.pricePerSF.toFixed(0)}/SF average`,
      roi: `${comprehensivePropertyStats.avgMetrics.potentialROI.toFixed(1)}% average potential`,
      riskLevel: "Full Risk Spectrum",
      propertyCount: `${comprehensivePropertyStats.totalProperties} properties`,
      avgPrice: `${(comprehensivePropertyStats.totalGSF / 1000000).toFixed(1)}M SF total`,
    },
  }
}

export function EnhancedMultiCategoryAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: `Hello! I'm your NYC Real Estate AI Assistant with real-time access to ${comprehensivePropertyStats.totalProperties} properties valued at $${(comprehensivePropertyStats.totalValue / 1000000000).toFixed(1)}B across all five boroughs. I can analyze Office Buildings, Multifamily Apartments, Mixed-Use Buildings, Development Sites, Industrial Properties, Retail Condos, and Ground Leases with current market data. What would you like to explore?`,
      timestamp: new Date(),
      insights: {
        marketTrend: "Live Data Access",
        priceRange: "All Price Points",
        roi: "Real-Time Analysis",
        riskLevel: "Full Spectrum",
        propertyCount: `${comprehensivePropertyStats.totalProperties} properties`,
        avgPrice: `$${comprehensivePropertyStats.avgMetrics.pricePerSF.toFixed(0)}/SF avg`,
      },
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "What's the best borough for office investments?",
    "Show me multifamily opportunities with 5%+ cap rates",
    "Which areas have the highest ROI potential?",
    "Tell me about development sites in Queens",
    "Compare industrial properties across boroughs",
    "What retail condos are available under $50M?",
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader
        className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 md:p-4 lg:p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm md:text-base lg:text-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="leading-tight">Ask Me Anything About New York Real Estate</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs px-2 py-1 sm:ml-auto">
            {comprehensivePropertyStats.totalProperties} Properties • Live Data
          </Badge>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <ScrollArea className="h-80 md:h-96 p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 md:gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] md:max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === "user" ? "bg-blue-500" : "bg-purple-500"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-2 md:p-3 ${
                        message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-xs md:text-sm leading-relaxed">{message.content}</p>
                      {message.insights && (
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium">Trend:</span>
                              <span className="truncate">{message.insights.marketTrend}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium">Price:</span>
                              <span className="truncate">{message.insights.priceRange}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium">ROI:</span>
                              <span className="truncate">{message.insights.roi}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium">Risk:</span>
                              <span className="truncate">{message.insights.riskLevel}</span>
                            </div>
                          </div>
                          {(message.insights.propertyCount || message.insights.avgPrice) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                              {message.insights.propertyCount && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3 flex-shrink-0" />
                                  <span className="font-medium">Count:</span>
                                  <span className="truncate">{message.insights.propertyCount}</span>
                                </div>
                              )}
                              {message.insights.avgPrice && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                                  <span className="font-medium">Avg:</span>
                                  <span className="truncate">{message.insights.avgPrice}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {(message.category || message.borough) && (
                            <div className="flex flex-wrap gap-1">
                              {message.category && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  {message.category}
                                </Badge>
                              )}
                              {message.borough && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  {message.borough}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <Separator />

          <div className="p-3 md:p-4 space-y-3">
            <div className="flex gap-1 md:gap-2 flex-wrap">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent px-2 py-1 leading-tight"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about any NYC property type or borough..."
                className="flex-1 text-xs md:text-sm"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="sm" className="px-3">
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
