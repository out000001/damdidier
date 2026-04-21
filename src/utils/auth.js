// ─── Token storage ────────────────────────────────────────────────────────────
// Access token stays in memory only — never in localStorage (XSS safe)
let _accessToken = null
let _refreshTimer = null
let _onExpired = null   // callback when session fully expires

export function setOnExpired(cb) { _onExpired = cb }

export function getAccessToken() { return _accessToken }

export function clearSession() {
  _accessToken = null
  if (_refreshTimer) { clearTimeout(_refreshTimer); _refreshTimer = null }
}

// ─── Store token and schedule proactive refresh ───────────────────────────────
export function storeAccessToken(token, expiresIn = 900) {
  _accessToken = token
  scheduleRefresh(expiresIn)
}

function scheduleRefresh(expiresIn) {
  if (_refreshTimer) clearTimeout(_refreshTimer)
  // Refresh 60s before expiry
  const delay = Math.max((expiresIn - 60) * 1000, 5000)
  _refreshTimer = setTimeout(silentRefresh, delay)
}

// ─── Silent token refresh (uses httpOnly cookie automatically) ────────────────
export async function silentRefresh() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',   // sends the httpOnly refresh_token cookie
    })

    if (res.status === 401) {
      // Refresh token expired or revoked
      clearSession()
      if (_onExpired) _onExpired()
      return null
    }

    if (!res.ok) throw new Error('Refresh failed')

    const data = await res.json()
    storeAccessToken(data.accessToken, data.expiresIn)
    return data.accessToken
  } catch {
    clearSession()
    if (_onExpired) _onExpired()
    return null
  }
}

// ─── Authenticated fetch — auto-refresh if token missing ─────────────────────
export async function authFetch(url, options = {}) {
  let token = _accessToken

  if (!token) {
    token = await silentRefresh()
    if (!token) {
      throw Object.assign(new Error('Não autenticado'), { status: 401 })
    }
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })

  // Access token expired mid-session — try once with refreshed token
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}))
    if (body.expired) {
      const newToken = await silentRefresh()
      if (!newToken) throw Object.assign(new Error('Sessão expirada'), { status: 401 })

      return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      })
    }
  }

  return res
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch { /* best-effort */ }
  clearSession()
}

// ─── Password strength (must match backend rules) ────────────────────────────
export function passwordRules(pw) {
  return {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  }
}

export function isPasswordStrong(pw) {
  return Object.values(passwordRules(pw)).every(Boolean)
}
