import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const BRAND = import.meta.env.VITE_BRAND_NAME || ' '

const IC = ({ d }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
    <path d={d}/>
  </svg>
)

const NAV = [
  { label:'Dashboard',  to:'/dashboard',  d:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { label:'Products',   to:'/products',   d:'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { label:'Orders',     to:'/orders',     d:'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
  { label:'Categories', to:'/categories', d:'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
  { label:'Slides',     to:'/slides',     d:'M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  ...(import.meta.env.VITE_FEATURE_SECONDHAND==='true' ? [{ label:'Second Hand', to:'/secondhand', d:'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM1 10h4M19 10h4' }] : []),
  ...(import.meta.env.VITE_FEATURE_DIAGNOSTICS==='true' ? [{ label:'Diagnostics',  to:'/diagnostics', d:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }] : []),
]

export default function AdminLayout({ children }) {
  const loc = useLocation()
  const active = (to) => loc.pathname.startsWith(to)

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <aside style={{ width:210, background:'#f8f8f4', color:'#f98512', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3 }}>{BRAND}</p>
          <p style={{ opacity:0.45, fontSize:11, marginTop:2, textTransform:'uppercase', letterSpacing:0.8 }}>Admin</p>
        </div>
        <nav style={{ padding:'8px 0', flex:1, overflowY:'auto' }}>
          {NAV.map(n => (
            <Link key={n.to} to={n.to} style={{
              display:'flex', alignItems:'center', gap:11, padding:'10px 18px',
              textDecoration:'none', color:'inherit', fontSize:13, fontWeight:500,
              background: active(n.to) ? 'rgba(255,255,255,0.13)' : 'transparent',
              borderLeft: active(n.to) ? '3px solid #f98512' : '3px solid transparent',
              opacity: active(n.to) ? 1 : 0.6, transition:'all 0.15s',
            }}>
              <IC d={n.d}/>{n.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.08)', fontSize:11, opacity:0.35 }}>
          Desktop Admin v1.0
        </div>
      </aside>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <p style={{ fontSize:13, color:'#aaa' }}>
            {NAV.find(n => active(n.to))?.label}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e' }}/>
            <span style={{ fontSize:12, color:'#aaa' }}>Connected</span>
          </div>
        </header>
        <main style={{ flex:1, overflowY:'auto', padding:24 }}>{children}</main>
      </div>
    </div>
  )
}
