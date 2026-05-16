const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },       // Cloudinary URL
  imageId:     { type: String, default: '' },       // Cloudinary public_id for deletion
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  slug:        { type: String, unique: true, lowercase: true },
  order:       { type: Number, default: 0 },        // display order on homepage
}, { timestamps: true })

categorySchema.pre('save', function(next) {
  if (!this.slug) this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  next()
})

module.exports = mongoose.model('Category', categorySchema)
