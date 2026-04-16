const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const pool = require('../database/pool')

// GET /api/users/me — profile + address + insurance
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, nome, cpf, nascimento, sexo, estado_civil, email, telefone, whatsapp,
              profissao, renda, possui_seguro, seguradora_atual, receber_ofertas, created_at
       FROM usuarios WHERE id = $1`,
      [req.user.id]
    )
    if (user.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' })

    const address = await pool.query(
      'SELECT cep, rua, numero, bairro, cidade, estado FROM enderecos WHERE usuario_id = $1',
      [req.user.id]
    )

    const insurance = await pool.query(
      'SELECT tipo_seguro FROM seguros_interesse WHERE usuario_id = $1',
      [req.user.id]
    )

    res.json({
      ...user.rows[0],
      endereco: address.rows[0] || null,
      seguros: insurance.rows.map(r => r.tipo_seguro),
    })
  } catch (err) {
    console.error('[users/me]', err)
    res.status(500).json({ message: 'Erro interno' })
  }
})

// PATCH /api/users/me — update profile
router.patch('/me', authenticate, async (req, res) => {
  const { nome, telefone, whatsapp, profissao, renda } = req.body
  try {
    await pool.query(
      `UPDATE usuarios SET nome=$1, telefone=$2, whatsapp=$3, profissao=$4, renda=$5 WHERE id=$6`,
      [nome, telefone?.replace(/\D/g,''), whatsapp?.replace(/\D/g,''), profissao, renda, req.user.id]
    )
    res.json({ message: 'Perfil atualizado' })
  } catch (err) {
    console.error('[users/me patch]', err)
    res.status(500).json({ message: 'Erro interno' })
  }
})

module.exports = router
