import React, { useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

const STATUS_LABELS = {
  waiting:          { label:'Waiting',          color:'#f59e0b', bg:'#fef3c7', desc:'Your device has been received and is waiting to be assigned.' },
  being_treated:    { label:'Being Treated',    color:'#3b82f6', bg:'#dbeafe', desc:'A technician is currently examining your device.' },
  problem_detected: { label:'Problem Detected', color:'#8b5cf6', bg:'#ede9fe', desc:'We have identified the issue. Please review the details and confirm to proceed with repair.' },
  repairing:        { label:'Repairing',        color:'#06b6d4', bg:'#cffafe', desc:'Your device is being repaired.' },
  repaired:         { label:'Repaired',         color:'#22c55e', bg:'#dcfce7', desc:'Your device has been repaired and is ready for pickup.' },
}

const STEPS_ORDER = ['waiting','being_treated','problem_detected','repairing','repaired']

export default function DiagnosticsPage() {
  const [orderId,   setOrderId]   = useState('')
  const [code,      setCode]      = useState('')
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [confirming,setConfirming]= useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const lookup = async (e) => {
    e.preventDefault()
    if (!orderId.trim() || !code.trim()) return setError('Please enter both Order ID and Code')
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.get('/diagnostics/lookup', { params: { orderId: orderId.trim(), code: code.trim() } })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Not found. Check your Order ID and Code.')
    } finally { setLoading(false) }
  }

  const confirmPrice = async () => {
    setConfirming(true)
    try {
      const { data } = await api.patch(`/diagnostics/confirm/${result._id}`, { code: code.trim() })
      setResult(data); setConfirmed(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Confirmation failed')
    } finally { setConfirming(false) }
  }

  const st = result ? STATUS_LABELS[result.status] : null
  const stepIdx = result ? STEPS_ORDER.indexOf(result.status) : -1

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 24px' }}>
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <div style={{ display:'inline-block', background:'var(--primary)', color:'var(--secondary)', fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:20, letterSpacing:0.8, textTransform:'uppercase', marginBottom:12 }}>Repair Tracker</div>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#1a1a1a', letterSpacing:-0.3, marginBottom:8 }}>Track Your Repair</h1>
        <p style={{ fontSize:15, color:'#888' }}>Enter your Order ID and the secret code you received to see your repair status.</p>
      </div>

      <form onSubmit={lookup} style={{ background:'#fff', border:'1px solid #eee', borderRadius:16, padding:'28px 32px', marginBottom:24, boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>Order ID</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. REP-2025-001"
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e5e5', borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='#e5e5e5'}/>
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>Secret Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="••••••"
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e5e5', borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='#e5e5e5'}/>
          </div>
        </div>
        {error && <p style={{ color:'#ef4444', fontSize:13, marginBottom:12 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:'12px', border:'none', borderRadius:10, background:'var(--primary)', color:'var(--secondary)', fontSize:15, fontWeight:700, cursor:loading?'wait':'pointer', fontFamily:'inherit', opacity:loading?0.7:1 }}>
          {loading ? 'Looking up...' : 'Track Repair'}
        </button>
      </form>

      {result && st && (
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:16, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* Status header */}
          <div style={{ background: st.bg, padding:'22px 28px', borderBottom:'1px solid #eee' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:st.color }}/>
              <span style={{ fontWeight:800, fontSize:18, color:st.color }}>{st.label}</span>
            </div>
            <p style={{ fontSize:14, color:'#555' }}>{st.desc}</p>
          </div>

          {/* Progress bar */}
          <div style={{ padding:'20px 28px', borderBottom:'1px solid #f5f5f5' }}>
            <div style={{ display:'flex', alignItems:'center', gap:0 }}>
              {STEPS_ORDER.map((s, i) => {
                const done = i <= stepIdx
                const current = i === stepIdx
                return (
                  <React.Fragment key={s}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex: i < STEPS_ORDER.length-1 ? 'none' : 'none' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background: done ? 'var(--primary)' : '#e5e5e5', display:'flex', alignItems:'center', justifyContent:'center', border: current ? '3px solid var(--secondary, #e8c547)' : 'none', boxSizing:'border-box', transition:'all 0.3s' }}>
                        {done && !current && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        {current && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)' }}/>}
                      </div>
                      <p style={{ fontSize:9, color: done?'var(--primary)':'#bbb', marginTop:5, textAlign:'center', maxWidth:60, fontWeight: current?700:400 }}>{STATUS_LABELS[s].label}</p>
                    </div>
                    {i < STEPS_ORDER.length - 1 && (
                      <div style={{ flex:1, height:2, background: i < stepIdx ? 'var(--primary)' : '#e5e5e5', margin:'0 4px', marginBottom:22, transition:'background 0.3s' }}/>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Details */}
          <div style={{ padding:'20px 28px' }}>
            {result.deviceInfo && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Device</p>
                <p style={{ fontSize:14, color:'#1a1a1a' }}>{result.deviceInfo}</p>
              </div>
            )}
            {result.problem && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Problem Detected</p>
                <p style={{ fontSize:14, color:'#1a1a1a' }}>{result.problem}</p>
              </div>
            )}
            {result.price != null && (
              <div style={{ marginBottom:16, padding:'14px 16px', background:'#f8f8f8', borderRadius:10 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Repair Price</p>
                <p style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{result.price.toFixed(2)} TND</p>
                {result.priceConfirmed && <p style={{ fontSize:12, color:'#22c55e', marginTop:4 }}>✓ Price confirmed — repair in progress</p>}
              </div>
            )}
            {result.status === 'problem_detected' && !result.priceConfirmed && (
              <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#92400e', marginBottom:6 }}>Action required</p>
                <p style={{ fontSize:13, color:'#92400e', marginBottom:14 }}>Please confirm the repair price above to proceed. Once confirmed, our technician will begin the repair.</p>
                {confirmed ? (
                  <p style={{ fontSize:14, fontWeight:700, color:'#22c55e' }}>✓ Confirmed! Repair has started.</p>
                ) : (
                  <button onClick={confirmPrice} disabled={confirming}
                    style={{ background:'var(--primary)', color:'var(--secondary)', border:'none', borderRadius:9, padding:'10px 24px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', opacity:confirming?0.7:1 }}>
                    {confirming ? 'Confirming...' : 'Confirm & Proceed with Repair'}
                  </button>
                )}
              </div>
            )}
            {result.notes && (
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Technician Notes</p>
                <p style={{ fontSize:14, color:'#555' }}>{result.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
