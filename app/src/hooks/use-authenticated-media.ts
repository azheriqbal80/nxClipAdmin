import { useEffect, useState } from 'react'
import { getAccessToken } from '@/api/client'

/** Custom hook that fetches authenticated media (images/videos) with Bearer token
    and returns a local object Blob URL for secure rendering. */
export function useAuthenticatedMedia(url: string | null | undefined) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) {
      setMediaSrc(null)
      setIsLoading(false)
      setError(false)
      return
    }

    // Data URLs or Blob URLs do not require token fetching
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      setMediaSrc(url)
      setIsLoading(false)
      setError(false)
      return
    }

    let active = true
    let blobUrlToRevoke: string | null = null

    async function loadMedia() {
      setIsLoading(true)
      setError(false)

      const token = getAccessToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Resolve relative path against API base or current origin
      let targetUrl = url!
      if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
        const base = import.meta.env.VITE_API_URL || window.location.origin
        targetUrl = new URL(targetUrl, base).toString()
      }

      // Prepare URL with token param as additional query fallback
      let urlWithToken = targetUrl
      if (token && !targetUrl.includes('token=')) {
        const separator = targetUrl.includes('?') ? '&' : '?'
        urlWithToken = `${targetUrl}${separator}token=${encodeURIComponent(token)}`
      }

      try {
        // Attempt 1: Authenticated fetch with Authorization header & token param
        let res = await fetch(urlWithToken, { headers, credentials: 'include' }).catch(() => null)

        // Attempt 2: Authenticated fetch without token query param
        if (!res || !res.ok) {
          res = await fetch(targetUrl, { headers, credentials: 'include' }).catch(() => null)
        }

        // Attempt 3: Public fetch (e.g. for external CDNs)
        if (!res || !res.ok) {
          res = await fetch(targetUrl).catch(() => null)
        }

        if (res && res.ok) {
          const blob = await res.blob()
          if (!active) return
          blobUrlToRevoke = URL.createObjectURL(blob)
          setMediaSrc(blobUrlToRevoke)
          setIsLoading(false)
          return
        }

        // Fallback: Pass the tokenized URL string directly
        if (!active) return
        setMediaSrc(urlWithToken)
        setIsLoading(false)
      } catch {
        if (!active) return
        setMediaSrc(urlWithToken)
        setError(true)
        setIsLoading(false)
      }
    }

    loadMedia()

    return () => {
      active = false
      if (blobUrlToRevoke) {
        URL.revokeObjectURL(blobUrlToRevoke)
      }
    }
  }, [url])

  return { mediaSrc, isLoading, error }
}
