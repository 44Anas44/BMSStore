const router      = require('express').Router()
const Order       = require('../models/Order')
const Product     = require('../models/Product')
const verifyToken = require('../middleware/auth')
const { sendOrderEmail, sendOutOfStockEmail, sendLowStockEmail, sendPushNotification } = require('../lib/mailer')

router.get('/', verifyToken, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const filter = status ? { status } : {}
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 })
      .skip((+page - 1) * +limit).limit(+limit)
      .populate('items.product', 'name'),
    Order.countDocuments(filter)
  ])
  res.json({ orders, total })
})

router.post('/', async (req, res) => {
  const { items } = req.body
  // Validate and clamp quantities to available stock
  const adjustedItems = []
  const warnings = []
  for (const item of (items || [])) {
    if (!item.product) { adjustedItems.push(item); continue }
    const product = await Product.findById(item.product)
    if (!product) { adjustedItems.push(item); continue }
    if (product.stock <= 0) {
      warnings.push(item.name + ' is out of stock and was removed from your order')
      continue // skip out-of-stock items
    }
    const safeQty = Math.min(item.qty, product.stock)
    if (safeQty < item.qty) warnings.push(item.name + ': quantity reduced to ' + safeQty + ' (available stock)')
    adjustedItems.push({ ...item, qty: safeQty })
  }
  if (adjustedItems.length === 0) return res.status(400).json({ error: 'All items are out of stock', warnings })
  const order = await Order.create({ ...req.body, items: adjustedItems, warnings })
  // Decrement stock and send alerts
  const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || 5)
  for (const item of order.items) {
    if (item.product) {
      const updated = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { sold: item.qty, stock: -item.qty } },
        { new: true }
      )
      if (updated) {
        try {
          if (updated.stock === 0) {
            await sendOutOfStockEmail(updated)
          } else if (updated.stock <= threshold) {
            await sendLowStockEmail(updated, updated.stock)
          }
        } catch (e) { console.warn('Stock alert email failed:', e.message) }
        // Push notification for stock alerts
        try {
          if (updated.stock === 0) {
            await sendPushNotification({ title: '🚨 Out of Stock', body: updated.name + ' is now out of stock', data: { type: 'stock', productId: String(updated._id) } })
          } else if (updated.stock <= threshold) {
            await sendPushNotification({ title: '⚠️ Low Stock Alert', body: updated.name + ' — only ' + updated.stock + ' left', data: { type: 'stock', productId: String(updated._id) } })
          }
        } catch (e) { console.warn('Stock push failed:', e.message) }
      }
    }
  }
  try { await sendOrderEmail(order) } catch (e) { console.warn('Email failed:', e.message) }
  try { await sendPushNotification({ title: '🛒 New Order', body: order.customer.name + ' placed an order · ' + order.total.toFixed(2) + ' TND', data: { type: 'order', orderId: String(order._id) } }) } catch (e) { console.warn('Order push failed:', e.message) }
  res.status(201).json(order)
})

router.patch('/:id/status', verifyToken, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true }
  )
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json(order)
})

router.get('/stats', verifyToken, async (_, res) => {
  const [total, byStatus, revenue, topProducts] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, sold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price','$items.qty'] } } } },
      { $sort: { sold: -1 } }, { $limit: 5 }
    ])
  ])
  res.json({ total, byStatus, revenue: revenue[0]?.total || 0, topProducts })
})

module.exports = router
