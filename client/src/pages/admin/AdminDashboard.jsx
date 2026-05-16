import React, { useEffect, useState } from 'react'
import { adminApi, ordersApi } from '../../lib/api'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const IC = ({ d, size=18, color='currentColor', fill='none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
)

const ICONS = {
  box:     'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  orders:  'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
  tag:     'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  dollar:  'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  layers:  'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  trending:'M23 6l-9.5 9.5-5-5L1 18',
}

function StatCard({ label, value, sub, iconKey, accent }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, padding:'20px 22px', display:'flex', alignItems:'flex-start', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:12, background: accent + '18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <IC d={ICONS[iconKey]} color={accent} size={20}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:12, color:'#999', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>{label}</p>
        <p style={{ fontSize:26, fontWeight:800, color:'#1a1a1a', letterSpacing:-0.5 }}>{value}</p>
        {sub && <p style={{ fontSize:12, color:'#aaa', marginTop:4 }}>{sub}</p>}
      </div>
    </div>
  )
}

const STATUS_COLORS = {
  pending:'#f59e0b', confirmed:'#3b82f6', shipped:'#8b5cf6',
  completed:'#22c55e', cancelled:'#ef4444'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1a1a1a', border:'none', borderRadius:8, padding:'8px 14px', color:'#fff', fontSize:12 }}>
      <p style={{ marginBottom:4, opacity:0.6 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i}><span style={{ color:p.color }}>●</span> {p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [data,  setData]  = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(),
      ordersApi.getStats(),
    ]).then(([d, s]) => { setData(d); setStats(s) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
      {[...Array(5)].map((_,i) => (
        <div key={i} style={{ height:100, borderRadius:14, background:'#f5f5f5', animation:'pulse 1.5s infinite' }}/>
      ))}
    </div>
  )
  if (!data) return <p style={{ color:'#999' }}>Could not load dashboard data.</p>

  const pieData = stats?.byStatus?.map(s => ({ name: s._id, value: s.count })) || []
  const recentOrders = data.orderStats?.slice(-14) || []

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Dashboard</h1>
        <p style={{ fontSize:13, color:'#999', marginTop:4 }}>Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard label="Products"   value={data.products}  iconKey="box"     accent="#f8f8f4" sub="in catalog" />
        <StatCard label="Orders"     value={data.orders}    iconKey="orders"  accent="#3b82f6"  sub="total received" />
        <StatCard label="Categories" value={data.categories}iconKey="layers"  accent="#8b5cf6"  sub="active" />
        <StatCard label="Brands"     value={data.brands}    iconKey="tag"     accent="#f59e0b"  sub="registered" />
        <StatCard label="Revenue"    value={(stats?.revenue || 0).toFixed(2) + ' TND'} iconKey="dollar" accent="#22c55e" sub="excl. cancelled" />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20 }}>
        
        {/* Orders bar chart */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, padding:'20px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:15, color:'#1a1a1a' }}>Orders — last 14 days</p>
              <p style={{ fontSize:12, color:'#aaa', marginTop:3 }}>Daily order volume</p>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[['count','Orders','#f8f8f4'],['revenue','Revenue (TND)','#22c55e']].map(([k,l,c])=>(
                <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#888' }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:c }}/>
                  {l}
                </div>
              ))}
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentOrders} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false}/>
                <XAxis dataKey="_id" tick={{ fontSize:10, fill:'#bbb' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize:10, fill:'#bbb' }} tickLine={false} axisLine={false} width={30}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" name="Orders" fill="#f8f8f4" radius={[4,4,0,0]} maxBarSize={28}/>
                <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4,4,0,0]} maxBarSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', flexDirection:'column', gap:8 }}>
              <IC d={ICONS.trending} color="#ddd" size={32}/>
              <p style={{ fontSize:13 }}>No orders yet</p>
            </div>
          )}
        </div>

        {/* Status pie chart */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, padding:'20px 24px' }}>
          <p style={{ fontWeight:700, fontSize:15, color:'#1a1a1a', marginBottom:4 }}>Order Status</p>
          <p style={{ fontSize:12, color:'#aaa', marginBottom:20 }}>Distribution by status</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#ccc'}/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize:11 }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', flexDirection:'column', gap:8 }}>
              <IC d={ICONS.orders} color="#ddd" size={32}/>
              <p style={{ fontSize:13 }}>No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      {stats?.topProducts?.length > 0 && (
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', borderBottom:'1px solid #f5f5f5' }}>
            <p style={{ fontWeight:700, fontSize:15, color:'#1a1a1a' }}>Best Sellers</p>
            <p style={{ fontSize:12, color:'#aaa', marginTop:3 }}>Top 5 products by units sold</p>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#fafafa' }}>
                {['Rank','Product','Units Sold','Revenue'].map(h => (
                  <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:'#bbb', textTransform:'uppercase', letterSpacing:0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p, i) => (
                <tr key={p._id} style={{ borderTop:'1px solid #f8f8f8' }}>
                  <td style={{ padding:'12px 20px' }}>
                    <div style={{ width:26, height:26, borderRadius:8, background: i===0?'#fef3c7':i===1?'#f3f4f6':i===2?'#fce7f3':'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color: i===0?'#d97706':i===1?'#6b7280':'#db2777' }}>
                      {i+1}
                    </div>
                  </td>
                  <td style={{ padding:'12px 20px', fontWeight:600, fontSize:14 }}>{p.name || 'Unnamed'}</td>
                  <td style={{ padding:'12px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ height:6, width: Math.round((p.sold / stats.topProducts[0].sold) * 80), background:'#f8f8f4', borderRadius:3, opacity:0.7 }}/>
                      <span style={{ fontSize:13, fontWeight:600, color:'#555' }}>{p.sold}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 20px', fontWeight:700, color:'#22c55e', fontSize:14 }}>{p.revenue.toFixed(2)} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
