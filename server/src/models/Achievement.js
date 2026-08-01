const mongoose = require('mongoose')

const achievementSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location:    { type: String, default: '' },
  image:       { type: String, default: '' },      // Cloudinary URL
  imageId:     { type: String, default: '' },       // Cloudinary public_id for deletion
  date:        { type: Date, default: Date.now },   // when the achievement happened
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Achievement', achievementSchema)
