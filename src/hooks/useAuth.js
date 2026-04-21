import { useState, useEffect, useCallback } from 'react'
import { silentRefresh, storeAccessToken, clearSession, setOnExpired, logout } from '../utils/auth'

export function useAuth() {
  const [status, setStatus]   = useState('loading')   // loading | authenticated | unauthenticated
  const [user, setUser]       = useState(null)
  const [sessionWarning, setSessionWarning] = useState(false)

  // Try to restore session on mount via silent refresh
  useEffect(() => {
    setOnExpired(() => {
      setStatus('unauthenticated')
      setUser(null)
      setSessionWarning(false)
    })

    silentRefresh().then(token => {
      if (token) {
        setStatus('authenticated')
        fetchMe()
      } else {
        setStatus('unauthenticated')
      }
    })
  }, [])

  async function fetchMe() {
    try {
      const { authFetch } = await import('../utils/auth')
      const res = await authFetch('/api/users/me')
      if (res.ok) setUser(await res.json())
    } catch { /* session already cleared by authFetch */ }
  }

  const handleLogin = useCallback(async (accessToken, expiresIn, nome) => {
    storeAccessToken(accessToken, expiresIn)
    setStatus('authenticated')
    setUser({ nome })
    await fetchMe()
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    setStatus('unauthenticated')
    setUser(null)
  }, [])

  return { status, user, sessionWarning, handleLogin, handleLogout }
}
