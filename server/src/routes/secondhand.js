const router  = require('express').Router()
const Product = require('../models/Product')

// Public — list second-hand products with filters
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, sort, search, page=1, limit=20 } = req.query
    const filter = { isSecondHand: true }
    if (category) filter.category = category
    if (brand)    filter.brand    = brand
    if (minPrice || maxPrice) filter.price = {}
    if (minPrice) filter.price.$gte = +minPrice
    if (maxPrice) filter.price.$lte = +maxPrice
    if (search)   filter.$text = { $search: search }
    const sortMap = { 'price-asc':{ price:1 }, 'price-desc':{ price:-1 }, 'newest':{ createdAt:-1 }, default:{ createdAt:-1 } }
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort]||sortMap.default).skip((+page-1)*+limit).limit(+limit)
        .populate('category','name').populate('brand','name'),
      Product.countDocuments(filter)
    ])
    res.json({ products, total, pages: Math.ceil(total/+limit) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
