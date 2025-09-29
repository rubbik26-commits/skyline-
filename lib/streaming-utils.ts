"use client"

import React from "react"

export async function* streamData<T>(data: T[], chunkSize = 50): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < data.length; i += chunkSize) {
    yield data.slice(i, i + chunkSize)
    // Allow other tasks to run
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

export function createStreamingResponse<T>(data: T[], chunkSize = 100): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let index = 0

  return new ReadableStream({
    start(controller) {
      console.log("[v0] Starting streaming response with", data.length, "items")
    },

    async pull(controller) {
      if (index >= data.length) {
        controller.close()
        return
      }

      const chunk = data.slice(index, index + chunkSize)
      const jsonChunk = JSON.stringify({
        data: chunk,
        hasMore: index + chunkSize < data.length,
        total: data.length,
        currentIndex: index,
      })

      controller.enqueue(encoder.encode(jsonChunk + "\n"))
      index += chunkSize

      // Add small delay to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 10))
    },
  })
}

// Hook for consuming streaming data
export function useStreamingData<T>(url: string, options?: RequestInit) {
  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function fetchStreamingData() {
      try {
        const response = await fetch(url, options)
        if (!response.body) throw new Error("No response body")

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.trim()) {
              try {
                const chunk = JSON.parse(line)
                setData((prev) => [...prev, ...chunk.data])
                console.log("[v0] Received streaming chunk:", chunk.data.length, "items")
              } catch (e) {
                console.error("[v0] Error parsing streaming chunk:", e)
              }
            }
          }
        }

        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
          setLoading(false)
        }
      }
    }

    fetchStreamingData()

    return () => {
      cancelled = true
    }
  }, [url, options])

  return { data, loading, error }
}
