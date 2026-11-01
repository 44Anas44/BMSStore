import React, { useEffect, useState } from 'react'
import { quotesApi } from '../../lib/api'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'contacted', 'done']

const STATUS_LABEL = { new: 'Nouvelle', contacted: 'Contactée', done: 'Traitée' }
const STATUS_STYLE = {
  new:       { color:'#d97706', bg:'#fef3c7' },
  contacted: { color:'#2563eb', bg:'#dbeafe' },
  done:      { color:'#16a34a', bg:'#dcfce7' },
}

const Pill = ({ status }) => {
  const s = STATUS_STYLE[status] || { color:'#888', bg:'#f5f5f5' }
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, letterSpacing:0.4 }}>{STATUS_LABEL[status] || status}</span>
}

const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })

export default function AdminQuotes() {
  const [data, setData]         = useState({ quotes: [], total: 0, counts: { new: 0, contacted: 0, done: 0 } })
  const [filter, setFilter]     = useState('')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    quotesApi.getAll({ status: filter, limit: 100 })
      .then(setData).catch(() => toast.error('Impossible de charger les demandes'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const changeStatus = async (id, status) => {
    try {
      await quotesApi.updateStatus(id, status)
      toast.success('Statut mis à jour')
      load()
      window.dispatchEvent(new Event('quotes-changed'))       // refreshes the counter in the sidebar
    } catch { toast.error('La mise à jour a échoué') }
  }

  const remove = async (q) => {
    if (!window.confirm(`Supprimer la demande de ${q.name} ?`)) return
    try {
      await quotesApi.remove(q._id)
      toast.success('Demande supprimée')
      load()
      window.dispatchEvent(new Event('quotes-changed'))
    } catch { toast.error('La suppression a échoué') }
  }

  const all = data.counts.new + data.counts.contacted + data.counts.done
  const tabs = [['', 'Toutes', all], ...STATUSES.map(s => [s, STATUS_LABEL[s] + 's', data.counts[s]])]

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Demandes de devis</h1>
        <p style={{ fontSize:13, color:'#aaa', marginTop:3 }}>{all} demande{all !== 1 ? 's' : ''} au total · {data.counts.new} nouvelle{data.counts.new !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {tabs.map(([value, label, count]) => (
          <button key={value} onClick={() => setFilter(value)}
            style={{ padding:'7px 14px', borderRadius:20, border:`1px solid ${filter === value ? '#f98512' : '#e5e5e5'}`, background: filter === value ? '#fff7ed' : '#fff',
              color: filter === value ? '#c2410c' : '#666', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            {label} <span style={{ opacity:0.6, fontWeight:500 }}>({count})</span>
          </button>
        ))}
      </div>

      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, overflow:'hidden' }}>
        {loading && <div style={{ padding:40, textAlign:'center', color:'#ccc', fontSize:14 }}>Chargement…</div>}
        {!loading && data.quotes.length === 0 && (
          <div style={{ padding:48, textAlign:'center', color:'#bbb', fontSize:14 }}>
            Aucune demande {filter ? `« ${STATUS_LABEL[filter].toLowerCase()} »` : 'pour le moment'}
          </div>
        )}

        {data.quotes.map(q => {
          const open = expanded === q._id
          return (
            <div key={q._id} style={{ borderBottom:'1px solid #f8f8f8' }}>
              <div onClick={() => setExpanded(open ? null : q._id)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                {q.status === 'new' && <span title="Nouvelle" style={{ width:9, height:9, borderRadius:'50%', background:'#f97316', flexShrink:0 }} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>{q.name}</span>
                    {q.company && <span style={{ fontSize:12, color:'#888' }}>· {q.company}</span>}
                    <Pill status={q.status} />
                  </div>
                  <p style={{ fontSize:12, color:'#aaa', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {fmtDate(q.createdAt)} · {q.phone}{q.email ? ` · ${q.email}` : ''}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              {open && (
                <div style={{ padding:'14px 20px 18px', background:'#fafafa', borderTop:'1px solid #f5f5f5' }}>
                  <p style={{ fontSize:11, color:'#aaa', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Besoin du client</p>
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'12px 14px', fontSize:14, color:'#333', lineHeight:1.55, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{q.message}</div>

                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, flexWrap:'wrap' }}>
                    <a href={`tel:${q.phone.replace(/\s+/g, '')}`} style={btn('#16a34a')}>📞 Appeler</a>
                    {q.email && <a href={`mailto:${q.email}?subject=${encodeURIComponent('Votre demande de devis — BMS IT')}`} style={btn('#2563eb')}>✉️ Répondre par e-mail</a>}
                    <div style={{ flex:1 }} />
                    <select value={q.status} onChange={e => changeStatus(q._id, e.target.value)}
                      style={{ padding:'8px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:13, background:'#fff', color:'#555', fontFamily:'inherit', cursor:'pointer' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                    <button onClick={() => remove(q)} style={{ padding:'8px 14px', border:'1px solid #fecaca', borderRadius:8, background:'#fff', color:'#dc2626', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const btn = (color) => ({ padding:'8px 14px', borderRadius:8, background:color, color:'#fff', fontSize:13, fontWeight:600, textDecoration:'none', display:'inline-block' })
