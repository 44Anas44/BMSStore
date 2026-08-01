import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teamApi, achievementsApi, aboutApi } from '../lib/api'

const BRAND = 'BMS IT'

// ─── Company values — same icon language as the homepage trust bar ────────────
const VALUES = [
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Confiance',  desc: 'Des produits vérifiés et une transparence totale' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    title: 'Passion',    desc: "Une équipe qui aime vraiment la tech" },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    title: 'Rapidité',   desc: 'Livraison rapide partout en Tunisie' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    title: 'Support 24/7', desc: 'Toujours là quand vous en avez besoin' },
]

// ─── Services — placeholders, edit freely ──────────────────────────────────────
const SERVICES = [
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    title: 'Réparation & Diagnostic', desc: "Diagnostic gratuit et réparation rapide de vos appareils" },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    title: 'Vente de Produits', desc: 'Neuf et seconde main, sélectionnés avec soin' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09A1.65 1.65 0 0015 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    title: 'Installation & Configuration', desc: 'Mise en service et configuration sur place' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>,
    title: 'Sécurité & Surveillance', desc: 'Installation de caméras de sécurité et systèmes de surveillance' },
]

// ─── Section header — same convention as the homepage ─────────────────────────
function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      {eyebrow && (
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', opacity: 0.55, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{eyebrow}</p>
      )}
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.3, marginBottom: sub ? 8 : 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 14, color: '#888', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>{sub}</p>}
    </div>
  )
}

// ─── Team card — same border/shadow language as ProductCard ───────────────────
function TeamCard({ member }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden', background: '#fff',
        transition: 'transform 0.25s, box-shadow 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}>
      <div style={{ aspectRatio: '4/3', background: '#f7f7f7', position: 'relative' }}>
        {member.photo
          ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd', fontSize: 42, fontWeight: 800 }}>
              {member.name?.[0]?.toUpperCase() || '?'}
            </div>
        }
      </div>
      <div style={{ padding: '16px 18px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 3 }}>{member.name}</p>
        {member.role && (
          <p style={{ fontSize: 11, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: member.bio ? 8 : 0 }}>
            {member.role}
          </p>
        )}
        {member.bio && <p style={{ fontSize: 12.5, color: '#888', lineHeight: 1.55, marginBottom: (member.linkedin || member.email) ? 10 : 0 }}>{member.bio}</p>}
        {(member.linkedin || member.email) && (
          <div style={{ display: 'flex', gap: 10 }}>
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', display: 'flex' }} title="LinkedIn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.11 20.45H3.56V9h3.55v11.45z"/></svg>
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} style={{ color: '#888', display: 'flex' }} title="Email">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Achievement card — title, then date/location, then image, then optional description ─
function AchievementCard({ item }) {
  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
      <div style={{ padding: '18px 20px 14px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 6 }}>{item.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f97316', fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{item.date}</span>
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

      {item.desc && (
        <div style={{ padding: '14px 20px 18px' }}>
          <p style={{ fontSize: 12.5, color: '#888', lineHeight: 1.6 }}>{item.desc}</p>
        </div>
      )}
    </div>
  )
}

const dateFmt = (d) => {
  if (!d) return ''
  try { return new Date(d).getFullYear().toString() } catch { return '' }
}

export default function AboutPage() {
  const [heroImage, setHeroImage]         = useState('')
  const [team, setTeam]                   = useState([])
  const [achievements, setAchievements]   = useState([])
  const [loadingTeam, setLoadingTeam]     = useState(true)
  const [loadingAch, setLoadingAch]       = useState(true)

  useEffect(() => {
    aboutApi.getSettings().then(s => setHeroImage(s?.heroImage || '')).catch(console.error)
    teamApi.getPublic().then(setTeam).catch(console.error).finally(() => setLoadingTeam(false))
    achievementsApi.getPublic()
      .then(items => setAchievements(items.map(a => ({
        title: a.title, location: a.location, image: a.image,
        date: dateFmt(a.date), desc: a.description,
      }))))
      .catch(console.error)
      .finally(() => setLoadingAch(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {/* Hero image — falls back to a placeholder box until one is set from the admin app */}
      {heroImage ? (
        <div style={{ height: 320, background: '#f5f5f5' }}>
          <img src={heroImage} alt={BRAND} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{
          height: 320, background: 'repeating-linear-gradient(45deg, #eee, #eee 12px, #e6e6e6 12px, #e6e6e6 24px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <p style={{ fontSize: 12, fontWeight: 600, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Image de couverture à venir</p>
        </div>
      )}
      {/* Hero text */}
      <section style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', opacity: 0.55, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Qui sommes-nous</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, marginBottom: 14, color: '#1a1a1a' }}>À Propos de {BRAND}</h1>
        <p style={{ fontSize: 15, color: '#666', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Votre boutique électronique de confiance en Tunisie. Des produits de qualité,
          un service rapide et une équipe passionnée dédiée à votre satisfaction.
        </p>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: 24 }}>
          Découvrir nos produits
        </Link>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 0', textAlign: 'center' }}>
        <SectionHeader
          eyebrow="Notre Mission"
          title="Pourquoi BMS IT ?"
          sub="Depuis nos débuts, nous nous efforçons d'offrir aux clients tunisiens un accès simple et fiable aux meilleurs produits électroniques — des dernières nouveautés aux appareils de seconde main soigneusement vérifiés — tout en garantissant un support client réactif et des prix justes."
        />
      </section>

      {/* Values — reuses the icon language from the homepage trust bar */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18 }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: '22px 18px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(249,115,22,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                {v.icon}
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>{v.title}</p>
              <p style={{ fontSize: 12.5, color: '#888', lineHeight: 1.5 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services — placeholders, edit freely */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 0' }}>
        <SectionHeader eyebrow="Ce que nous offrons" title="Nos Services" sub="Un accompagnement complet, de l'achat à l'après-vente" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
          {SERVICES.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: '24px 20px', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(156,21,95,0.08)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                {s.icon}
              </div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 6 }}>{s.title}</p>
              <p style={{ fontSize: 12.5, color: '#888', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0' }}>
        <SectionHeader eyebrow="Notre Équipe" title="Rencontrez l'équipe" sub="Les personnes derrière BMS IT" />
        {loadingTeam ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ height: 14, width: '60%', background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 11, width: '40%', background: '#f0f0f0', borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : team.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#bbb', fontSize: 14, padding: '20px 0 10px' }}>Notre page équipe arrive bientôt.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {team.map(m => <TeamCard key={m._id} member={m} />)}
          </div>
        )}
      </section>

      {/* Achievements */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 0' }}>
        <SectionHeader eyebrow="Notre Parcours" title="Nos Réalisations" sub="Quelques étapes marquantes de l'histoire de BMS IT" />
        {loadingAch ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                <div style={{ padding: '18px 20px 14px' }}>
                  <div style={{ height: 14, width: '70%', background: '#f0f0f0', borderRadius: 6, marginBottom: 10 }} />
                  <div style={{ height: 10, width: '40%', background: '#f0f0f0', borderRadius: 6 }} />
                </div>
                <div style={{ aspectRatio: '16/9', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              </div>
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#bbb', fontSize: 14, padding: '20px 0 10px' }}>Nos réalisations arrivent bientôt.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {achievements.map((a, i) => <AchievementCard key={i} item={a} />)}
          </div>
        )}
      </section>

      {/* CTA footer band — matches the newsletter section style */}
      <section style={{ background: '#f7f7f5', padding: '64px 24px', marginTop: 80, textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', opacity: 0.55, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Prêt à commencer ?</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, marginBottom: 20, color: '#1a1a1a' }}>Découvrez notre catalogue dès aujourd'hui</h2>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Voir les produits
        </Link>
      </section>
    </div>
  )
}
