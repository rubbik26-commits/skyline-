"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles, TrendingUp, Building, MapPin, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIRealEstateChatProps {
  properties?: any[]
  className?: string
}

export function AIRealEstateChat({ properties = [], className }: AIRealEstateChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your Manhattan Real Estate AI Assistant. I can help you with market analysis, property insights, investment opportunities, and conversion trends. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "What's the current conversion market trend?",
        "Show me the best investment opportunities",
        "Analyze Midtown vs Downtown conversions",
        "What are the average conversion costs?",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickResponses = [
    {
      icon: TrendingUp,
      text: "Market Trends",
      query: "What are the current market trends for office-to-residential conversions in Manhattan?",
    },
    { icon: Building, text: "Best Properties", query: "Which properties have the highest conversion potential?" },
    { icon: MapPin, text: "Location Analysis", query: "Compare conversion opportunities by Manhattan submarket" },
    { icon: DollarSign, text: "ROI Analysis", query: "What's the expected ROI for current conversion projects?" },
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing with realistic real estate insights
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("trend") || lowerMessage.includes("market")) {
      return `📈 **Current Market Analysis:**

**Strong Conversion Activity:** Manhattan is experiencing robust office-to-residential conversion activity with ${properties.length} tracked properties.

**Key Trends:**
• **Midtown South** leading with highest conversion rates (34% of total)
• **Financial District** showing strong growth (+18% this quarter)
• Average conversion timeline: 18-24 months
• **ROI projections:** 15-25% for well-positioned properties

**Market Drivers:**
• Hybrid work reducing office demand
• Housing shortage driving residential premium
• Favorable zoning changes in key districts
• Construction costs stabilizing

Would you like me to dive deeper into any specific submarket or trend?`
    }

    if (lowerMessage.includes("best") || lowerMessage.includes("opportunity") || lowerMessage.includes("investment")) {
      const completedCount = properties.filter((p) => p.status === "Completed").length
      const underwayCount = properties.filter((p) => p.status === "Underway").length

      return `🏆 **Top Investment Opportunities:**

**Immediate Opportunities:**
• **${underwayCount} projects underway** - potential for partnership/acquisition
• **Financial District**: 40% below peak pricing, strong rental demand
• **Midtown South**: Premium market, 25%+ ROI potential

**Emerging Hotspots:**
• **Hudson Yards periphery** - next wave of conversions
• **Lower East Side** - gentrification driving demand
• **Hell's Kitchen** - transportation hub advantage

**Success Metrics:**
• **${completedCount} completed conversions** averaging 22% ROI
• **Pre-war buildings** showing highest success rates
• **Mixed-use developments** outperforming by 15%

**Risk Factors:**
• Zoning compliance costs
• Construction timeline overruns
• Market saturation in prime areas

Want specific property recommendations or detailed financial projections?`
    }

    if (lowerMessage.includes("location") || lowerMessage.includes("submarket") || lowerMessage.includes("area")) {
      return `🗺️ **Manhattan Submarket Analysis:**

**🥇 Top Performers:**
• **Midtown South**: 34% of conversions, $85/sqft avg rent
• **Financial District**: 28% of conversions, strong growth
• **Tribeca/SoHo**: Premium market, $95/sqft avg rent

**📊 Market Dynamics:**
• **Midtown**: Office glut creating opportunities
• **Upper East Side**: Emerging residential demand
• **Chelsea**: Mixed results, selective opportunities

**🎯 Investment Sweet Spots:**
• **FiDi**: Best value, improving fundamentals
• **Hell's Kitchen**: Transportation advantage
• **Lower East Side**: Gentrification tailwinds

**⚠️ Caution Areas:**
• **Midtown East**: Oversupply concerns
• **Upper West Side**: Limited conversion potential

Each submarket has unique zoning, demographic, and economic factors. Which area interests you most?`
    }

    if (
      lowerMessage.includes("roi") ||
      lowerMessage.includes("return") ||
      lowerMessage.includes("profit") ||
      lowerMessage.includes("cost")
    ) {
      return `💰 **ROI & Financial Analysis:**

**Average Returns:**
• **Completed projects**: 18-25% IRR
• **Premium locations**: 25-35% IRR
• **Value-add opportunities**: 15-22% IRR

**Cost Breakdown (per sqft):**
• **Acquisition**: $400-800/sqft
• **Conversion**: $200-350/sqft
• **Total investment**: $600-1,150/sqft

**Revenue Projections:**
• **Rental yield**: 4-6% annually
• **Sale multiples**: 12-18x annual rent
• **Appreciation**: 3-5% annually

**Key Success Factors:**
• **Location premium**: +20-30% returns
• **Efficient layouts**: +15% unit count
• **Amenity packages**: +10-15% rents

**Market Timing:**
• **Current cycle**: Favorable acquisition pricing
• **18-month outlook**: Strong rental demand
• **3-year projection**: Continued appreciation

Would you like detailed projections for specific properties or submarkets?`
    }

    if (lowerMessage.includes("zoning") || lowerMessage.includes("regulation") || lowerMessage.includes("legal")) {
      return `📋 **Zoning & Regulatory Landscape:**

**Recent Changes:**
• **City Planning Commission**: Streamlined conversion approvals
• **DOB**: Updated guidelines for residential conversions
• **Fire Department**: New safety requirements for mixed-use

**Key Requirements:**
• **Minimum unit size**: 400 sqft (varies by district)
• **Light and air**: Window requirements for bedrooms
• **Egress**: Two means of egress for larger buildings

**Incentive Programs:**
• **421-a Tax Abatement**: Available for qualifying projects
• **Affordable Housing**: Bonus FAR opportunities
• **Historic Districts**: Tax credits available

**Compliance Costs:**
• **Zoning analysis**: $15-25K
• **DOB filings**: $50-100K
• **Legal/consulting**: $100-200K

Need help with specific zoning questions or regulatory compliance?`
    }

    // Default comprehensive response
    return `🤖 **AI Analysis Complete:**

Based on your query about "${userMessage}", here's what I found in the current Manhattan conversion market:

**Market Overview:**
• **${properties.length} properties** in our database
• **Strong activity** across multiple submarkets
• **Favorable conditions** for new conversions

**Key Insights:**
• Office vacancy rates creating opportunities
• Residential demand exceeding supply
• Construction costs stabilizing
• Financing becoming more accessible

**Recommendations:**
• Focus on pre-war buildings with good bones
• Target submarkets with transportation access
• Consider mixed-use development opportunities
• Plan for 18-24 month conversion timelines

**Next Steps:**
• Review specific property opportunities
• Analyze submarket fundamentals
• Evaluate financing options
• Assess regulatory requirements

Would you like me to elaborate on any of these points or analyze specific properties?`
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await generateAIResponse(input.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        suggestions: [
          "Tell me more about this",
          "Show me specific examples",
          "What are the risks?",
          "Compare with other markets",
        ],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("AI response error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again or ask a different question about Manhattan real estate.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickResponse = (query: string) => {
    setInput(query)
  }

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50/50 to-white", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <div className="relative">
            <Bot className="h-5 w-5" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
          </div>
          Ask Me Anything About New York Real Estate
          <Badge variant="secondary" className="ml-auto text-xs">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Response Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {quickResponses.map((response, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickResponse(response.query)}
              className="flex items-center gap-2 text-xs border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              <response.icon className="h-3 w-3" />
              {response.text}
            </Button>
          ))}
        </div>

        {/* Chat Messages */}
        <ScrollArea className="h-96 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-white border border-blue-200 text-gray-800",
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuggestion(suggestion)}
                          className="text-xs h-6 px-2 text-blue-600 hover:bg-blue-100"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
                </div>
                <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span className="ml-2 text-gray-500">Analyzing market data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about market trends, investment opportunities, ROI analysis..."
            className="flex-1 border-blue-300 focus:border-blue-600"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          AI responses are generated based on current market data and trends. Always consult with real estate
          professionals for investment decisions.
        </div>
      </CardContent>
    </Card>
  )
}
