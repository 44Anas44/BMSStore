const router        = require('express').Router()
const AboutSettings = require('../models/AboutSettings')
const verifyToken   = require('../middleware/auth')
const { uploadAbout, cloudinary } = require('../lib/cloudinary')

// Public — frontend fetches the hero image for the About page
router.get('/', async (_, res) => {
  try {
    const settings = await AboutSettings.getSingleton()
    res.json(settings)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — upload/replace hero image
router.post('/hero-image', verifyToken, uploadAbout.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const old = await AboutSettings.getSingleton()
    if (old?.heroImageId) {
      try { await cloudinary.uploader.destroy(old.heroImageId) } catch {}
    }
    const settings = await AboutSettings.findByIdAndUpdate(
      old._id,
      { heroImage: req.file.path, heroImageId: req.file.filename },
      { new: true }
    )
    res.json({ url: req.file.path, settings })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — remove hero image (revert to placeholder)
router.delete('/hero-image', verifyToken, async (req, res) => {
  try {
    const settings = await AboutSettings.getSingleton()
    if (settings.heroImageId) {
      try { await cloudinary.uploader.destroy(settings.heroImageId) } catch {}
    }
    settings.heroImage = ''
    settings.heroImageId = ''
    await settings.save()
    res.json({ ok: true, settings })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
