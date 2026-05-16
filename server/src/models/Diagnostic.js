const mongoose = require('mongoose')

const diagnosticSchema = new mongoose.Schema({
  orderId:  { type: String, required: true, unique: true, trim: true },
  code:     { type: String, required: true, trim: true },  // secret code given to customer
  deviceInfo: { type: String, default: '' },
  problem:  { type: String, default: '' },
  price:    { type: Number, default: null },
  priceConfirmed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['waiting', 'being_treated', 'problem_detected', 'repairing', 'repaired'],
    default: 'waiting',
  },
  notes:    { type: String, default: '' },
  customer: {
    name:  { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
  },
}, { timestamps: true })

module.exports = mongoose.model('Diagnostic', diagnosticSchema)
