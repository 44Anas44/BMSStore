const mongoose = require('mongoose')

const slideSchema = new mongoose.Schema({
  title:    { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // Single image (used if no breakpoints defined)
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  // Responsive images per breakpoint
  images: {
    mobile:  { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    tablet:  { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    desktop: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  },
  linkUrl:  { type: String, default: '' },
  linkLabel:{ type: String, default: 'Shop Now' },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Slide', slideSchema)
