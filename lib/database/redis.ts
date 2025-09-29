import "server-only"
import { Redis } from "@upstash/redis"

// Singleton pattern for Redis connection
let redisInstance: Redis | null = null

export function getRedisClient() {
  if (!redisInstance) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error("Upstash Redis environment variables are not set")
    }

    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
  return redisInstance
}

export { getRedisClient as redisClient }
