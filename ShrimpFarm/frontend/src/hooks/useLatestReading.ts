import { useEffect, useState } from 'react'
import type { SensorReading } from '../api/endpoints'
import { endpoints } from '../api/endpoints'

const POLL_MS = 4000

export function useLatestReading(pondId?: number) {
  const [reading, setReading] = useState<SensorReading | null>(null)

  useEffect(() => {
    if (!pondId) return

    let cancelled = false

    const load = () => {
      endpoints
        .latestPondReading(pondId)
        .then((data) => {
          if (!cancelled && data) setReading(data)
        })
        .catch(() => {
          /* keep last successful reading */
        })
    }

    load()
    const timer = window.setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [pondId])

  return reading
}
