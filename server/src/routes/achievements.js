const router      = require('express').Router()
const Achievement = require('../models/Achievement')
const verifyToken = require('../middleware/auth')
const { uploadAchievement, cloudinary } = require('../lib/cloudinary')

// Public — frontend fetches active achievements for the Blog page
router.get('/', async (_, res) => {
  try {
    const items = await Achievement.find({ isActive: true }).sort({ order: 1, date: -1 })
    res.json(items)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — get all achievements including inactive
router.get('/all', verifyToken, async (_, res) => {
  try {
    res.json(await Achievement.find().sort({ order: 1, date: -1 }))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — create achievement
router.post('/', verifyToken, async (req, res) => {
  try {
    const count = await Achievement.countDocuments()
    const item = await Achievement.create({ ...req.body, order: count })
    res.status(201).json(item)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — update achievement
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const item = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — upload/replace achievement image
router.post('/:id/image', verifyToken, uploadAchievement.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const old = await Achievement.findById(req.params.id)
    if (old?.imageId) {
      try { await cloudinary.uploader.destroy(old.imageId) } catch {}
    }
    const item = await Achievement.findByIdAndUpdate(
      req.params.id,
      { image: req.file.path, imageId: req.file.filename },
      { new: true }
    )
    res.json({ url: req.file.path, item })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — reorder achievements
router.patch('/reorder', verifyToken, async (req, res) => {
  try {
    const { ids } = req.body  // array of achievement IDs in new order
    await Promise.all(ids.map((id, i) => Achievement.findByIdAndUpdate(id, { order: i })))
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — delete achievement (also removes image from Cloudinary)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const item = await Achievement.findById(req.params.id)
    if (item?.imageId) {
      try { await cloudinary.uploader.destroy(item.imageId) } catch {}
    }
    await Achievement.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
