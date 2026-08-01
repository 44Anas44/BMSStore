const mongoose = require('mongoose')

// Singleton document — there is only ever one AboutSettings row.
// Use AboutSettings.getSingleton() to fetch/create it.
const aboutSettingsSchema = new mongoose.Schema({
  heroImage:   { type: String, default: '' },   // Cloudinary URL
  heroImageId: { type: String, default: '' },   // Cloudinary public_id for deletion
}, { timestamps: true })

aboutSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne()
  if (!doc) doc = await this.create({})
  return doc
}

module.exports = mongoose.model('AboutSettings', aboutSettingsSchema)
