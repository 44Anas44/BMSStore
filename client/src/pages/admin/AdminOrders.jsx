import React, { useEffect, useState } from 'react'
import { ordersApi } from '../../lib/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','shipped','completed','cancelled']

const STATUS_STYLE = {
  pending:   { color:'#d97706', bg:'#fef3c7' },
  confirmed: { color:'#2563eb', bg:'#dbeafe' },
  shipped:   { color:'#7c3aed', bg:'#ede9fe' },
  completed: { color:'#16a34a', bg:'#dcfce7' },
  cancelled: { color:'#dc2626', bg:'#fee2e2' },
}

const Pill = ({ status }) => {
  const s = STATUS_STYLE[status] || { color:'#888', bg:'#f5f5f5' }
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, letterSpacing:0.4 }}>{status}</span>
}

export default function AdminOrders() {
  const [data, setData]     = useState({ orders:[], total:0 })
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    ordersApi.getAll({ status: filter, limit: 100 })
      .then(setData).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const changeStatus = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status)
      toast.success('Status updated')
      load()
    } catch { toast.error('Update failed') }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Orders</h1>
          <p style={{ fontSize:13, color:'#aaa', marginTop:3 }}>{data.total} total</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding:'9px 14px', border:'1px solid #e5e5e5', borderRadius:9, fontSize:13, background:'#fff', color:'#555', fontFamily:'inherit', cursor:'pointer' }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, overflow:'hidden' }}>
        {loading && <div style={{ padding:40, textAlign:'center', color:'#ccc', fontSize:14 }}>Loading orders...</div>}
        {!loading && data.orders.length === 0 && (
          <div style={{ padding:48, textAlign:'center', color:'#ccc' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto 12px', display:'block' }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p style={{ fontSize:14 }}>No orders {filter ? 'with status "' + filter + '"' : 'yet'}</p>
          </div>
        )}
        {data.orders.map(order => (
          <div key={order._id} style={{ borderBottom:'1px solid #f8f8f8' }}>
            <div
              onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', cursor:'pointer', transition:'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background='#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background=''}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>{order.customer.name}</span>
                  <Pill status={order.status}/>
                </div>
                <p style={{ fontSize:12, color:'#aaa' }}>
                  {order.customer.phone} · {order.customer.address} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontWeight:800, fontSize:16, color:'#1a1a1a' }}>{(+order.total).toFixed(2)} TND</p>
                <p style={{ fontSize:11, color:'#ccc' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
              </div>
              <div onClick={e => e.stopPropagation()}>
                <select value={order.status}
                  onChange={e => changeStatus(order._id, e.target.value)}
                  style={{ padding:'7px 10px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:12, background:'#fff', color:'#555', fontFamily:'inherit', cursor:'pointer' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: expanded===order._id ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {expanded === order._id && (
              <div style={{ padding:'0 20px 16px 20px', background:'#fafafa', borderTop:'1px solid #f5f5f5' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:'12px 0', marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:11, color:'#aaa', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Customer</p>
                    <p style={{ fontSize:13 }}>{order.customer.name}</p>
                    <p style={{ fontSize:13, color:'#888' }}>{order.customer.phone}</p>
                    {order.customer.email && <p style={{ fontSize:13, color:'#888' }}>{order.customer.email}</p>}
                  </div>
                  <div>
                    <p style={{ fontSize:11, color:'#aaa', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Delivery Address</p>
                    <p style={{ fontSize:13, color:'#888' }}>{order.customer.address}</p>
                  </div>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #eee' }}>
                      {['Product','Qty','Unit Price','Total'].map(h => (
                        <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontSize:11, fontWeight:600, color:'#bbb', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, i) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f5f5f5' }}>
                        <td style={{ padding:'8px', display:'flex', alignItems:'center', gap:8 }}>
                          {item.image && <img src={item.image} alt={item.name} style={{ width:32, height:32, objectFit:'cover', borderRadius:6, border:'1px solid #eee' }}/>}
                          <span style={{ fontSize:13, fontWeight:500 }}>{item.name}</span>
                        </td>
                        <td style={{ padding:'8px', fontSize:13, color:'#888' }}>×{item.qty}</td>
                        <td style={{ padding:'8px', fontSize:13, color:'#888' }}>{(+item.price).toFixed(2)}</td>
                        <td style={{ padding:'8px', fontSize:13, fontWeight:600 }}>{(+item.price * item.qty).toFixed(2)} TND</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ padding:'10px 8px', fontWeight:700, textAlign:'right', fontSize:14 }}>Total</td>
                      <td style={{ padding:'10px 8px', fontWeight:800, fontSize:15, color:'#1a1a1a' }}>{(+order.total).toFixed(2)} TND</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
