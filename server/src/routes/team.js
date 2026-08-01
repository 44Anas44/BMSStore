const router      = require('express').Router()
const TeamMember  = require('../models/TeamMember')
const verifyToken = require('../middleware/auth')
const { uploadTeam, cloudinary } = require('../lib/cloudinary')

// Public — frontend fetches active team members for About page
router.get('/', async (_, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1 })
    res.json(members)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — get all members including inactive
router.get('/all', verifyToken, async (_, res) => {
  try {
    res.json(await TeamMember.find().sort({ order: 1 }))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — create member
router.post('/', verifyToken, async (req, res) => {
  try {
    const count = await TeamMember.countDocuments()
    const member = await TeamMember.create({ ...req.body, order: count })
    res.status(201).json(member)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — update member
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!member) return res.status(404).json({ error: 'Not found' })
    res.json(member)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — upload/replace member photo
router.post('/:id/photo', verifyToken, uploadTeam.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const old = await TeamMember.findById(req.params.id)
    if (old?.photoId) {
      try { await cloudinary.uploader.destroy(old.photoId) } catch {}
    }
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { photo: req.file.path, photoId: req.file.filename },
      { new: true }
    )
    res.json({ url: req.file.path, member })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — reorder members
router.patch('/reorder', verifyToken, async (req, res) => {
  try {
    const { ids } = req.body  // array of member IDs in new order
    await Promise.all(ids.map((id, i) => TeamMember.findByIdAndUpdate(id, { order: i })))
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin — delete member (also removes photo from Cloudinary)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id)
    if (member?.photoId) {
      try { await cloudinary.uploader.destroy(member.photoId) } catch {}
    }
    await TeamMember.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
