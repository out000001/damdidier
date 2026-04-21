const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const pool = require('../database/pool')

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCESS_TTL        = '15m'           // access token: 15 minutes
const REFRESH_TTL_MS    = 7 * 24 * 3600 * 1000  // refresh token: 7 days
const MAX_ATTEMPTS      = 5              // failed logins before lockout
const LOCKOUT_MINUTES   = 15

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateCPF(cpf) {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i)
  let r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== +c[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i)
  r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === +c[10]
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

function issueAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL, issuer: 'damdidier', audience: 'damdidier-app' }
  )
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TTL_MS,
    path: '/api/auth',
  })
}

async function auditLog(client, { userId, event, ip, ua, detail }) {
  await client.query(
    `INSERT INTO audit_log (usuario_id, event, ip_address, user_agent, detail)
     VALUES ($1,$2,$3::inet,$4,$5)`,
    [userId || null, event, ip || null, ua || null, detail ? JSON.stringify(detail) : null]
  ).catch(() => {}) // never block main flow for audit failure
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('nome').trim().isLength({ min: 3, max: 200 }),
    body('cpf').custom(v => { if (!validateCPF(v)) throw new Error('CPF inválido'); return true }),
    body('email').isEmail().normalizeEmail(),
    body('senha')
      .isLength({ min: 8, max: 72 })
      .matches(/[A-Z]/).withMessage('Senha deve conter ao menos uma letra maiúscula')
      .matches(/[0-9]/).withMessage('Senha deve conter ao menos um número')
      .matches(/[^A-Za-z0-9]/).withMessage('Senha deve conter ao menos um caractere especial'),
    body('aceiteLGPD').equals('true').withMessage('Aceite os termos LGPD'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }

    const {
      nome, cpf, nascimento, sexo, estadoCivil, email, telefone, whatsapp,
      cep, rua, numero, bairro, cidade, estado,
      tipoSeguro, profissao, renda, possuiSeguro, seguradoraAtual,
      senha, receberOfertas,
    } = req.body

    const ip = req.ip
    const ua = req.get('user-agent')
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const existing = await client.query(
        'SELECT id FROM usuarios WHERE email=$1 OR cpf=$2',
        [email, cpf.replace(/\D/g, '')]
      )
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK')
        // Ambiguous message to prevent user enumeration
        return res.status(409).json({ message: 'Dados já cadastrados no sistema' })
      }

      const senhaHash = await bcrypt.hash(senha, 12)
      const nascDate  = nascimento ? nascimento.split('/').reverse().join('-') : null

      const { rows: [user] } = await client.query(
        `INSERT INTO usuarios
           (nome,cpf,nascimento,sexo,estado_civil,email,telefone,whatsapp,
            profissao,renda,possui_seguro,seguradora_atual,receber_ofertas,senha_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING id, email`,
        [
          nome.trim(), cpf.replace(/\D/g,''), nascDate, sexo||null, estadoCivil||null,
          email, telefone?.replace(/\D/g,'')||null, whatsapp?.replace(/\D/g,'')||null,
          profissao||null, renda||null, possuiSeguro==='Sim',
          seguradoraAtual||null, receberOfertas===true, senhaHash,
        ]
      )

      if (cep) {
        await client.query(
          `INSERT INTO enderecos (usuario_id,cep,rua,numero,bairro,cidade,estado)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [user.id, cep.replace(/\D/g,''), rua, numero, bairro, cidade, estado]
        )
      }

      const seguros = Array.isArray(tipoSeguro) ? tipoSeguro : []
      for (const tipo of seguros) {
        await client.query(
          `INSERT INTO seguros_interesse (usuario_id,tipo_seguro) VALUES ($1,$2)`,
          [user.id, tipo]
        )
      }

      // Issue tokens
      const accessToken  = issueAccessToken(user)
      const refreshToken = generateRefreshToken()
      const expiresAt    = new Date(Date.now() + REFRESH_TTL_MS)

      await client.query(
        `INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at, user_agent, ip_address)
         VALUES ($1,$2,$3,$4,$5::inet)`,
        [user.id, hashToken(refreshToken), expiresAt, ua, ip || null]
      )

      await auditLog(client, { userId: user.id, event: 'REGISTER', ip, ua })
      await client.query('COMMIT')

      setRefreshCookie(res, refreshToken)
      res.status(201).json({ accessToken, expiresIn: 900 })
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('[register]', err.message)
      res.status(500).json({ message: 'Erro interno ao criar conta' })
    } finally {
      client.release()
    }
  }
)

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('senha').notEmpty().isLength({ max: 72 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ message: 'Dados inválidos' })

    const { email, senha } = req.body
    const ip = req.ip
    const ua = req.get('user-agent')
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const { rows } = await client.query(
        `SELECT id, email, nome, senha_hash, failed_attempts, locked_until
         FROM usuarios WHERE email=$1`,
        [email]
      )

      // Always use same generic message to prevent user enumeration
      const INVALID = { message: 'Credenciais inválidas' }

      if (rows.length === 0) {
        // Still run bcrypt to prevent timing attacks
        await bcrypt.compare(senha, '$2a$12$invalidhashpaddingtopreventinitialfasttimingxx')
        await auditLog(client, { userId: null, event: 'LOGIN_FAIL', ip, ua, detail: { email } })
        await client.query('ROLLBACK')
        return res.status(401).json(INVALID)
      }

      const user = rows[0]

      // Lockout check
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const remaining = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000)
        await client.query('ROLLBACK')
        return res.status(429).json({
          message: `Conta bloqueada. Tente novamente em ${remaining} minuto(s).`,
        })
      }

      const match = await bcrypt.compare(senha, user.senha_hash)

      if (!match) {
        const attempts = user.failed_attempts + 1
        const lockUntil = attempts >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60000)
          : null

        await client.query(
          `UPDATE usuarios SET failed_attempts=$1, locked_until=$2 WHERE id=$3`,
          [attempts, lockUntil, user.id]
        )
        await auditLog(client, { userId: user.id, event: 'LOGIN_FAIL', ip, ua, detail: { attempts } })
        await client.query('COMMIT')

        if (lockUntil) {
          return res.status(429).json({
            message: `Muitas tentativas. Conta bloqueada por ${LOCKOUT_MINUTES} minutos.`,
          })
        }
        return res.status(401).json(INVALID)
      }

      // Reset lockout on success
      await client.query(
        `UPDATE usuarios SET failed_attempts=0, locked_until=NULL,
                             last_login_at=NOW(), last_login_ip=$1::inet
         WHERE id=$2`,
        [ip || null, user.id]
      )

      // Revoke previous refresh tokens for this user+device (single-session per device)
      await client.query(
        `UPDATE refresh_tokens SET revoked=TRUE
         WHERE usuario_id=$1 AND user_agent=$2 AND revoked=FALSE`,
        [user.id, ua]
      )

      const accessToken  = issueAccessToken(user)
      const refreshToken = generateRefreshToken()
      const expiresAt    = new Date(Date.now() + REFRESH_TTL_MS)

      await client.query(
        `INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at, user_agent, ip_address)
         VALUES ($1,$2,$3,$4,$5::inet)`,
        [user.id, hashToken(refreshToken), expiresAt, ua, ip || null]
      )

      await auditLog(client, { userId: user.id, event: 'LOGIN_OK', ip, ua })
      await client.query('COMMIT')

      setRefreshCookie(res, refreshToken)
      res.json({ accessToken, expiresIn: 900, nome: user.nome })
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('[login]', err.message)
      res.status(500).json({ message: 'Erro interno' })
    } finally {
      client.release()
    }
  }
)

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ message: 'Sessão expirada' })

  const ip = req.ip
  const ua = req.get('user-agent')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `SELECT rt.id, rt.usuario_id, rt.expires_at, rt.revoked,
              u.email, u.failed_attempts, u.locked_until
       FROM refresh_tokens rt
       JOIN usuarios u ON u.id = rt.usuario_id
       WHERE rt.token_hash=$1`,
      [hashToken(token)]
    )

    if (rows.length === 0 || rows[0].revoked) {
      // Token reuse detected — revoke ALL tokens for this user (token theft)
      if (rows.length > 0) {
        await client.query(
          `UPDATE refresh_tokens SET revoked=TRUE WHERE usuario_id=$1`,
          [rows[0].usuario_id]
        )
        await auditLog(client, { userId: rows[0].usuario_id, event: 'TOKEN_REUSE_DETECTED', ip, ua })
      }
      await client.query('COMMIT')
      res.clearCookie('refresh_token', { path: '/api/auth' })
      return res.status(401).json({ message: 'Sessão inválida. Faça login novamente.' })
    }

    const rt = rows[0]

    if (new Date(rt.expires_at) < new Date()) {
      await client.query(
        `UPDATE refresh_tokens SET revoked=TRUE WHERE id=$1`, [rt.id]
      )
      await client.query('COMMIT')
      res.clearCookie('refresh_token', { path: '/api/auth' })
      return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' })
    }

    // Rotate refresh token (one-time use)
    await client.query(`UPDATE refresh_tokens SET revoked=TRUE WHERE id=$1`, [rt.id])

    const newRefresh = generateRefreshToken()
    const expiresAt  = new Date(Date.now() + REFRESH_TTL_MS)

    await client.query(
      `INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1,$2,$3,$4,$5::inet)`,
      [rt.usuario_id, hashToken(newRefresh), expiresAt, ua, ip || null]
    )

    const accessToken = issueAccessToken({ id: rt.usuario_id, email: rt.email })
    await client.query('COMMIT')

    setRefreshCookie(res, newRefresh)
    res.json({ accessToken, expiresIn: 900 })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[refresh]', err.message)
    res.status(500).json({ message: 'Erro interno' })
  } finally {
    client.release()
  }
})

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refresh_token
  const ip = req.ip
  const ua = req.get('user-agent')

  if (token) {
    const client = await pool.connect()
    try {
      const { rows } = await client.query(
        `UPDATE refresh_tokens SET revoked=TRUE WHERE token_hash=$1 RETURNING usuario_id`,
        [hashToken(token)]
      )
      if (rows[0]) await auditLog(client, { userId: rows[0].usuario_id, event: 'LOGOUT', ip, ua })
    } catch (err) {
      console.error('[logout]', err.message)
    } finally {
      client.release()
    }
  }

  res.clearCookie('refresh_token', { path: '/api/auth' })
  res.json({ message: 'Sessão encerrada' })
})

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post(
  '/forgot-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    // Always respond the same way — prevents email enumeration
    const GENERIC = { message: 'Se o email estiver cadastrado, você receberá o link em breve.' }

    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.json(GENERIC)

    const { email } = req.body
    try {
      const { rows } = await pool.query('SELECT id FROM usuarios WHERE email=$1', [email])
      if (rows.length > 0) {
        const resetToken  = crypto.randomBytes(32).toString('hex')
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        await pool.query(
          `UPDATE usuarios SET reset_token=$1, reset_expiry=$2 WHERE id=$3`,
          [hashToken(resetToken), resetExpiry, rows[0].id]
        )
        // TODO: send email via SES/SendGrid with resetToken
      }
    } catch (err) {
      console.error('[forgot-password]', err.message)
    }

    res.json(GENERIC)
  }
)

module.exports = router
