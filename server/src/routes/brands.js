const router      = require('express').Router()
const Brand       = require('../models/Brand')
const verifyToken = require('../middleware/auth')

router.get('/', async (_, res) => {
  try { res.json(await Brand.find()) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
router.post('/', verifyToken, async (req, res) => {
  try { res.status(201).json(await Brand.create(req.body)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
router.put('/:id', verifyToken, async (req, res) => {
  try { res.json(await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
router.delete('/:id', verifyToken, async (req, res) => {
  try { await Brand.findByIdAndDelete(req.params.id); res.json({ ok: true }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
module.exports = router
