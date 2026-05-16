const mongoose = require('mongoose')
const brandSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, unique: true },
  logo:  { type: String, default: '' },
}, { timestamps: true })
module.exports = mongoose.model('Brand', brandSchema)
