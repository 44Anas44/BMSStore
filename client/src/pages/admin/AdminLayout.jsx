import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const IC = ({ d, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
    <path d={d}/>
  </svg>
)

const NAV = [
  { label:'Dashboard',  to:'/admin',            d:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { label:'Products',   to:'/admin/products',   d:'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { label:'Orders',     to:'/admin/orders',     d:'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
  { label:'Categories', to:'/admin/categories', d:'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
  { label:'Slides',     to:'/admin/slides',     d:'M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
]

export default function AdminLayout({ children }) {
  const loc = useLocation()
  const { logout } = useAuthStore()
  const isActive = (to) => to === '/admin' ? loc.pathname === '/admin' : loc.pathname.startsWith(to)

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f7f7f7', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <aside style={{ width:220, background:'#f8f8f4', color:'#f98512', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight:800, fontSize:16, letterSpacing:-0.3 }}> </p>
          <p style={{ opacity:0.45, fontSize:11, marginTop:3, fontWeight:500, textTransform:'uppercase', letterSpacing:0.8 }}>Admin Panel</p>
        </div>
        <nav style={{ padding:'10px 0', flex:1 }}>
          {NAV.map(n => {
            const active = isActive(n.to)
            return (
              <Link key={n.to} to={n.to} style={{
                display:'flex', alignItems:'center', gap:12, padding:'11px 20px',
                textDecoration:'none', color:'inherit', fontSize:13, fontWeight:500,
                background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                borderLeft: active ? '3px solid #f98512' : '3px solid transparent',
                opacity: active ? 1 : 0.65,
                transition:'all 0.15s',
              }}>
                <IC d={n.d}/>
                {n.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', gap:10 }}>
          <a href="/" target="_blank"
            style={{ display:'flex', alignItems:'center', gap:8, color:'inherit', opacity:0.45, fontSize:12, textDecoration:'none', transition:'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity=0.8}
            onMouseLeave={e => e.currentTarget.style.opacity=0.45}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            View Store
          </a>
          <button onClick={logout}
            style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'inherit', opacity:0.45, fontSize:12, cursor:'pointer', fontFamily:'inherit', padding:0, transition:'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity=0.8}
            onMouseLeave={e => e.currentTarget.style.opacity=0.45}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:14, color:'#aaa' }}>
            {NAV.find(n => isActive(n.to))?.label || 'Admin'}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/>
            <span style={{ fontSize:12, color:'#aaa' }}>Server connected</span>
          </div>
        </header>
        <main style={{ flex:1, padding:28, overflowY:'auto' }}>{children}</main>
      </div>
    </div>
  )
}
