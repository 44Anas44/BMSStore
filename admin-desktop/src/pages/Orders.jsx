import React, { useEffect, useState } from 'react'
import { ordersApi } from '../lib/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','shipped','completed','cancelled']
const SC = { pending:{c:'#d97706',b:'#fef3c7'}, confirmed:{c:'#2563eb',b:'#dbeafe'}, shipped:{c:'#7c3aed',b:'#ede9fe'}, completed:{c:'#16a34a',b:'#dcfce7'}, cancelled:{c:'#dc2626',b:'#fee2e2'} }
const Pill = ({status}) => { const s=SC[status]||{c:'#888',b:'#f5f5f5'}; return <span style={{ fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,background:s.b,color:s.c,letterSpacing:0.3 }}>{status}</span> }

export default function Orders() {
  const [data, setData]     = useState({ orders:[], total:0 })
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = () => ordersApi.getAll({ status:filter, limit:100 }).then(setData).catch(console.error)
  useEffect(() => { load() }, [filter])

  const changeStatus = async (id, status) => {
    try { await ordersApi.updateStatus(id, status); toast.success('Updated'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20,fontWeight:700,letterSpacing:-0.3 }}>Orders</h1>
          <p style={{ fontSize:13,color:'#aaa',marginTop:2 }}>{data.total} total</p>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{ padding:'8px 12px',border:'1px solid #e5e5e5',borderRadius:8,fontSize:13,background:'#fff',color:'#555',fontFamily:'inherit',cursor:'pointer' }}>
          <option value="">All</option>
          {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden' }}>
        {data.orders.length===0 && <div style={{ padding:40,textAlign:'center',color:'#ccc',fontSize:13 }}>No orders found</div>}
        {data.orders.map(o => (
          <div key={o._id} style={{ borderBottom:'1px solid #f8f8f8' }}>
            <div onClick={()=>setExpanded(expanded===o._id?null:o._id)}
              style={{ display:'flex',alignItems:'center',gap:14,padding:'13px 18px',cursor:'pointer' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:3 }}>
                  <span style={{ fontWeight:700,fontSize:14 }}>{o.customer.name}</span>
                  <Pill status={o.status}/>
                </div>
                <p style={{ fontSize:11,color:'#aaa' }}>{o.customer.phone} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <span style={{ fontWeight:800,fontSize:15 }}>{(+o.total).toFixed(2)} TND</span>
              <div onClick={e=>e.stopPropagation()}>
                <select value={o.status} onChange={e=>changeStatus(o._id,e.target.value)}
                  style={{ padding:'6px 9px',border:'1px solid #e5e5e5',borderRadius:7,fontSize:12,background:'#fff',fontFamily:'inherit',cursor:'pointer' }}>
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {expanded===o._id && (
              <div style={{ padding:'0 18px 14px',background:'#fafafa',borderTop:'1px solid #f5f5f5' }}>
                <p style={{ fontSize:12,color:'#888',margin:'10px 0 8px' }}>Address: {o.customer.address}</p>
                {o.items?.map((item,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid #f0f0f0' }}>
                    {item.image&&<img src={item.image} alt="" style={{ width:32,height:32,objectFit:'cover',borderRadius:6 }}/>}
                    <span style={{ flex:1,fontSize:13 }}>{item.name}</span>
                    <span style={{ fontSize:12,color:'#aaa' }}>×{item.qty}</span>
                    <span style={{ fontSize:13,fontWeight:600 }}>{(+item.price*item.qty).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
