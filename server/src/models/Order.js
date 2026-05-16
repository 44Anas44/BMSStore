const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customer: {
    name:    { type: String, required: true },
    address: { type: String, required: true },
    phone:   { type: String, required: true },
    email:   { type: String, default: '' },
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:    String,
    price:   Number,
    qty:     Number,
    image:   String,
  }],
  total:  { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'],
    default: 'pending',
  },
  note: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
