const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const pool = require('../database/pool')

function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== parseInt(clean[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === parseInt(clean[10])
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('nome').trim().isLength({ min: 3 }).withMessage('Nome inválido'),
    body('cpf').custom(v => {
      if (!validateCPF(v)) throw new Error('CPF inválido')
      return true
    }),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 8 }).withMessage('Senha mínima de 8 caracteres'),
    body('aceiteLGPD').equals('true').withMessage('Aceite os termos LGPD'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg, errors: errors.array() })
    }

    const { nome, cpf, nascimento, sexo, estadoCivil, email, telefone, whatsapp,
            cep, rua, numero, bairro, cidade, estado,
            tipoSeguro, profissao, renda, possuiSeguro, seguradoraAtual,
            senha, receberOfertas } = req.body

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Check duplicates
      const existing = await client.query(
        'SELECT id FROM usuarios WHERE email = $1 OR cpf = $2',
        [email, cpf.replace(/\D/g, '')]
      )
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK')
        return res.status(409).json({ message: 'Email ou CPF já cadastrado' })
      }

      const senhaHash = await bcrypt.hash(senha, 12)
      const nascimentoDate = nascimento
        ? nascimento.split('/').reverse().join('-')
        : null

      const userResult = await client.query(
        `INSERT INTO usuarios (nome, cpf, nascimento, sexo, estado_civil, email, telefone, whatsapp,
                               profissao, renda, possui_seguro, seguradora_atual, receber_ofertas, senha_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING id`,
        [
          nome.trim(),
          cpf.replace(/\D/g, ''),
          nascimentoDate,
          sexo || null,
          estadoCivil || null,
          email,
          telefone?.replace(/\D/g, '') || null,
          whatsapp?.replace(/\D/g, '') || null,
          profissao || null,
          renda || null,
          possuiSeguro === 'Sim',
          seguradoraAtual || null,
          receberOfertas === true,
          senhaHash,
        ]
      )
      const userId = userResult.rows[0].id

      // Address
      if (cep) {
        await client.query(
          `INSERT INTO enderecos (usuario_id, cep, rua, numero, bairro, cidade, estado)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [userId, cep.replace(/\D/g, ''), rua, numero, bairro, cidade, estado]
        )
      }

      // Insurance interest
      const seguros = Array.isArray(tipoSeguro) ? tipoSeguro : []
      for (const tipo of seguros) {
        await client.query(
          `INSERT INTO seguros_interesse (usuario_id, tipo_seguro) VALUES ($1,$2)`,
          [userId, tipo]
        )
      }

      await client.query('COMMIT')

      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
      res.status(201).json({ message: 'Conta criada com sucesso', token })
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('[register]', err)
      res.status(500).json({ message: 'Erro interno ao criar conta' })
    } finally {
      client.release()
    }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('senha').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ message: 'Dados inválidos' })

    const { email, senha } = req.body
    try {
      const result = await pool.query('SELECT id, email, senha_hash, nome FROM usuarios WHERE email = $1', [email])
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Credenciais inválidas' })
      }
      const user = result.rows[0]
      const match = await bcrypt.compare(senha, user.senha_hash)
      if (!match) return res.status(401).json({ message: 'Credenciais inválidas' })

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
      res.json({ token, nome: user.nome })
    } catch (err) {
      console.error('[login]', err)
      res.status(500).json({ message: 'Erro interno' })
    }
  }
)

// POST /api/auth/forgot-password
router.post('/forgot-password', body('email').isEmail().normalizeEmail(), async (req, res) => {
  // In production: generate reset token, send email via SES/SendGrid
  res.json({ message: 'Se o email estiver cadastrado, você receberá o link em breve' })
})

module.exports = router
