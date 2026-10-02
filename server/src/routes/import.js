const router     = require('express').Router()
const verifyAuth = require('../middleware/auth')
const Product    = require('../models/Product')
const Category   = require('../models/Category')
const Brand      = require('../models/Brand')

const MAX_PRODUCTS = 1000
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const ci  = name => new RegExp('^' + esc(name) + '$', 'i')

// Original description generated from spec facts (never copied marketing text)
function buildDescription(title, specs) {
  const entries = Object.entries(specs || {}).slice(0, 12)
  if (!entries.length) return `${title}. Contactez-nous pour plus de détails.`
  const lines = entries.map(([k, v]) => `• ${k} : ${v}`).join('\n')
  return `${title}\n\nCaractéristiques principales :\n${lines}\n\nGarantie et livraison partout en Tunisie. Contactez BMS IT pour plus d'informations.`
}

function cleanSpecs(specs) {
  const out = {}
  if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
    for (const [k, v] of Object.entries(specs).slice(0, 12)) {
      if (typeof k === 'string' && typeof v === 'string') out[k.slice(0, 80)] = v.slice(0, 200)
    }
  }
  return out
}

// POST /api/import/products — admin only
// body: { products:[{title,price,specs?}], categoryName?, brandName?, margin?, stock?,
//         exclude?:[words], updateExisting?, dryRun? }
router.post('/products', verifyAuth, async (req, res) => {
  const b = req.body || {}
  const { products } = b
  if (!Array.isArray(products) || !products.length) return res.status(400).json({ error: 'products array required' })
  if (products.length > MAX_PRODUCTS) return res.status(400).json({ error: `Max ${MAX_PRODUCTS} products per import` })

  const categoryName = (typeof b.categoryName === 'string' && b.categoryName.trim()) || 'Dell'
  const brandName    = (typeof b.brandName === 'string' && b.brandName.trim()) || 'Dell'
  if (categoryName.length > 80 || brandName.length > 80) return res.status(400).json({ error: 'Name too long' })

  const margin = Number(b.margin ?? 0)
  if (!Number.isFinite(margin) || margin < -50 || margin > 300) return res.status(400).json({ error: 'margin must be between -50 and 300' })
  const stock = Math.max(0, parseInt(b.stock) || 0)
  const updateExisting = b.updateExisting === true
  const dryRun = b.dryRun === true
  const exclude = (Array.isArray(b.exclude) ? b.exclude : []).map(s => String(s).trim().toLowerCase()).filter(Boolean)

  // ── Category + brand: find, or create when missing ─────────────────────────
  let category = await Category.findOne({ name: ci(categoryName) })
  let categoryCreated = false
  if (!category && !dryRun) {
    try { category = await Category.create({ name: categoryName }); categoryCreated = true }
    catch (e) { category = await Category.findOne({ slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }) || null; if (!category) throw e }
  } else if (!category) categoryCreated = true // dry run: would be created

  let brand = await Brand.findOne({ name: ci(brandName) })
  let brandCreated = false
  if (!brand && !dryRun) { brand = await Brand.create({ name: brandName }); brandCreated = true }
  else if (!brand) brandCreated = true

  // ── Sort incoming rows into create / update / skip ─────────────────────────
  const titles = products.map(p => (typeof p?.title === 'string' ? p.title.trim() : '')).filter(Boolean)
  const existing = new Map((await Product.find({ name: { $in: titles } }, '_id name price')).map(p => [p.name, p]))

  const seen = new Set()
  const toCreate = [], toUpdate = []
  let invalid = 0, excluded = 0, skipped = 0

  for (const p of products) {
    const title = typeof p?.title === 'string' ? p.title.trim() : ''
    const price = Number(p?.price)
    if (!title || title.length > 200 || !Number.isFinite(price) || price <= 0) { invalid++; continue }
    if (seen.has(title)) { skipped++; continue }
    seen.add(title)
    if (exclude.some(w => title.toLowerCase().includes(w))) { excluded++; continue }

    const finalPrice = Math.round(price * (1 + margin / 100) * 1000) / 1000
    const ex = existing.get(title)
    if (ex) {
      if (updateExisting && ex.price !== finalPrice) toUpdate.push({ id: ex._id, price: finalPrice })
      else skipped++
      continue
    }
    toCreate.push({
      name: title,
      description: buildDescription(title, cleanSpecs(p.specs)),
      price: finalPrice,
      images: [],
      stock,
      isSecondHand: false,
      ...(category && { category: category._id }),
      ...(brand && { brand: brand._id }),
    })
  }

  // ── Write ──────────────────────────────────────────────────────────────────
  if (!dryRun) {
    if (toCreate.length) await Product.insertMany(toCreate, { ordered: false })
    for (const u of toUpdate) await Product.updateOne({ _id: u.id }, { $set: { price: u.price } })
    // existing products imported again also get the category / brand if they had none
    const ids = [...existing.values()].map(p => p._id)
    if (ids.length && category) await Product.updateMany({ _id: { $in: ids }, $or: [{ category: null }, { category: { $exists: false } }] }, { $set: { category: category._id } })
    if (ids.length && brand)    await Product.updateMany({ _id: { $in: ids }, $or: [{ brand: null }, { brand: { $exists: false } }] },    { $set: { brand: brand._id } })
  }

  res.json({
    dryRun,
    created: toCreate.length,
    updated: toUpdate.length,
    skipped, excluded, invalid,
    categoryCreated, brandCreated,
    category: categoryName,
    sample: toCreate.slice(0, 5).map(p => ({ name: p.name, price: p.price })),
  })
})

// DELETE /api/import/products — admin only
// Removes products of one category that have NO images and were never sold.
// body: { categoryName, onlyWithoutImages? (default true), dryRun?, confirm:'DELETE' }
router.delete('/products', verifyAuth, async (req, res) => {
  const b = req.body || {}
  const name = typeof b.categoryName === 'string' ? b.categoryName.trim() : ''
  if (!name) return res.status(400).json({ error: 'categoryName required' })

  const category = await Category.findOne({ name: ci(name) })
  if (!category) return res.json({ matched: 0, deleted: 0, note: 'Category not found' })

  const filter = { category: category._id, sold: 0 }
  if (b.onlyWithoutImages !== false) filter.$or = [{ images: { $size: 0 } }, { images: { $exists: false } }]

  const matched = await Product.countDocuments(filter)
  if (b.dryRun === true) return res.json({ dryRun: true, matched, deleted: 0 })
  if (b.confirm !== 'DELETE') return res.status(400).json({ error: 'Send confirm: "DELETE" to proceed' })

  const r = await Product.deleteMany(filter)
  res.json({ matched, deleted: r.deletedCount })
})

module.exports = router
