const express  = require('express')
const router   = express.Router()
const pool     = require('../database/pool')
const authenticate   = require('../middleware/auth')
const { requireAdmin } = require('../middleware/security')

// All admin routes require valid JWT + admin role
router.use(authenticate, requireAdmin)

// GET /api/admin/usuarios — paginated list
router.get('/usuarios', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const offset = (page - 1) * limit
  const search = req.query.search ? `%${req.query.search}%` : null

  try {
    const where = search
      ? `WHERE u.nome ILIKE $3 OR u.email ILIKE $3 OR u.cpf LIKE $3`
      : ''
    const params = search ? [limit, offset, search] : [limit, offset]

    const { rows } = await pool.query(
      `SELECT u.id, u.nome, u.email,
              CONCAT(SUBSTRING(u.cpf,1,3),'.***.***-**') AS cpf_mascarado,
              u.telefone, u.whatsapp, u.profissao, u.renda,
              u.possui_seguro, u.seguradora_atual, u.receber_ofertas,
              u.last_login_at, u.created_at,
              e.cidade, e.estado
       FROM usuarios u
       LEFT JOIN enderecos e ON e.usuario_id = u.id
       ${where}
       WHERE u.role = 'user'
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    )

    const total = await pool.query(
      `SELECT COUNT(*) FROM usuarios u ${where} WHERE u.role = 'user'`,
      search ? [search] : []
    )

    res.json({
      data: rows,
      total: parseInt(total.rows[0].count),
      page,
      pages: Math.ceil(parseInt(total.rows[0].count) / limit),
    })
  } catch (err) {
    console.error('[admin/usuarios]', err.message)
    res.status(500).json({ message: 'Erro interno' })
  }
})

// GET /api/admin/usuarios/:id — full profile
router.get('/usuarios/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' })

  try {
    const user = await pool.query(
      `SELECT id, nome, cpf, nascimento, sexo, estado_civil,
              email, telefone, whatsapp, profissao, renda,
              possui_seguro, seguradora_atual, receber_ofertas,
              email_verificado, last_login_at, last_login_ip, created_at
       FROM usuarios WHERE id = $1 AND role = 'user'`,
      [id]
    )
    if (!user.rows.length) return res.status(404).json({ message: 'Usuário não encontrado' })

    const address = await pool.query(
      `SELECT cep, rua, numero, bairro, cidade, estado FROM enderecos WHERE usuario_id = $1`,
      [id]
    )

    const logins = await pool.query(
      `SELECT event, ip_address, created_at FROM audit_log
       WHERE usuario_id = $1 AND event IN ('LOGIN_OK','LOGIN_FAIL')
       ORDER BY created_at DESC LIMIT 10`,
      [id]
    )

    res.json({
      ...user.rows[0],
      endereco: address.rows[0] || null,
      historico_login: logins.rows,
    })
  } catch (err) {
    console.error('[admin/usuarios/:id]', err.message)
    res.status(500).json({ message: 'Erro interno' })
  }
})

// GET /api/admin/stats — dashboard numbers
router.get('/stats', async (req, res) => {
  try {
    const [total, hoje, semana] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM usuarios WHERE role='user'`),
      pool.query(`SELECT COUNT(*) FROM usuarios WHERE role='user' AND created_at >= CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM usuarios WHERE role='user' AND created_at >= NOW() - INTERVAL '7 days'`),
    ])
    res.json({
      total:  parseInt(total.rows[0].count),
      hoje:   parseInt(hoje.rows[0].count),
      semana: parseInt(semana.rows[0].count),
    })
  } catch (err) {
    console.error('[admin/stats]', err.message)
    res.status(500).json({ message: 'Erro interno' })
  }
})

module.exports = router
