const jwt = require('jsonwebtoken')

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer:   'damdidier',
      audience: 'damdidier-app',
    })
    next()
  } catch (err) {
    const expired = err.name === 'TokenExpiredError'
    return res.status(401).json({
      message: expired ? 'Sessão expirada' : 'Token inválido',
      expired,
    })
  }
}
