import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const BRAND = import.meta.env.VITE_BRAND_NAME || ' '

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAdmin, loading, error, clearError } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass]  = useState(false)

  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true })
  }, [isAdmin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const ok = await login(username, password)
    if (ok) navigate('/admin', { replace: true })
  }

  const EyeIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f7f7f7', padding:24, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:52, height:52, background:'#f8f8f4', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f98512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', marginBottom:6, letterSpacing:-0.3 }}>Admin Access</h1>
          <p style={{ fontSize:14, color:'#aaa' }}>{BRAND} — Restricted area</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background:'#fff', borderRadius:16, padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid #eee' }}>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', marginBottom:20, fontSize:13, color:'#dc2626', display:'flex', alignItems:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="admin" autoComplete="username" required
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e5e5', borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none', color:'#1a1a1a', transition:'border-color 0.15s', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='#f8f8f4'}
              onBlur={e => e.target.style.borderColor='#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" required
                style={{ width:'100%', padding:'11px 44px 11px 14px', border:'1.5px solid #e5e5e5', borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none', color:'#1a1a1a', transition:'border-color 0.15s', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='#f8f8f4'}
                onBlur={e => e.target.style.borderColor='#e5e5e5'}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#bbb', padding:2 }}>
                <EyeIcon open={showPass}/>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px', border:'none', borderRadius:10, background:'#f8f8f4', color:'#f98512', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?0.7:1, transition:'opacity 0.15s' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#ccc' }}>
          This page is not publicly linked. Admins only.
        </p>
      </div>
    </div>
  )
}
