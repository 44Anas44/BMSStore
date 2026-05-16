import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { healthApi } from './lib/api'
import AdminLayout from './components/AdminLayout'
import Dashboard  from './pages/Dashboard'
import Products   from './pages/Products'
import Orders     from './pages/Orders'
import Categories from './pages/Categories'
import Slides     from './pages/Slides'
import SecondHand from './pages/SecondHand'
import Diagnostics from './pages/Diagnostics'

function ConnectionCheck({ children }) {
  const [status, setStatus] = useState('checking')

  const check = () => {
    setStatus('checking')
    healthApi.check()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }

  useEffect(() => { check() }, [])

  if (status === 'checking') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ width:32, height:32, border:'3px solid #e5e5e5', borderTopColor:'#f8f8f4', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'#aaa', fontSize:14, fontFamily:'inherit' }}>Connecting to server...</p>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  )

  if (status === 'error') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12, padding:32, background:'#f7f7f7' }}>
      <div style={{ width:52, height:52, borderRadius:14, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p style={{ fontWeight:700, fontSize:17, color:'#1a1a1a', fontFamily:'inherit' }}>Cannot connect to server</p>
      <p style={{ color:'#888', fontSize:13, textAlign:'center', maxWidth:340, lineHeight:1.6, fontFamily:'inherit' }}>
        Make sure the server is running at:<br/>
        <code style={{ background:'#f0f0f0', padding:'2px 8px', borderRadius:4, fontSize:12 }}>{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</code>
      </p>
      <button onClick={check}
        style={{ marginTop:8, padding:'10px 24px', background:'#f8f8f4', color:'#f98512', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:14, fontFamily:'inherit' }}>
        Retry Connection
      </button>
    </div>
  )

  return children
}

export default function App() {
  return (
    <ConnectionCheck>
      <AdminLayout>
        <Routes>
          <Route index element={<Navigate to="/dashboard" replace/>}/>
          <Route path="dashboard"  element={<Dashboard/>}/>
          <Route path="products"   element={<Products/>}/>
          <Route path="orders"     element={<Orders/>}/>
          <Route path="categories" element={<Categories/>}/>
          <Route path="slides"     element={<Slides/>}/>
          <Route path="secondhand" element={<SecondHand/>}/>
          <Route path="diagnostics" element={<Diagnostics/>}/>
        </Routes>
      </AdminLayout>
    </ConnectionCheck>
  )
}
