const router      = require('express').Router()
const verifyToken = require('../middleware/auth')
const Product     = require('../models/Product')
const Order       = require('../models/Order')
const Category    = require('../models/Category')
const Brand       = require('../models/Brand')

router.get('/dashboard', verifyToken, async (_, res) => {
  const [products, orders, categories, brands, orderStats] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Category.countDocuments(),
    Brand.countDocuments(),
    Order.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: -1 } }, { $limit: 30 }
    ])
  ])
  res.json({ products, orders, categories, brands, orderStats: orderStats.reverse() })
})

module.exports = router
