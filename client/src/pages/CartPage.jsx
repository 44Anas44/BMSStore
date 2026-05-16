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
      if (result?.warnings?.length) {
        result.warnings.forEach(w => toast(w, { icon: '⚠️', duration: 5000 }))
      }
      toast.success('✅ Order placed! You will be contacted soon.')
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to place order. Please try again.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <div style={{ marginBottom:20 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto' }}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Your cart is empty</p>
      <a href="/products" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: 16 }}>Browse Products</a>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>Your Cart</h1>
      {items.map(item => (
        <div key={item._id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eee' }}>
          <img src={item.images?.[0] || 'https://placehold.co/80x80'} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.price.toFixed(2)} TND</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', background: '#fff' }}>−</button>
            <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
            <button onClick={() => { if (item.qty < (item.stock || Infinity)) updateQty(item._id, item.qty + 1); else toast.error('Maximum available stock reached') }} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', background: '#fff' }}>+</button>
          </div>
          <span style={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>{(item.price * item.qty).toFixed(2)} TND</span>
          <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e44', fontSize: 18, padding: 4 }}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderTop: '2px solid #eee', marginTop: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>Total: {total.toFixed(2)} TND</span>
        <button className="btn-primary" style={{ fontSize: 15, padding: '12px 32px' }} onClick={() => setShowForm(true)}>
          Place Order
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 20 }}>Complete your order</h2>
            {[['name','Full Name *','text'],['address','Delivery Address *','text'],['phone','Phone Number *','tel'],['email','Email (optional)','email']].map(([k,label,type]) => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 6 }}>{label}</label>
                <input type={type} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)} disabled={loading}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={placeOrder} disabled={loading}>
                {loading ? 'Placing...' : '✅ Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
