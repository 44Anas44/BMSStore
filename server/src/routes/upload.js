const router      = require('express').Router()
const verifyToken = require('../middleware/auth')
const { uploadProducts, uploadCategory, uploadBrand, cloudinary } = require('../lib/cloudinary')

// Product images (up to 5 at once) — admin only
router.post('/product-images', verifyToken, uploadProducts.array('images', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' })
  res.json(req.files.map(f => ({ url: f.path, public_id: f.filename })))
})

// Single product image
router.post('/product-image', verifyToken, uploadProducts.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: req.file.path, public_id: req.file.filename })
})

// Category image (single, square crop)
router.post('/category-image', verifyToken, uploadCategory.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: req.file.path, public_id: req.file.filename })
})

// Brand logo
router.post('/brand-image', verifyToken, uploadBrand.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: req.file.path, public_id: req.file.filename })
})

// Delete an image from Cloudinary by public_id
router.delete('/image/:public_id(*)', verifyToken, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.public_id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
