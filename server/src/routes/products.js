const router      = require('express').Router()
const Product     = require('../models/Product')
const verifyToken = require('../middleware/auth')
const { uploadProducts } = require('../lib/cloudinary')

router.get('/', async (req, res) => {
  const { category, brand, minPrice, maxPrice, sort, search, isPromo, all, page = 1, limit = 20 } = req.query
  const filter = all === 'true' ? {} : { isSecondHand: { $ne: true } }
  if (category) filter.category = category
  if (brand) filter.brand = brand
  if (isPromo === 'true') filter.isPromo = true
  if (minPrice || maxPrice) filter.price = {}
  if (minPrice) filter.price.$gte = +minPrice
  if (maxPrice) filter.price.$lte = +maxPrice
  if (search) filter.name = { $regex: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }

  const sortMap = {
    'price-asc':  { price: 1 },
    'price-desc': { price: -1 },
    'newest':     { createdAt: -1 },
    'popular':    { sold: -1 },
    'default':    { createdAt: -1 }
  }
  const sortObj = sortMap[sort] || sortMap.default
  const skip = (+page - 1) * +limit
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(+limit)
      .populate('category', 'name').populate('brand', 'name'),
    Product.countDocuments(filter)
  ])
  res.json({ products, total, pages: Math.ceil(total / +limit) })
})

// Latest — most recently added (regardless of flags)
router.get('/latest', async (_, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(10)
    .populate('category', 'name').populate('brand', 'name')
  res.json(products)
})

router.get('/featured', async (_, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8)
    .populate('category', 'name').populate('brand', 'name')
  res.json(products)
})
router.get('/promos', async (_, res) => {
  const products = await Product.find({ isPromo: true }).limit(8)
    .populate('category', 'name').populate('brand', 'name')
  res.json(products)
})
router.get('/newest', async (_, res) => {
  const products = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(8)
    .populate('category', 'name').populate('brand', 'name')
  res.json(products)
})
router.get('/popular', async (_, res) => {
  const products = await Product.find().sort({ sold: -1 }).limit(8)
    .populate('category', 'name').populate('brand', 'name')
  res.json(products)
})
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id)
    .populate('category').populate('brand')
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})
router.post('/', verifyToken, async (req, res) => {
  try {
    const body = { ...req.body }
    if (!body.category || body.category === '') delete body.category
    if (!body.brand || body.brand === '') delete body.brand
    if (!body.comparePrice || body.comparePrice === '') delete body.comparePrice
    const p = await Product.create(body)
    res.status(201).json(p)
  } catch (err) {
    console.error('Product create error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const body = { ...req.body }
    if (!body.category || body.category === '') body.category = null
    if (!body.brand || body.brand === '') body.brand = null
    if (!body.comparePrice || body.comparePrice === '') body.comparePrice = null
    const p = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json(p)
  } catch (err) {
    console.error('Product update error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
