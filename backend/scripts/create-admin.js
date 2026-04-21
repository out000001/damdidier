#!/usr/bin/env node
// Usage: node backend/scripts/create-admin.js <nome> <email> <senha>
require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool   = require('../database/pool')

async function main() {
  const [,, nome, email, senha] = process.argv
  if (!nome || !email || !senha) {
    console.error('Uso: node create-admin.js "Nome Completo" email@exemplo.com SenhaForte@1')
    process.exit(1)
  }
  if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha) || !/[^A-Za-z0-9]/.test(senha)) {
    console.error('Senha fraca. Use: mín 8 chars, maiúscula, número e caractere especial.')
    process.exit(1)
  }
  const hash = await bcrypt.hash(senha, 12)
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, cpf, email, senha_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', senha_hash = $4
       RETURNING id, email, role`,
      [nome, '00000000000', email, hash]
    )
    console.log('Admin criado/atualizado:', rows[0])
  } catch (err) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
