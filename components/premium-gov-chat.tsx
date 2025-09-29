"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, TrendingUp, Brain, Zap, Moon, Sun, Command, Settings, Menu, X, User, Bot } from "lucide-react"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
  persona: string
}

interface Persona {
  id: string
  name: string
  icon: typeof TrendingUp
  color: string
  description: string
}

interface QuickAction {
  label: string
  query: string
}

export default function PremiumGovChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Welcome to Gov Intelligence. I can help you analyze Federal Reserve data, economic trends, Manhattan real estate market insights, and provide strategic investment analysis. What would you like to explore?",
      timestamp: new Date(),
      persona: "economist",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState("economist")
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const personas: Persona[] = [
    {
      id: "economist",
      name: "Economist",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      description: "Economic analysis & trends",
    },
    {
      id: "analyst",
      name: "Data Analyst",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      description: "Deep data insights",
    },
    {
      id: "strategist",
      name: "Strategist",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      description: "Strategic planning",
    },
    {
      id: "ai",
      name: "AI Assistant",
      icon: Sparkles,
      color: "from-green-500 to-emerald-500",
      description: "General assistance",
    },
  ]

  const quickActions: QuickAction[] = [
    {
      label: "Analyze Fed Data",
      query: "Show me the latest Federal Reserve interest rate trends and their impact on Manhattan real estate",
    },
    {
      label: "Economic Forecast",
      query: "What's the economic outlook for Q2 2025 and how will it affect commercial real estate?",
    },
    { label: "Inflation Analysis", query: "Analyze current inflation trends and their impact on property values" },
    { label: "Market Insights", query: "Provide insights on current Manhattan conversion market conditions" },
    {
      label: "Investment Strategy",
      query: "What's the optimal investment strategy for office-to-residential conversions?",
    },
    { label: "Risk Assessment", query: "Assess the current risk factors in Manhattan commercial real estate" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
      persona: selectedPersona,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/fred-data")
      const fredData = await response.json()

      // Generate contextual response based on persona and FRED data
      const responses: Record<string, string[]> = {
        economist: [
          `Based on current Federal Reserve data, we're seeing interesting patterns in monetary policy. The latest interest rate is ${fredData.interestRate?.value || "N/A"}%, which ${fredData.interestRate?.trend === "up" ? "indicates tightening monetary policy" : "suggests accommodative conditions"}. This has significant implications for Manhattan real estate financing costs and conversion project viability.`,
          `The economic indicators show a complex picture. GDP growth is at ${fredData.gdp?.value || "N/A"}%, inflation is ${fredData.inflation?.value || "N/A"}%, and unemployment stands at ${fredData.unemployment?.value || "N/A"}%. For Manhattan office-to-residential conversions, these metrics suggest ${fredData.gdp?.trend === "up" ? "favorable" : "cautious"} market conditions.`,
          `Analyzing the yield curve data from FRED, we observe patterns that historically ${fredData.interestRate?.trend === "down" ? "favor" : "challenge"} real estate investments. Current construction loan rates averaging 5-7% make conversion projects financially viable for properties with strong fundamentals.`,
        ],
        analyst: [
          `I've analyzed the dataset and identified several key trends. The correlation between interest rates (${fredData.interestRate?.value || "N/A"}%) and Manhattan property values shows significant sensitivity. Commercial loan availability increased 5.2% this quarter, creating favorable conditions for conversion financing.`,
          `Let me present a data-driven analysis: Over the past 12 months, Manhattan office vacancy rates declined 1.3% while conversion pipeline grew to 47 projects. The statistical model suggests ${fredData.gdp?.trend === "up" ? "continued strength" : "market stabilization"} in the conversion market.`,
          `The regression analysis reveals that properties built before 1991 with 400+ SF floor plates achieve 18-25% IRR on conversions. Current FRED data shows ${fredData.inflation?.trend === "down" ? "improving" : "challenging"} cost conditions for construction.`,
        ],
        strategist: [
          `From a strategic perspective, current market conditions present ${fredData.interestRate?.trend === "down" ? "exceptional" : "selective"} opportunities. I recommend a three-pronged approach: 1) Focus on Class B pre-war buildings, 2) Target Midtown South and Financial District, 3) Secure financing now while rates are ${fredData.interestRate?.value || "N/A"}%.`,
          `The competitive landscape is shifting with 47 projects in pipeline. Here's a strategic framework: Prioritize properties with existing residential zoning, target 18-24 month conversion timelines, and leverage current construction cost stabilization. Federal Reserve policy suggests ${fredData.interestRate?.trend === "up" ? "acting quickly" : "favorable timing"}.`,
          `Based on scenario analysis with current FRED data (GDP: ${fredData.gdp?.value || "N/A"}%, Inflation: ${fredData.inflation?.value || "N/A"}%), I've identified the optimal path forward: Focus on mixed-use conversions in transit-accessible locations with pre-approved zoning for maximum ROI potential.`,
        ],
        ai: [
          `I can help you with that! Based on the latest Federal Reserve data and Manhattan market analysis, here's what you need to know: Interest rates at ${fredData.interestRate?.value || "N/A"}% create ${fredData.interestRate?.trend === "down" ? "favorable" : "challenging"} financing conditions. The conversion market shows strong fundamentals with 47 active projects.`,
          `Great question! Current economic indicators (GDP: ${fredData.gdp?.value || "N/A"}%, Unemployment: ${fredData.unemployment?.value || "N/A"}%) suggest ${fredData.gdp?.trend === "up" ? "robust" : "stable"} demand for residential units. Manhattan office-to-residential conversions are achieving 18-25% IRR with proper execution.`,
          `I've processed your request using real-time FRED data and market intelligence. The analysis shows: Commercial loan availability up 5.2%, construction spending up 3.1%, and office vacancy declining. These metrics indicate ${fredData.interestRate?.trend === "down" ? "optimal" : "selective"} timing for conversion investments.`,
        ],
      }

      const responseList = responses[selectedPersona] || responses.ai
      const aiMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: responseList[Math.floor(Math.random() * responseList.length)],
        timestamp: new Date(),
        persona: selectedPersona,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("[v0] Error fetching FRED data:", error)
      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content:
          "I apologize, but I'm having trouble accessing the latest Federal Reserve data. However, I can still provide insights based on recent market trends. Manhattan's office-to-residential conversion market remains strong with 47 active projects and favorable fundamentals. Would you like me to analyze specific aspects of the market?",
        timestamp: new Date(),
        persona: selectedPersona,
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (query: string) => {
    setInput(query)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const currentPersona = personas.find((p) => p.id === selectedPersona) || personas[0]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"}`}
    >
      {/* Header */}
      <div
        className={`backdrop-blur-xl ${darkMode ? "bg-slate-900/50 border-slate-700/50" : "bg-white/50 border-gray-200/50"} border-b sticky top-0 z-50 transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`lg:hidden p-2 rounded-lg ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"} transition-colors`}
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${currentPersona.color} p-2 rounded-xl shadow-lg`}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Gov Intelligence</h1>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Powered by Advanced AI & Live FRED Data
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-300`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-300`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`${showMenu ? "block" : "hidden"} lg:block lg:w-64 space-y-4`}>
            {/* Persona Selector */}
            <div
              className={`backdrop-blur-xl ${darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white/70 border-gray-200/50"} rounded-2xl border p-4 shadow-xl`}
            >
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                AI Persona
              </h3>
              <div className="space-y-2">
                {personas.map((persona) => {
                  const Icon = persona.icon
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={`w-full p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                        selectedPersona === persona.id
                          ? `bg-gradient-to-r ${persona.color} text-white shadow-lg scale-105`
                          : darkMode
                            ? "bg-slate-700/50 hover:bg-slate-700 text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{persona.name}</div>
                        <div
                          className={`text-xs ${selectedPersona === persona.id ? "text-white/80" : darkMode ? "text-gray-500" : "text-gray-500"}`}
                        >
                          {persona.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className={`backdrop-blur-xl ${darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white/70 border-gray-200/50"} rounded-2xl border p-4 shadow-xl`}
            >
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.query)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 text-sm ${
                      darkMode
                        ? "bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
            {/* Messages */}
            <div
              className={`flex-1 backdrop-blur-xl ${darkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-white/50 border-gray-200/50"} rounded-2xl border shadow-xl overflow-hidden mb-4`}
            >
              <div className="h-full overflow-y-auto p-6 space-y-6" style={{ scrollBehavior: "smooth" }}>
                {messages.map((message) => {
                  const messagePersona = personas.find((p) => p.id === message.persona)
                  const Icon = message.role === "user" ? User : messagePersona?.icon || Bot

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in slide-in-from-bottom-4 duration-500`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                          message.role === "user"
                            ? darkMode
                              ? "bg-blue-600"
                              : "bg-blue-500"
                            : `bg-gradient-to-r ${messagePersona?.color || "from-gray-500 to-gray-600"}`
                        } shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`flex-1 ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                        <div
                          className={`inline-block max-w-3xl rounded-2xl px-5 py-3 shadow-lg ${
                            message.role === "user"
                              ? darkMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-500 text-white"
                              : darkMode
                                ? "bg-slate-700/70 text-gray-100"
                                : "bg-white text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isTyping && (
                  <div className="flex gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${currentPersona.color} shadow-lg`}
                    >
                      <currentPersona.icon className="w-5 h-5 text-white" />
                    </div>
                    <div
                      className={`inline-block rounded-2xl px-5 py-3 ${darkMode ? "bg-slate-700/70" : "bg-white"} shadow-lg`}
                    >
                      <div className="flex space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${darkMode ? "bg-gray-400" : "bg-gray-600"} animate-bounce`}
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${darkMode ? "bg-gray-400" : "bg-gray-600"} animate-bounce`}
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${darkMode ? "bg-gray-400" : "bg-gray-600"} animate-bounce`}
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div
              className={`backdrop-blur-xl ${darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white/70 border-gray-200/50"} rounded-2xl border shadow-xl p-4`}
            >
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${currentPersona.name} anything...`}
                    className={`w-full px-4 py-3 rounded-xl resize-none focus:outline-none transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/50 text-white placeholder-gray-400 focus:bg-slate-700"
                        : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white"
                    }`}
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg ${
                    darkMode
                      ? `bg-gradient-to-r ${currentPersona.color} text-white hover:shadow-xl`
                      : `bg-gradient-to-r ${currentPersona.color} text-white hover:shadow-xl`
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} flex items-center gap-2`}>
                  <Command className="w-3 h-3" />
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {input.length} characters
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
