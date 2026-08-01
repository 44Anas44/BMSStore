const mongoose = require('mongoose')

const teamMemberSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  role:     { type: String, default: '' },        // e.g. "Founder & CEO"
  bio:      { type: String, default: '' },
  photo:    { type: String, default: '' },         // Cloudinary URL
  photoId:  { type: String, default: '' },         // Cloudinary public_id for deletion
  linkedin: { type: String, default: '' },
  email:    { type: String, default: '' },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('TeamMember', teamMemberSchema)
