import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import ProductCard from '../components/ProductCard'
import { productsApi, categoriesApi } from '../lib/api'

const IG = import.meta.env.VITE_INSTAGRAM || 'fcvhb:jnlk;'
const FB = import.meta.env.VITE_FACEBOOK  || 'cghjlik'

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid #eee' }}>
      <div style={{ height: 230, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 10, width: '40%', background: '#f0f0f0', borderRadius: 6, marginBottom: 10 }} />
        <div style={{ height: 14, width: '80%', background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 12, width: '30%', background: '#f0f0f0', borderRadius: 6, marginBottom: 14 }} />
        <div style={{ height: 38, background: '#f0f0f0', borderRadius: 9 }} />
      </div>
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, sub, linkTo, linkLabel = 'View all' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 10 }}>
      <div>
        {eyebrow && (
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', opacity: 0.55, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{eyebrow}</p>
        )}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.3, marginBottom: sub ? 6 : 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 14, color: '#888', marginTop: 4, maxWidth: 500, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo}
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, opacity: 0.85, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.85}>
          {linkLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      )}
    </div>
  )
}

// ─── Product grid ──────────────────────────────────────────────────────────────
function ProductGrid({ products, loading, cols = 4 }) {
  const skeletons = [...Array(cols * 2)]
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill,minmax(220px,1fr))`, gap: 20 }}>
      {skeletons.map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill,minmax(220px,1fr))`, gap: 20 }}>
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
  )
}

// ─── Category cards (with real images from admin) ──────────────────────────────
function CategorySection({ categories, loading }) {
  if (!loading && !categories.length) return null
  const roots = categories.filter(c => !c.parent).slice(0, 8)
  const FALLBACK_COLORS = ['#1a1a2e','#2d6a4f','#7b2d8b','#c0392b','#1a5276','#7d6608','#784212','#1f618d']

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 0' }}>
      <SectionHeader eyebrow="Browse" title="Shop by Category" sub="Find exactly what you're looking for" linkTo="/products" />
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ height: 140, borderRadius: 14, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
          {roots.map((cat, i) => (
            <Link key={cat._id} to={`/products?category=${cat._id}`}
              style={{ textDecoration: 'none', borderRadius: 14, overflow: 'hidden', position: 'relative', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
              {cat.image
                ? <img src={cat.image} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ position: 'absolute', inset: 0, background: FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
              }
              <div style={{ position: 'relative', background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)', padding: '32px 14px 14px' }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{cat.name}</p>
                {cat.description && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{cat.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Trust bar ─────────────────────────────────────────────────────────────────
const TRUST = [
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Fast Delivery', desc: 'Shipped & tracked' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Secure Payments', desc: 'Protected transactions' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>, title: 'Easy Returns', desc: '30-day hassle-free' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, title: '24/7 Support', desc: 'Always here for you' },
]

function TrustBar() {
  return (
    <div style={{ background: '#9c155f', color: '#fff', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 24 }}>
        {TRUST.map((t,i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ opacity: 0.8, flexShrink: 0 }}>{t.icon}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</p>
              <p style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Product slider ───────────────────────────────────────────────────────────
function ProductSlider({ products, loading }) {
  const skeletons = [...Array(6)]
  const scrollRef = React.useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
    }
  }

  const ArrowBtn = ({ dir }) => (
    <button onClick={() => scroll(dir)} style={{
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      [dir === -1 ? 'left' : 'right']: -18,
      width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e5e5',
      background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === -1 ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
      </svg>
    </button>
  )

  return (
    <div style={{ position: 'relative', padding: '0 20px' }}>
      <ArrowBtn dir={-1}/>
      <div ref={scrollRef} style={{
        display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none',
        msOverflowStyle: 'none', paddingBottom: 4,
        scrollSnapType: 'x mandatory',
      }}>
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} style={{ minWidth: 220, flexShrink: 0, height: 320, borderRadius: 12,
                background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', scrollSnapAlign: 'start' }}/>
            ))
          : products.slice(0, 8).map(p => (
              <div key={p._id} style={{ minWidth: 220, flexShrink: 0, scrollSnapAlign: 'start' }}>
                <ProductCard product={p}/>
              </div>
            ))
        }
      </div>
      <ArrowBtn dir={1}/>
    </div>
  )
}

// ─── Promo banner ──────────────────────────────────────────────────────────────
function PromoBanner({ products }) {
  if (!products.length) return null
  return (
    <section style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 24px' }}>
      <div style={{ background: '#9c155f', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Limited Time</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, marginBottom: 10, lineHeight: 1.15 }}>
            🔥 Hot Deals<br />Don't Miss Out
          </h2>
          <p style={{ opacity: 0.65, fontSize: 14, marginBottom: 24, maxWidth: 340 }}>Grab our best promotions before they sell out. Updated every week.</p>
          <Link to="/products?isPromo=true"
            style={{ display: 'inline-block', textDecoration: 'none', background: '#f97316', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
            Shop Deals →
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {products.slice(0,3).map(p => (
            <Link key={p._id} to={`/products/${p._id}`}
              style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', width: 130, flexShrink: 0, border: '1px solid rgba(255,255,255,0.12)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
              <img src={p.images?.[0] || 'https://placehold.co/130x120/555/fff?text=+'} alt={p.name}
                style={{ width: '100%', height: 110, objectFit: 'cover' }} />
              <div style={{ padding: '8px 10px' }}>
                <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                <p style={{ color: '#f97316', fontSize: 13, fontWeight: 800 }}>{p.price.toFixed(2)} TND</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter ────────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <section style={{ background: '#f7f7f5', padding: '72px 24px', marginTop: 80 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', opacity: 0.55, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Stay Updated</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.3, marginBottom: 10 }}>Get exclusive deals first</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.6 }}>Subscribe and be the first to know about new arrivals, special offers, and flash sales.</p>
        {sent ? (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '14px 20px', color: '#166534', fontWeight: 600, fontSize: 14 }}>
            ✅ Subscribed! Thanks for joining.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff' }} />
            <button onClick={() => email.includes('@') && setSent(true)}
              style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        )}
        <p style={{ fontSize: 11, color: '#ccc', marginTop: 12 }}>No spam. Unsubscribe any time.</p>
      </div>
    </section>
  )
}

// ─── Social strip ──────────────────────────────────────────────────────────────
function SocialStrip() {
  if (!IG && !FB) return null
  const IgIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/></svg>
  const FbIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
  return (
    <section style={{ padding: '40px 24px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#bbb', marginBottom: 14 }}>Follow us</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {IG && <a href={IG} target="_blank" rel="noreferrer"
            style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 20px',border:'1px solid #e0e0e0',borderRadius:10,color:'#444',textDecoration:'none',fontSize:14,fontWeight:600,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#e1306c';e.currentTarget.style.color='#e1306c'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.color='#444'}}>
            <IgIcon /> Instagram
          </a>}
          {FB && <a href={FB} target="_blank" rel="noreferrer"
            style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 20px',border:'1px solid #e0e0e0',borderRadius:10,color:'#444',textDecoration:'none',fontSize:14,fontWeight:600,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#1877f2';e.currentTarget.style.color='#1877f2'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.color='#444'}}>
            <FbIcon /> Facebook
          </a>}
        </div>
      </div>
    </section>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [latest,     setLatest]     = useState([])
  const [promos,     setPromos]     = useState([])
  const [popular,    setPopular]    = useState([])
  const [categories, setCategories] = useState([])
  const [loadingLatest,  setLoadingLatest]  = useState(true)
  const [loadingPromos,  setLoadingPromos]  = useState(true)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingCats,    setLoadingCats]    = useState(true)

  useEffect(() => {
    productsApi.getLatest(8)
      .then(d => setLatest(d.products || d))
      .catch(console.error)
      .finally(() => setLoadingLatest(false))

    productsApi.getPromos()
      .then(setPromos)
      .catch(console.error)
      .finally(() => setLoadingPromos(false))

    productsApi.getPopular()
      .then(setPopular)
      .catch(console.error)
      .finally(() => setLoadingPopular(false))

    categoriesApi.getFeatured()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoadingCats(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <HeroSlider />
      <TrustBar />

      {/* 1. Latest Products — always first, real-time from DB */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 0' }}>
        <SectionHeader
          eyebrow="Just In"
          title="Latest Products"
          sub="Fresh arrivals added to our catalog — be the first to grab them"
          linkTo="/products?sort=newest"
          linkLabel="See all new"
        />
        <ProductSlider products={latest} loading={loadingLatest} />
      </section>

      {/* 2. Categories with images managed from admin */}
      <CategorySection categories={categories} loading={loadingCats} />

      {/* 3. Promo banner + promo products */}
      {(loadingPromos || promos.length > 0) && <PromoBanner products={promos} />}

      {/* 4. Most sold */}
      <section style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 24px' }}>
        <SectionHeader
          eyebrow="Community Favourites"
          title="Best Sellers"
          sub="Products our customers keep coming back for"
          linkTo="/products?sort=popular"
          linkLabel="See all"
        />
        <ProductSlider products={popular} loading={loadingPopular} />
      </section>

      <Newsletter />
      <SocialStrip />
      <div style={{ height: 48 }} />
    </div>
  )
}
