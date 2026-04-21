require('dotenv').config()
const express    = require('express')
const helmet     = require('helmet')
const cors       = require('cors')
const cookieParser = require('cookie-parser')
const { sanitizeBody, blockScanners, apiLimiter } = require('./middleware/security')

const authRoutes  = require('./routes/auth')
const userRoutes  = require('./routes/users')

const app  = express()
const PORT = process.env.PORT || 4000

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))
app.use(helmet.noSniff())
app.use(helmet.hidePoweredBy())
app.use(helmet.frameguard({ action: 'deny' }))
app.use(helmet.xssFilter())

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin) or listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Remaining'],
}))

// ─── Body & cookies ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// ─── Global middleware ────────────────────────────────────────────────────────
app.set('trust proxy', 1)    // trust first proxy (Vercel/nginx)
app.use(blockScanners)
app.use(sanitizeBody)
app.use(apiLimiter)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes)
app.use('/api/users', userRoutes)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada' }))

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // Never leak stack traces to clients
  const status = err.status || 500
  const message = status < 500 ? err.message : 'Erro interno do servidor'
  if (status >= 500) console.error('[server]', err)
  res.status(status).json({ message })
})

app.listen(PORT, () => console.log(`DamDidier API ✓ porta ${PORT}`))
