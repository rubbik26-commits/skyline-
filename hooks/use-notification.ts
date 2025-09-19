"use client"

import { useState, useCallback } from "react"

type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  message: string
  type: NotificationType
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification = { id, message, type }

    setNotifications((prev) => [...prev, notification])

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return {
    notifications,
    showNotification,
    removeNotification,
  }
}
