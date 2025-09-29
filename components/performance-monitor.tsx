"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Cpu, HardDrive, Wifi } from "lucide-react"

interface PerformanceMetrics {
  cpu: number
  memory: number
  network: number
  storage: number
  responseTime: number
  uptime: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 45,
    memory: 62,
    network: 78,
    storage: 34,
    responseTime: 120,
    uptime: 99.8,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        storage: Math.max(0, Math.min(100, prev.storage + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 20)),
        uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, isResponseTime = false) => {
    if (isResponseTime) {
      if (value < 150) return "text-green-500"
      if (value < 300) return "text-yellow-500"
      return "text-red-500"
    }
    if (value < 50) return "text-green-500"
    if (value < 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500"
    if (value < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          System Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(metrics.cpu)}`}>{metrics.cpu.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(metrics.memory)}`}>
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(metrics.network)}`}>
                {metrics.network.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.network} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <span className={`text-sm font-mono ${getStatusColor(metrics.storage)}`}>
                {metrics.storage.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.storage} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Response Time</span>
            <Badge variant="outline" className={getStatusColor(metrics.responseTime, true)}>
              {metrics.responseTime.toFixed(0)}ms
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uptime</span>
            <Badge variant="outline" className="text-green-500">
              {metrics.uptime.toFixed(1)}%
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">System Status: Operational</span>
        </div>
      </CardContent>
    </Card>
  )
}
