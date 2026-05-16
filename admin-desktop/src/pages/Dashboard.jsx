import React, { useEffect, useState } from 'react'
import { adminApi, ordersApi } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const STATUS_COLORS = { pending:'#f59e0b', confirmed:'#3b82f6', shipped:'#8b5cf6', completed:'#22c55e', cancelled:'#ef4444' }

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:12, padding:'18px 20px' }}>
      <p style={{ fontSize:11, color:'#aaa', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6, marginBottom:8 }}>{label}</p>
      <p style={{ fontSize:24, fontWeight:800, color: color || '#1a1a1a' }}>{value}</p>
    </div>
  )
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1a1a1a', borderRadius:8, padding:'8px 14px', color:'#fff', fontSize:12 }}>
      <p style={{ opacity:0.6, marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i}><span style={{ color:p.color }}>●</span> {p.name}: <strong>{p.value}</strong></p>)}
    </div>
  )
}

export default function Dashboard() {
  const [data,  setData]  = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminApi.getDashboard().then(setData).catch(console.error)
    ordersApi.getStats().then(setStats).catch(console.error)
  }, [])

  if (!data) return <p style={{ color:'#aaa', fontSize:14 }}>Loading dashboard...</p>

  const recentOrders = data.orderStats?.slice(-14) || []
  const pieData = stats?.byStatus?.map(s => ({ name:s._id, value:s.count })) || []

  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:700, marginBottom:20, letterSpacing:-0.3 }}>Dashboard</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        <StatCard label="Products"  value={data.products}   color="#f8f8f4"/>
        <StatCard label="Orders"    value={data.orders}     color="#3b82f6"/>
        <StatCard label="Categories"value={data.categories} color="#8b5cf6"/>
        <StatCard label="Revenue"   value={(stats?.revenue||0).toFixed(2)+' TND'} color="#22c55e"/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:16 }}>
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:12, padding:'18px 20px' }}>
          <p style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Orders — last 14 days</p>
          {recentOrders.length > 0
            ? <ResponsiveContainer width="100%" height={200}>
                <BarChart data={recentOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false}/>
                  <XAxis dataKey="_id" tick={{ fontSize:10, fill:'#bbb' }} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)}/>
                  <YAxis tick={{ fontSize:10, fill:'#bbb' }} tickLine={false} axisLine={false} width={28}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="count" name="Orders" fill="#f8f8f4" radius={[4,4,0,0]} maxBarSize={24}/>
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4,4,0,0]} maxBarSize={24}/>
                </BarChart>
              </ResponsiveContainer>
            : <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:13 }}>No orders yet</div>
          }
        </div>
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:12, padding:'18px 20px' }}>
          <p style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>By status</p>
          {pieData.length > 0
            ? <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((e,i) => <Cell key={i} fill={STATUS_COLORS[e.name]||'#ccc'}/>)}
                  </Pie>
                  <Tooltip content={<Tip/>}/>
                  <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize:11 }}/>
                </PieChart>
              </ResponsiveContainer>
            : <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:13 }}>No orders yet</div>
          }
        </div>
      </div>
      {stats?.topProducts?.length > 0 && (
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #f5f5f5' }}>
            <p style={{ fontWeight:700, fontSize:14 }}>Best sellers</p>
          </div>
          {stats.topProducts.map((p,i) => (
            <div key={p._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderBottom:'1px solid #f8f8f8' }}>
              <span style={{ fontSize:12, color:'#bbb', width:20 }}>#{i+1}</span>
              <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{p.name||'—'}</span>
              <span style={{ fontSize:13, color:'#888' }}>{p.sold} sold</span>
              <span style={{ fontSize:14, fontWeight:700, color:'#22c55e' }}>{p.revenue.toFixed(2)} TND</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
