'use client'

// REMOVE IN PRODUCTION
import { useState, useEffect } from 'react'
import { subscribeToApiCalls } from '@/lib/apiCounter'
import { rateLimiter } from '@/lib/api'

export default function ApiDebugCounter() {
  const [count,        setCount]        = useState(0)
  const [lastEndpoint, setLastEndpoint] = useState('none')
  const [remaining,    setRemaining]    = useState(8)
  const [isMounted,    setIsMounted]    = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const unsubscribe = subscribeToApiCalls((newCount, endpoint) => {
      setCount(newCount)
      setLastEndpoint(endpoint)
    })

    const interval = setInterval(() => {
      setRemaining(rateLimiter.getRemainingCalls())
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  if (!isMounted) return null

  return (
    <div
      style={{ position: 'fixed', bottom: '16px', left: '16px' }}
      className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-xs text-gray-300 shadow-lg z-50"
    >
      <div>📡 API Calls: {count}</div>
      <div>🔋 Remaining: {remaining}/8 this minute</div>
      <div className="text-gray-500 truncate max-w-48">Last: {lastEndpoint}</div>
    </div>
  )
}
