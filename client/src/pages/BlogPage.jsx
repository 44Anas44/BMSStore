import React, { useEffect, useState } from 'react'
import { achievementsApi } from '../lib/api'

function SkeletonPost() {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid #eee' }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ height: 10, width: '30%', background: '#f0f0f0', borderRadius: 6, marginBottom: 10 }} />
        <div style={{ height: 16, width: '75%', background: '#f0f0f0', borderRadius: 6, marginBottom: 10 }} />
        <div style={{ height: 12, width: '90%', background: '#f0f0f0', borderRadius: 6 }} />
      </div>
    </div>
  )
}

const dateFmt = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return '' }
}

function PostCard({ item }) {
  return (
    <article style={{ borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid #eee', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
      <div style={{ padding: '18px 20px 14px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.35 }}>{item.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f97316', fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{dateFmt(item.date)}</span>
          {item.location && (
            <>
              <span style={{ color: '#ddd' }}>•</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{item.location}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ aspectRatio: '16/9', background: '#f5f5f5', position: 'relative' }}>
        {item.image
          ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p style={{ fontSize: 10.5, fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Image à venir</p>
            </div>
        }
      </div>

      {item.description && (
        <div style={{ padding: '14px 20px 18px' }}>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{item.description}</p>
        </div>
      )}
    </article>
  )
}

export default function BlogPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    achievementsApi.getPublic()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <section style={{ background: 'linear-gradient(135deg,#9c155f 0%,#b91c6e 100%)', color: '#fff', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Blog</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, marginBottom: 14 }}>Nos Réalisations</h1>
        <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Étapes clés, récompenses et moments forts qui ont marqué notre parcours.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 0' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
            {[...Array(3)].map((_, i) => <SkeletonPost key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#bbb', fontSize: 14, padding: '20px 0 40px' }}>
            Aucune réalisation publiée pour le moment — revenez bientôt !
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
            {items.map(item => <PostCard key={item._id} item={item} />)}
          </div>
        )}
      </section>

      <div style={{ height: 64 }} />
    </div>
  )
}
