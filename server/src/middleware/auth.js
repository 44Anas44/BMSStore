/**
 * Auth middleware — supports two modes:
 * 1. APP_KEY via X-App-Key header — used by desktop and mobile admin apps
 * 2. JWT via Authorization: Bearer <token> — used by the web admin panel
 */
const crypto = require('crypto')
const jwt    = require('jsonwebtoken')

module.exports = function verifyAuth(req, res, next) {
  // ── JWT path (web admin panel) ──────────────────────────────────────────────
  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET not configured' })
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
      req.admin = true
      return next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }

  // ── APP_KEY path (desktop + mobile apps) ───────────────────────────────────
  const key = req.headers['x-app-key']
  if (key) {
    if (!process.env.APP_KEY || process.env.APP_KEY === 'REPLACE_WITH_RANDOM_KEY') {
      console.error('APP_KEY not set in .env')
      return res.status(500).json({ error: 'Server not configured' })
    }
    const expected = Buffer.from(process.env.APP_KEY)
    const received = Buffer.from(key)
    if (expected.length !== received.length) return res.status(401).json({ error: 'Invalid API key' })
    if (!crypto.timingSafeEqual(expected, received)) return res.status(401).json({ error: 'Invalid API key' })
    req.admin = true
    return next()
  }

  return res.status(401).json({ error: 'Authentication required' })
}
