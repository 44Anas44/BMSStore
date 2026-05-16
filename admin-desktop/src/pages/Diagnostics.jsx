import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
api.interceptors.request.use(cfg => { cfg.headers['X-App-Key'] = import.meta.env.VITE_APP_KEY || ''; return cfg })

const STATUSES     = ['waiting','being_treated','problem_detected','repairing','repaired']
const STATUS_LABELS = { waiting:'Waiting', being_treated:'Being Treated', problem_detected:'Problem Detected', repairing:'Repairing', repaired:'Repaired' }
const STATUS_COLORS = { waiting:'#f59e0b', being_treated:'#3b82f6', problem_detected:'#8b5cf6', repairing:'#06b6d4', repaired:'#22c55e' }

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }

const F = ({ label, children }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:5 }}>{label}</label>
    {children}
  </div>
)

// ── PDF Generator ────────────────────────────────────────────────────────────
async function generateReceiptPdf(diagnostic, photoDataUrl) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const W = 148, pad = 14

  // Header band
  doc.setFillColor('f8f8f4' .length === 6 ? ('#' + 'f8f8f4') : '#f8f8f4')
  doc.setFillColor(248,248,244)
  doc.rect(0, 0, W, 32, 'F')

  // Logo text / brand
  doc.setTextColor(249,133,18)
  doc.setFontSize(18)
  doc.setFont('helvetica','bold')
  doc.text(' ', pad, 13)
  doc.setFontSize(8)
  doc.setFont('helvetica','normal')
  doc.text('BMS', pad, 20)

  // Receipt label
  doc.setFontSize(9)
  doc.setFont('helvetica','bold')
  doc.text('REPAIR RECEIPT', W - pad, 13, { align:'right' })
  doc.setFont('helvetica','normal')
  doc.setFontSize(7.5)
  doc.text(new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }), W - pad, 20, { align:'right' })

  // Reset text colour
  doc.setTextColor(30, 30, 30)

  let y = 40

  // Order ID + Status pill row
  doc.setFontSize(13)
  doc.setFont('helvetica','bold')
  doc.text('Order: ' + diagnostic.orderId, pad, y)

  const sc = STATUS_COLORS[diagnostic.status] || '#888'
  const scHex = sc.replace('#','')
  const sr = parseInt(scHex.substring(0,2),16)||136
  const sg = parseInt(scHex.substring(2,4),16)||136
  const sb = parseInt(scHex.substring(4,6),16)||136
  doc.setFillColor(sr, sg, sb)
  const statusLabel = STATUS_LABELS[diagnostic.status] || diagnostic.status
  doc.setFontSize(7)
  doc.setTextColor(255,255,255)
  const pillW = doc.getTextWidth(statusLabel) + 8
  doc.roundedRect(W - pad - pillW, y - 6, pillW, 7, 2, 2, 'F')
  doc.text(statusLabel, W - pad - pillW/2, y - 1.2, { align:'center' })

  doc.setTextColor(30,30,30)
  y += 6

  // Divider
  doc.setDrawColor(230,230,230)
  doc.line(pad, y, W - pad, y)
  y += 6

  // Customer details
  const details = [
    ['Customer', diagnostic.customer?.name || '—'],
    ['Phone',    diagnostic.customer?.phone || '—'],
    ['Device',   diagnostic.deviceInfo || '—'],
  ]
  doc.setFontSize(8.5)
  for (const [label, value] of details) {
    doc.setFont('helvetica','bold');  doc.text(label + ':', pad, y)
    doc.setFont('helvetica','normal'); doc.text(value, pad + 28, y)
    y += 6
  }
  y += 2

  // Problem box
  if (diagnostic.problem) {
    doc.setFillColor(248,248,250)
    const problemLines = doc.splitTextToSize('Problem: ' + diagnostic.problem, W - pad*2 - 4)
    const boxH = problemLines.length * 5 + 8
    doc.roundedRect(pad, y, W - pad*2, boxH, 3, 3, 'F')
    doc.setFont('helvetica','normal')
    doc.setFontSize(8)
    doc.text(problemLines, pad + 4, y + 6)
    y += boxH + 5
  }

  // Price row
  if (diagnostic.price != null) {
    doc.setFillColor(248,248,244)
    doc.roundedRect(pad, y, W - pad*2, 12, 3, 3, 'F')
    doc.setTextColor(249,133,18)
    doc.setFont('helvetica','bold')
    doc.setFontSize(10)
    doc.text('Repair Price:', pad + 4, y + 7.5)
    doc.text((+diagnostic.price).toFixed(2) + ' TND', W - pad - 4, y + 7.5, { align:'right' })
    doc.setTextColor(30,30,30)
    y += 18
  }

  // Secret code box
  doc.setFillColor(255, 251, 235)
  doc.roundedRect(pad, y, W - pad*2, 14, 3, 3, 'F')
  doc.setDrawColor(251, 191, 36)
  doc.roundedRect(pad, y, W - pad*2, 14, 3, 3, 'S')
  doc.setFontSize(7.5)
  doc.setFont('helvetica','bold')
  doc.setTextColor(120, 80, 0)
  doc.text('Your secret tracking code — keep this safe:', pad + 4, y + 5.5)
  doc.setFontSize(14)
  doc.setTextColor(30,30,30)
  doc.text(diagnostic.code, W/2, y + 11, { align:'center' })
  doc.setTextColor(30,30,30)
  y += 20

  // Photo
  if (photoDataUrl) {
    try {
      doc.setFontSize(8)
      doc.setFont('helvetica','bold')
      doc.text('Device Photo:', pad, y)
      y += 4
      const remaining = 210 - y - 14  // A5 height is 210mm
      const imgH = Math.min(50, remaining)
      doc.addImage(photoDataUrl, 'JPEG', pad, y, W - pad*2, imgH, undefined, 'MEDIUM')
      y += imgH + 4
    } catch(e) { console.warn('Photo embed failed', e) }
  }

  // Notes
  if (diagnostic.notes) {
    doc.setFontSize(7.5)
    doc.setFont('helvetica','bold')
    doc.text('Notes:', pad, y)
    doc.setFont('helvetica','normal')
    const noteLines = doc.splitTextToSize(diagnostic.notes, W - pad*2 - 6)
    doc.text(noteLines, pad + 14, y)
    y += noteLines.length * 4.5 + 4
  }

  // Footer
  const footerY = 205
  doc.setDrawColor(230,230,230)
  doc.line(pad, footerY - 4, W - pad, footerY - 4)
  doc.setFontSize(7)
  doc.setFont('helvetica','normal')
  doc.setTextColor(160,160,160)
  doc.text('  · frdsg', W/2, footerY, { align:'center' })
  doc.text('+21629226349', W/2, footerY + 4, { align:'center' })

  return doc
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Diagnostics() {
  const [items,    setItems]    = useState([])
  const [filter,   setFilter]   = useState('')
  const [modal,    setModal]    = useState(null)   // 'new' | 'edit' | 'receipt'
  const [form,     setForm]     = useState({})
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [receipt,  setReceipt]  = useState(null)   // diagnostic object for receipt
  const [photo,    setPhoto]    = useState(null)   // dataURL
  const [pdfUrl,   setPdfUrl]   = useState(null)
  const photoRef = useRef()

  const load = () => {
    setLoading(true)
    api.get('/diagnostics', { params: filter ? { status: filter } : {} })
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const openNew = () => {
    setForm({ orderId:'', code:'', deviceInfo:'', customer:{ name:'', phone:'', email:'' }, problem:'', price:'', status:'waiting', notes:'' })
    setModal('new')
  }
  const openEdit = (d) => { setForm({ ...d, price: d.price ?? '' }); setModal('edit') }

  const save = async () => {
    if (!form.orderId || !form.code) return toast.error('Order ID and code are required')
    setSaving(true)
    try {
      const data = { ...form, price: form.price !== '' ? +form.price : null }
      if (modal === 'new') await api.post('/diagnostics', data)
      else await api.put(`/diagnostics/${form._id}`, data)
      toast.success(modal === 'new' ? 'Diagnostic created!' : 'Updated!')
      setModal(null); load()
    } catch (err) { toast.error('Failed: ' + (err.response?.data?.error || err.message)) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this diagnostic?')) return
    try { await api.delete(`/diagnostics/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const setCustomer = (k, v) => setForm(f => ({ ...f, customer: { ...f.customer, [k]: v } }))

  // Receipt modal
  const openReceipt = async (d) => {
    setReceipt(d)
    setPhoto(null)
    setPdfUrl(null)
    setModal('receipt')
    // generate initial PDF without photo
    const doc = await generateReceiptPdf(d, null)
    setPdfUrl(doc.output('bloburl'))
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setPhoto(dataUrl)
      const doc = await generateReceiptPdf(receipt, dataUrl)
      setPdfUrl(doc.output('bloburl'))
    }
    reader.readAsDataURL(file)
  }

  const downloadPdf = async () => {
    const doc = await generateReceiptPdf(receipt, photo)
    doc.save(`receipt-${receipt.orderId}.pdf`)
  }

  const printPdf = async () => {
    const doc = await generateReceiptPdf(receipt, photo)
    const url = doc.output('bloburl')
    const win = window.open(url)
    win?.addEventListener('load', () => win.print())
  }

  return (
    <div style={{ padding:28, height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Diagnostics & Repairs</h1>
          <p style={{ fontSize:13, color:'#aaa', marginTop:3 }}>{items.length} total</p>
        </div>
        <button onClick={openNew}
          style={{ background:'#f8f8f4', color:'#f98512', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Diagnostic
        </button>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'6px 14px', borderRadius:20, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit',
              borderColor: filter===s ? STATUS_COLORS[s]||'#f8f8f4' : '#e5e5e5',
              background:  filter===s ? (STATUS_COLORS[s]||'#f8f8f4')+'18' : '#fff',
              color:       filter===s ? STATUS_COLORS[s]||'#f8f8f4' : '#666',
            }}>
            {s ? STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color:'#aaa' }}>Loading...</p>}
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, overflow:'hidden' }}>
        {items.map(d => (
          <div key={d._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:'1px solid #f8f8f8', transition:'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background='#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background=''}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:14, color:'#1a1a1a', fontFamily:'monospace' }}>{d.orderId}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10, background:(STATUS_COLORS[d.status]||'#888')+'18', color:STATUS_COLORS[d.status]||'#888' }}>
                  {STATUS_LABELS[d.status]}
                </span>
                {d.priceConfirmed && <span style={{ fontSize:11, color:'#22c55e', fontWeight:600 }}>✓ Confirmed</span>}
              </div>
              <p style={{ fontSize:13, color:'#888' }}>
                {d.customer?.name && <span>{d.customer.name}</span>}
                {d.deviceInfo && <span> · {d.deviceInfo}</span>}
                {d.price != null && <span style={{ color:'#f8f8f4', fontWeight:600 }}> · {(+d.price).toFixed(2)} TND</span>}
              </p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => openReceipt(d)}
                style={{ padding:'5px 12px', border:'1px solid #e0e7ff', borderRadius:7, cursor:'pointer', background:'#f0f4ff', color:'#4f46e5', fontSize:12, fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Receipt
              </button>
              <button onClick={() => openEdit(d)} style={{ padding:'5px 12px', border:'1px solid #e5e5e5', borderRadius:7, cursor:'pointer', background:'#fff', color:'#555', fontSize:12, fontFamily:'inherit' }}>Edit</button>
              <button onClick={() => del(d._id)} style={{ padding:'5px 12px', border:'1px solid #fee2e2', borderRadius:7, cursor:'pointer', background:'#fff', color:'#ef4444', fontSize:12, fontFamily:'inherit' }}>Delete</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div style={{ padding:'48px 20px', textAlign:'center', color:'#ccc', fontSize:14 }}>No diagnostics yet — click "New Diagnostic" to create one</div>
        )}
      </div>

      {/* ── Form Modal (new / edit) ── */}
      {(modal === 'new' || modal === 'edit') && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:580, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding:'20px 26px', borderBottom:'1px solid #f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1, borderRadius:'16px 16px 0 0' }}>
              <h2 style={{ fontWeight:700, fontSize:18, color:'#1a1a1a' }}>{modal==='new'?'New Diagnostic':'Edit Diagnostic'}</h2>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding:'22px 26px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <F label="Order ID *"><input style={inp} value={form.orderId||''} onChange={e => setForm(f=>({...f,orderId:e.target.value}))} placeholder="e.g. REP-001"/></F>
              <F label="Secret Code *"><input style={inp} value={form.code||''} onChange={e => setForm(f=>({...f,code:e.target.value}))} placeholder="e.g. XK92"/></F>
              <F label="Customer Name"><input style={inp} value={form.customer?.name||''} onChange={e => setCustomer('name',e.target.value)}/></F>
              <F label="Customer Phone"><input style={inp} value={form.customer?.phone||''} onChange={e => setCustomer('phone',e.target.value)}/></F>
              <div style={{ gridColumn:'1/-1' }}>
                <F label="Device Info"><input style={inp} value={form.deviceInfo||''} onChange={e => setForm(f=>({...f,deviceInfo:e.target.value}))} placeholder="e.g. iPhone 13, Samsung A52"/></F>
              </div>
              <F label="Status">
                <select style={{ ...inp, cursor:'pointer' }} value={form.status||'waiting'} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </F>
              <F label="Repair Price (TND)"><input style={inp} type="number" min="0" step="0.01" value={form.price||''} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="0.00"/></F>
              <div style={{ gridColumn:'1/-1' }}>
                <F label="Problem Detected">
                  <textarea style={{ ...inp, minHeight:70, resize:'vertical' }} value={form.problem||''} onChange={e => setForm(f=>({...f,problem:e.target.value}))} placeholder="Describe the issue found..."/>
                </F>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <F label="Technician Notes">
                  <textarea style={{ ...inp, minHeight:60, resize:'vertical' }} value={form.notes||''} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Internal notes..."/>
                </F>
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', gap:10 }}>
                <button onClick={() => setModal(null)} style={{ flex:1, padding:'12px', border:'1px solid #e5e5e5', borderRadius:10, cursor:'pointer', background:'#fff', fontSize:14, fontFamily:'inherit', color:'#555' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', border:'none', borderRadius:10, cursor:saving?'not-allowed':'pointer', background:'#f8f8f4', color:'#f98512', fontSize:14, fontWeight:700, fontFamily:'inherit', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : modal==='new' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {modal === 'receipt' && receipt && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:720, maxHeight:'94vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.22)' }}>

            {/* Receipt modal header */}
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <div>
                <h2 style={{ fontWeight:700, fontSize:17, color:'#1a1a1a', margin:0 }}>Repair Receipt</h2>
                <p style={{ fontSize:12, color:'#aaa', margin:'2px 0 0' }}>Order {receipt.orderId} · {receipt.customer?.name}</p>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {/* Photo upload */}
                <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange}/>
                <button onClick={() => photoRef.current?.click()}
                  style={{ padding:'7px 14px', border:'1px solid #e5e5e5', borderRadius:8, cursor:'pointer', background: photo ? '#f0fdf4' : '#fff', color: photo ? '#16a34a' : '#555', fontSize:12, fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {photo ? 'Photo added ✓' : 'Add Photo'}
                </button>
                <button onClick={downloadPdf}
                  style={{ padding:'7px 14px', border:'1px solid #e0e7ff', borderRadius:8, cursor:'pointer', background:'#f0f4ff', color:'#4f46e5', fontSize:12, fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
                <button onClick={printPdf}
                  style={{ padding:'7px 16px', border:'none', borderRadius:8, cursor:'pointer', background:'#f8f8f4', color:'#f98512', fontSize:12, fontFamily:'inherit', fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print
                </button>
                <button onClick={() => setModal(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', marginLeft:4 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div style={{ flex:1, overflow:'hidden', background:'#f5f5f5', borderRadius:'0 0 16px 16px' }}>
              {pdfUrl
                ? <iframe src={pdfUrl} style={{ width:'100%', height:'100%', border:'none', borderRadius:'0 0 16px 16px' }} title="Receipt Preview"/>
                : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#aaa', fontSize:14 }}>Generating preview...</div>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
