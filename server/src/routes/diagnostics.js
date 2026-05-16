const router      = require('express').Router()
const Diagnostic  = require('../models/Diagnostic')
const verifyToken = require('../middleware/auth')
const { sendPushNotification } = require('../lib/mailer')

// Public — customer looks up their repair by orderId + code
router.get('/lookup', async (req, res) => {
  try {
    const { orderId, code } = req.query
    if (!orderId || !code) return res.status(400).json({ error: 'orderId and code required' })
    const d = await Diagnostic.findOne({ orderId: orderId.trim(), code: code.trim() })
    if (!d) return res.status(404).json({ error: 'No diagnostic found with these credentials' })
    res.json(d)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Public — customer confirms the price
router.patch('/confirm/:id', async (req, res) => {
  try {
    const { code } = req.body
    const d = await Diagnostic.findById(req.params.id)
    if (!d) return res.status(404).json({ error: 'Not found' })
    if (d.code !== code) return res.status(403).json({ error: 'Invalid code' })
    if (d.status !== 'problem_detected') return res.status(400).json({ error: 'Nothing to confirm yet' })
    d.priceConfirmed = true
    d.status = 'repairing'
    await d.save()
    try { await sendPushNotification({ title: '✅ Repair Confirmed', body: 'Order ' + d.orderId + ' — customer confirmed the repair price', data: { type: 'diagnostic', diagnosticId: String(d._id) } }) } catch (e) { console.warn('Diagnostic push failed:', e.message) }
    res.json(d)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — get all diagnostics
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    res.json(await Diagnostic.find(filter).sort({ updatedAt: -1 }))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — create diagnostic entry
router.post('/', verifyToken, async (req, res) => {
  try { res.status(201).json(await Diagnostic.create(req.body)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — update diagnostic
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const d = await Diagnostic.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!d) return res.status(404).json({ error: 'Not found' })
    res.json(d)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — delete
router.delete('/:id', verifyToken, async (req, res) => {
  try { await Diagnostic.findByIdAndDelete(req.params.id); res.json({ ok: true }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
