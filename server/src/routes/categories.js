const router      = require('express').Router()
const Category    = require('../models/Category')
const verifyToken = require('../middleware/auth')
const { uploadCategory, cloudinary } = require('../lib/cloudinary')

// All flat list
router.get('/', async (_, res) => {
  const cats = await Category.find().populate('parent', 'name').sort({ order: 1, name: 1 })
  res.json(cats)
})

// Root categories with images (for homepage)
router.get('/featured', async (_, res) => {
  const cats = await Category.find({ parent: null }).sort({ order: 1, name: 1 })
  res.json(cats)
})

// Nested tree
router.get('/tree', async (_, res) => {
  const cats = await Category.find().lean().sort({ order: 1, name: 1 })
  const build = (parentId = null) =>
    cats.filter(c => String(c.parent || null) === String(parentId))
        .map(c => ({ ...c, children: build(c._id) }))
  res.json(build())
})

// Create — with optional image file
router.post('/', verifyToken, uploadCategory.single('image'), async (req, res) => {
  const data = { ...req.body }
  if (!data.parent || data.parent === 'null') data.parent = null
  if (req.file) {
    data.image   = req.file.path
    data.imageId = req.file.filename
  }
  const c = await Category.create(data)
  res.status(201).json(c)
})

// Update — with optional new image
router.put('/:id', verifyToken, uploadCategory.single('image'), async (req, res) => {
  const data = { ...req.body }
  if (!data.parent || data.parent === 'null') data.parent = null
  if (req.file) {
    // Delete old image from Cloudinary if it exists
    const old = await Category.findById(req.params.id)
    if (old?.imageId) {
      try { await cloudinary.uploader.destroy(old.imageId) } catch {}
    }
    data.image   = req.file.path
    data.imageId = req.file.filename
  }
  const c = await Category.findByIdAndUpdate(req.params.id, data, { new: true })
  res.json(c)
})

// Delete — also remove image from Cloudinary
router.delete('/:id', verifyToken, async (req, res) => {
  const cat = await Category.findById(req.params.id)
  if (cat?.imageId) {
    try { await cloudinary.uploader.destroy(cat.imageId) } catch {}
  }
  await Category.deleteMany({ parent: req.params.id })
  await Category.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

module.exports = router
