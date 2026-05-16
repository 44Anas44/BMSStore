const router      = require('express').Router()
const Slide       = require('../models/Slide')
const verifyToken = require('../middleware/auth')
const { uploadProducts } = require('../lib/cloudinary')  // reuse product storage for slides

// Public — frontend fetches slides to render hero
router.get('/', async (_, res) => {
  try {
    const slides = await Slide.find({ isActive: true }).sort({ order: 1 })
    res.json(slides)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — get all slides including inactive
router.get('/all', verifyToken, async (_, res) => {
  try {
    res.json(await Slide.find().sort({ order: 1 }))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — create slide
router.post('/', verifyToken, async (req, res) => {
  try {
    const count = await Slide.countDocuments()
    const slide = await Slide.create({ ...req.body, order: count })
    res.status(201).json(slide)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — update slide
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!slide) return res.status(404).json({ error: 'Not found' })
    res.json(slide)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — upload single slide image (legacy / default)
router.post('/:id/image', verifyToken, uploadProducts.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const slide = await Slide.findByIdAndUpdate(
      req.params.id,
      { imageUrl: req.file.path, imagePublicId: req.file.filename },
      { new: true }
    )
    res.json({ url: req.file.path, slide })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — upload breakpoint-specific image (mobile | tablet | desktop)
router.post('/:id/image/:breakpoint', verifyToken, uploadProducts.single('image'), async (req, res) => {
  try {
    const { id, breakpoint } = req.params
    if (!['mobile','tablet','desktop'].includes(breakpoint)) {
      return res.status(400).json({ error: 'Breakpoint must be mobile, tablet, or desktop' })
    }
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const update = {}
    update[`images.${breakpoint}.url`]      = req.file.path
    update[`images.${breakpoint}.publicId`] = req.file.filename
    const slide = await Slide.findByIdAndUpdate(id, { $set: update }, { new: true })
    if (!slide) return res.status(404).json({ error: 'Slide not found' })
    res.json({ url: req.file.path, breakpoint, slide })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — reorder slides
router.patch('/reorder', verifyToken, async (req, res) => {
  try {
    const { ids } = req.body  // array of slide IDs in new order
    await Promise.all(ids.map((id, i) => Slide.findByIdAndUpdate(id, { order: i })))
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — delete slide
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Slide.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
