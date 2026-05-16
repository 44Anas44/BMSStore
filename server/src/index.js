require('dotenv').config()
require('express-async-errors')
const express      = require('express')
const cors         = require('cors')
const morgan       = require('morgan')
const helmet       = require('helmet')
const compression  = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const mongoose     = require('mongoose')

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS — allow store frontend + admin apps (desktop + mobile) ───────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',').map(o => o.trim())

app.use((req, res, next) => {
  const origin = req.headers.origin
  // Allow configured web origins with credentials, all others (mobile apps) without
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  } else {
    // Mobile apps and other clients — allow all origins, no credentials needed
    res.header('Access-Control-Allow-Origin', '*')
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-App-Key')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ── Compression — gzip all responses ─────────────────────────────────────────
app.use(compression())

// ── Body parsing with size limit ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))

// ── Sanitize request body/query/params — strips $ and . operators ─────────────
app.use(mongoSanitize({ replaceWith: '_' }))

// ── Request logging ───────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Core routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'))
app.use('/api/products',   require('./routes/products'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/brands',     require('./routes/brands'))
app.use('/api/slides',     require('./routes/slides'))
app.use('/api/orders',     require('./routes/orders'))
app.use('/api/upload',     require('./routes/upload'))
app.use('/api/admin',      require('./routes/admin'))

// ── Optional feature routes ────────────────────────────────────────────────────
try { app.use('/api/secondhand',  require('./routes/secondhand'))  } catch(e) {}
try { app.use('/api/diagnostics', require('./routes/diagnostics')) } catch(e) {}

app.get('/api/health', (_, res) => res.json({ ok: true }))

// ── Global error handler — never leak stack traces in production ──────────────
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message)
  if (process.env.NODE_ENV !== 'production') console.error(err.stack)
  const status = err.status || 500
  res.status(status).json({ error: status < 500 ? err.message : 'Internal server error' })
})

// ── Database + server start ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log('Server running on http://localhost:' + process.env.PORT))
  })
  .catch(err => { console.error('MongoDB connection error:', err.message); process.exit(1) })
