import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsApi, quotesApi } from '../lib/api'

const PHONE   = '+21699960432'
const ADDRESS = 'Rue El Akkad, Manouba 2010'
const HOURS   = 'Lun–Ven 8h–17h / sam 8h-13h'
const EMAIL   = 'commercial@bms-it.tn'

const inp = { width:'100%', padding:'12px 14px', border:'1.5px solid #e5e5e5', borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:12, fontWeight:700, color:'#666', marginBottom:6 }

function Field({ label, required, children }) {
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color:'#f97316' }}> *</span>}</label>
      {children}
    </div>
  )
}

export default function QuotePage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name:'', company:'', phone:'', email:'', message:'', website:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // arriving from a product (?product=ID): start the message with that product
  useEffect(() => {
    const id = searchParams.get('product')
    if (!id) return
    productsApi.getById(id)
      .then(p => setForm(f => f.message ? f : { ...f, message: `Bonjour, je souhaite recevoir un devis pour :\n- ${p.name}\n\nQuantité : ` }))
      .catch(() => {})
  }, [searchParams])

  const submit = async (e) => {
    e.preventDefault()
    if (sending) return
    setError('')
    setSending(true)
    try {
      await quotesApi.create(form)
      setSent(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible d’envoyer la demande pour le moment. Réessayez ou appelez-nous.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'36px 16px 56px' }}>
      <style>{`
        .qt-grid { display:grid; grid-template-columns: 1.4fr 1fr; gap:28px; align-items:start }
        .qt-row2 { display:grid; grid-template-columns: 1fr 1fr; gap:14px }
        .qt-input:focus { border-color:#9c155f !important }
        .qt-info a { color:inherit; text-decoration:none } .qt-info a:hover { color:#f97316 }
        @media (max-width: 800px) { .qt-grid { grid-template-columns:1fr } .qt-row2 { grid-template-columns:1fr } }
      `}</style>

      <p style={{ fontSize:12, fontWeight:700, color:'#f97316', letterSpacing:1.2, textTransform:'uppercase', marginBottom:8 }}>Service commercial</p>
      <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:-0.5, marginBottom:8, color:'#1a1a1a' }}>Demande de devis</h1>
      <p style={{ fontSize:15, color:'#777', lineHeight:1.6, marginBottom:28, maxWidth:620 }}>
        Décrivez votre besoin (produits, quantités, délais). Notre équipe commerciale vous répond avec une offre adaptée.
      </p>

      <div className="qt-grid">
        {sent ? (
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:16, padding:'36px 28px', textAlign:'center' }}>
            <div style={{ fontSize:42, marginBottom:10 }}>✅</div>
            <h2 style={{ fontSize:20, fontWeight:800, color:'#166534', marginBottom:8 }}>Demande envoyée</h2>
            <p style={{ fontSize:14.5, color:'#166534', lineHeight:1.6, marginBottom:22 }}>
              Merci {form.name.split(' ')[0]} ! Nous avons bien reçu votre demande et nous vous recontactons dans les meilleurs délais.
            </p>
            <Link to="/products" style={{ display:'inline-block', background:'#9c155f', color:'#fff', padding:'12px 26px', borderRadius:10, fontWeight:700, fontSize:14, textDecoration:'none' }}>
              Continuer mes achats
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background:'#fff', border:'1px solid #eee', borderRadius:16, padding:'26px 24px', display:'grid', gap:16 }}>
            <div className="qt-row2">
              <Field label="Nom complet" required>
                <input className="qt-input" style={inp} value={form.name} onChange={set('name')} required maxLength={200} autoComplete="name" />
              </Field>
              <Field label="Société">
                <input className="qt-input" style={inp} value={form.company} onChange={set('company')} maxLength={200} autoComplete="organization" />
              </Field>
            </div>
            <div className="qt-row2">
              <Field label="Téléphone" required>
                <input className="qt-input" style={inp} type="tel" value={form.phone} onChange={set('phone')} required maxLength={60} autoComplete="tel" />
              </Field>
              <Field label="E-mail">
                <input className="qt-input" style={inp} type="email" value={form.email} onChange={set('email')} maxLength={200} autoComplete="email" />
              </Field>
            </div>
            <Field label="Votre besoin" required>
              <textarea className="qt-input" style={{ ...inp, minHeight:150, resize:'vertical', lineHeight:1.5 }} value={form.message} onChange={set('message')}
                required maxLength={3000} placeholder="Ex : 10 PC portables Dell Latitude i5 / 16 Go / 512 Go SSD, livraison à Tunis…" />
            </Field>

            {/* honeypot: invisible to people, bots fill it in */}
            <input name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position:'absolute', left:'-9999px', width:1, height:1, opacity:0 }} />

            {error && <div role="alert" style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', borderRadius:10, padding:'10px 14px', fontSize:13.5 }}>{error}</div>}

            <button type="submit" disabled={sending}
              style={{ background:'#f97316', color:'#fff', border:'none', borderRadius:10, padding:'14px', fontWeight:800, fontSize:15, fontFamily:'inherit', cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>
            <p style={{ fontSize:12, color:'#aaa', textAlign:'center' }}>Les champs marqués d’un * sont obligatoires.</p>
          </form>
        )}

        <aside className="qt-info" style={{ background:'#fdf6fa', border:'1px solid #f0dce8', borderRadius:16, padding:'22px 22px', fontSize:14, color:'#444', lineHeight:1.7 }}>
          <p style={{ fontWeight:800, fontSize:15, color:'#9c155f', marginBottom:12 }}>Une question ? Contactez-nous</p>
          <p><strong>Téléphone</strong><br /><a href={`tel:${PHONE}`}>{PHONE}</a></p>
          <p style={{ marginTop:10 }}><strong>E-mail commercial</strong><br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          <p style={{ marginTop:10 }}><strong>Adresse</strong><br />{ADDRESS}</p>
          <p style={{ marginTop:10 }}><strong>Horaires</strong><br />{HOURS}</p>
        </aside>
      </div>
    </div>
  )
}
