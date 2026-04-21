const rateLimit = require('express-rate-limit')
const pool = require('../database/pool')

// ─── Per-IP + per-user rate limiters ─────────────────────────────────────────

// Strict limiter for login: 10 attempts per 15min per IP
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: req => req.ip,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failures
})

// Register limiter: 5 registrations per hour per IP
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: req => req.ip,
  message: { message: 'Limite de cadastros atingido. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API limiter: 200 req/min per IP
exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  keyGenerator: req => req.ip,
  message: { message: 'Muitas requisições. Aguarde um momento.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ─── Input sanitizer — strip null bytes and trim strings ─────────────────────
exports.sanitizeBody = (req, _res, next) => {
  function clean(obj) {
    if (typeof obj === 'string') return obj.replace(/\0/g, '').trim()
    if (Array.isArray(obj))     return obj.map(clean)
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, clean(v)]))
    }
    return obj
  }
  req.body = clean(req.body)
  next()
}

// ─── Block suspicious user-agents (scanners, bots) ───────────────────────────
const BLOCKED_UA = /sqlmap|nikto|nmap|masscan|zgrab|nuclei|dirbuster|gobuster/i

exports.blockScanners = (req, res, next) => {
  const ua = req.get('user-agent') || ''
  if (BLOCKED_UA.test(ua)) {
    return res.status(403).json({ message: 'Acesso negado' })
  }
  next()
}

// ─── Require admin role ───────────────────────────────────────────────────────
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' })
  }
  next()
}

// ─── Require authenticated user owns the resource ────────────────────────────
exports.requireSelf = (paramName = 'id') => (req, res, next) => {
  const resourceId = parseInt(req.params[paramName], 10)
  if (req.user.id !== resourceId) {
    return res.status(403).json({ message: 'Acesso negado' })
  }
  next()
}
