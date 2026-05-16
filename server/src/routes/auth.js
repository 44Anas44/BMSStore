const router       = require('express').Router()
const verifyApiKey = require('../middleware/auth')
const fs           = require('fs')
const path         = require('path')
const bcrypt       = require('bcryptjs')
const jwt          = require('jsonwebtoken')

// POST /api/auth/login — web admin panel login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  const expectedUser = process.env.ADMIN_USERNAME || 'admin'
  const hash         = process.env.ADMIN_PASSWORD_HASH

  if (!hash) return res.status(500).json({ error: 'Admin credentials not configured on server' })

  if (username !== expectedUser) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
  res.json({ token })
})

// GET /api/auth/verify — apps call this on launch to confirm key is valid
router.get('/verify', verifyApiKey, (req, res) => {
  res.json({ ok: true, brand: ' ' })
})

// POST /api/auth/push-token — register or refresh an Expo push token
// The token is stored in server/.env as PUSH_TOKENS (JSON array).
// On a real server deployment, use a database instead; .env works for self-hosted setups.
router.post('/push-token', verifyApiKey, (req, res) => {
  const { token } = req.body
  if (!token || typeof token !== 'string') return res.status(400).json({ error: 'token required' })
  try {
    const envPath = path.join(__dirname, '../../.env')
    let envContent = fs.readFileSync(envPath, 'utf8')
    const existing = (() => { try { return JSON.parse(process.env.PUSH_TOKENS || '[]') } catch { return [] } })()
    if (!existing.includes(token)) {
      existing.push(token)
      const updated = JSON.stringify(existing)
      if (envContent.includes('PUSH_TOKENS=')) {
        envContent = envContent.replace(/^PUSH_TOKENS=.*/m, 'PUSH_TOKENS=' + updated)
      } else {
        envContent += '\nPUSH_TOKENS=' + updated + '\n'
      }
      fs.writeFileSync(envPath, envContent)
      process.env.PUSH_TOKENS = updated
    }
    res.json({ ok: true, registered: existing.length })
  } catch (e) {
    console.warn('Push token save failed:', e.message)
    res.json({ ok: true, note: 'token received but could not persist to .env' })
  }
})

module.exports = router
