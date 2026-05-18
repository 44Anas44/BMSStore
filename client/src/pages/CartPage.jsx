import React, { useState } from 'react'
import { useCartStore } from '../store/cartStore'
import { ordersApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQty, clear } = useCartStore()
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)

  const placeOrder = async () => {
    if (!form.name || !form.address || !form.phone) return toast.error('Please fill all required fields')
    setLoading(true)
    try {
      const result = await ordersApi.create({
        customer: form,
        items: items.map(i => ({ product: i._id, name: i.name, price: i.price, qty: i.qty, image: i.images?.[0] || '' })),
        total,
      })
      clear()
      setShowForm(false)
      if (result?.warnings?.length) result.warnings.forEach(w => toast(w, { icon: '⚠️', duration: 5000 }))
      toast.success('✅ Order placed! You will be contacted soon.')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to place order. Please try again.')
    } finally { setLoading(false) }
  }

  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 20px' }}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Your cart is empty</p>
      <a href="/products" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: 16 }}>Browse Products</a>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        .cart-item { display: flex; gap: 12px; align-items: center; padding: 14px 0; border-bottom: 1px solid #eee; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name { font-weight: 600; font-size: 14px; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .cart-item-price { color: var(--secondary, #f97316); font-weight: 700; font-size: 13px; }
        .cart-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .cart-item-subtotal { font-weight: 700; font-size: 14px; color: #1a1a1a; }
        .qty-controls { display: flex; align-items: center; gap: 6px; }
        .qty-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #ddd; cursor: pointer; background: #fff; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .qty-val { min-width: 24px; text-align: center; font-weight: 600; font-size: 14px; }
        .remove-btn { background: none; border: none; cursor: pointer; color: #ccc; font-size: 16px; padding: 2px; line-height: 1; }
        .remove-btn:hover { color: #e44; }
        .cart-footer { padding: 20px 0 0; border-top: 2px solid #eee; margin-top: 8px; }
        .cart-total { font-size: 20px; font-weight: 800; color: #1a1a1a; margin-bottom: 14px; }
        .cart-total span { color: var(--secondary, #f97316); }
        @media(max-width: 480px) {
          .cart-item img { width: 64px !important; height: 64px !important; }
        }
      `}</style>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#1a1a1a' }}>
        Your Cart <span style={{ fontSize: 14, fontWeight: 400, color: '#aaa' }}>({items.length} item{items.length !== 1 ? 's' : ''})</span>
      </h1>

      {items.map(item => (
        <div key={item._id} className="cart-item">
          <img src={item.images?.[0] || 'https://placehold.co/72x72'} alt={item.name}
            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
          <div className="cart-item-info">
            <p className="cart-item-name">{item.name}</p>
            <p className="cart-item-price">{item.price.toFixed(2)} TND</p>
          </div>
          <div className="cart-item-right">
            <button className="remove-btn" onClick={() => removeItem(item._id)}>✕</button>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
              <span className="qty-val">{item.qty}</span>
              <button className="qty-btn" onClick={() => {
                if (item.qty < (item.stock || Infinity)) updateQty(item._id, item.qty + 1)
                else toast.error('Maximum stock reached')
              }}>+</button>
            </div>
            <span className="cart-item-subtotal">{(item.price * item.qty).toFixed(2)} TND</span>
          </div>
        </div>
      ))}

      <div className="cart-footer">
        <div className="cart-total">Total: <span>{total.toFixed(2)} TND</span></div>
        <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '14px' }} onClick={() => setShowForm(true)}>
          Place Order
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 520 }}>
            <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 20px' }} />
            <h2 style={{ fontWeight: 800, marginBottom: 20, fontSize: 18 }}>Complete your order</h2>
            {[['name','Full Name *','text'],['address','Delivery Address *','text'],['phone','Phone Number *','tel'],['email','Email (optional)','email']].map(([k, label, type]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
                <input type={type} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowForm(false)} disabled={loading}
                style={{ flex: 1, padding: '13px', border: '1px solid #ddd', borderRadius: 10, background: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={placeOrder} disabled={loading}
                style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 10, background: '#9c155f', color: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                {loading ? 'Placing...' : '✅ Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
