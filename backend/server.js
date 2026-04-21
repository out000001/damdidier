require('dotenv').config()
const express    = require('express')
const helmet     = require('helmet')
const cors       = require('cors')
const cookieParser = require('cookie-parser')
const { sanitizeBody, blockScanners, apiLimiter } = require('./middleware/security')

const authRoutes  = require('./routes/auth')
const userRoutes  = require('./routes/users')
const adminRoutes = require('./routes/admin')

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
app.use('/api/admin', adminRoutes)

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

// ─── Seed admin on first start ────────────────────────────────────────────────
async function seedAdmin() {
  const nome  = process.env.ADMIN_NOME
  const email = process.env.ADMIN_EMAIL
  const senha = process.env.ADMIN_SENHA

  if (!nome || !email || !senha) return

  try {
    const pool   = require('./database/pool')
    const bcrypt = require('bcryptjs')

    const existing = await pool.query(
      `SELECT id FROM usuarios WHERE role = 'admin' LIMIT 1`
    )
    if (existing.rows.length > 0) return  // admin already exists, skip

    const hash = await bcrypt.hash(senha, 12)
    await pool.query(
      `INSERT INTO usuarios (nome, cpf, email, senha_hash, role)
       VALUES ($1, '00000000001', $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [nome, email, hash]
    )
    console.log(`✓ Admin criado: ${email}`)
  } catch (err) {
    console.error('Erro ao criar admin inicial:', err.message)
  }
}

app.listen(PORT, async () => {
  console.log(`DamDidier API ✓ porta ${PORT}`)
  await seedAdmin()
})
