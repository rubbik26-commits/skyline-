"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "high" | "medium" | "low"
}

export function EnhancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Market Update",
      message: "Manhattan conversion rate increased by 3.2% this quarter",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      priority: "high",
    },
    {
      id: "2",
      type: "info",
      title: "New Property Added",
      message: "125 Park Avenue conversion project added to portfolio",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      priority: "medium",
    },
    {
      id: "3",
      type: "warning",
      title: "Regulatory Alert",
      message: "NYC zoning changes may affect upcoming conversions",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
      priority: "high",
    },
  ])

  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Notifications</span>
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${notification.read ? "bg-muted/50" : "bg-background"}`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-6"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
