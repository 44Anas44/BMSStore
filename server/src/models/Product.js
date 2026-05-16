const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  comparePrice:{ type: Number, default: null },
  images:      [{ type: String }], // up to 5 Cloudinary URLs
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand:       { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  stock:       { type: Number, default: 0, min: 0 },
  isPromo:     { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isSecondHand: { type: Boolean, default: false },
  sold:         { type: Number, default: 0 },
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text' })
module.exports = mongoose.model('Product', productSchema)
