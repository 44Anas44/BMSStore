import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoriesApi } from '../lib/api'

const BRAND   = import.meta.env.VITE_BRAND_NAME     || 'BMS Store'
const LOGO    = import.meta.env.VITE_LOGO_URL        || 'https://res.cloudinary.com/dktehnkms/image/upload/v1778760350/Logo-BMS_zoxgfa.jpg'
const ADDRESS = import.meta.env.VITE_CONTACT_ADDRESS || ''
const PHONE   = import.meta.env.VITE_CONTACT_PHONE   || '+21629226349'
const EMAIL   = import.meta.env.VITE_CONTACT_EMAIL   || 'anas4hamadi@gmail.com'
const HOURS   = import.meta.env.VITE_CONTACT_HOURS   || 'Mon–Sat 9am–6pm'
const IG      = import.meta.env.VITE_INSTAGRAM       || '#'
const FB      = import.meta.env.VITE_FACEBOOK        || '#'

/* ── Icons ─────────────────────────────────────────── */
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/>
  </svg>
)
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
)
const TikTokIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
)
const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

/* Trust bar SVG icons */
const TruckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 4v4h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
)
const HeadphonesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
)
const VisaIcon = () => (
  <svg width="28" height="18" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="30" rx="4" fill="rgba(255,255,255,0.12)"/>
    <text x="24" y="21" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="13" fontWeight="800" fontFamily="serif" letterSpacing="1">VISA</text>
  </svg>
)
const CashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M6 12h.01M18 12h.01"/>
  </svg>
)

/* ── Sub-components ─────────────────────────────────── */
const SocialBtn = ({ href, children, title }) => (
  <a href={href} target="_blank" rel="noreferrer" title={title}
    style={{display:'flex',alignItems:'center',justifyContent:'center',width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.8)',textDecoration:'none',transition:'background .15s,border-color .15s,color .15s'}}
    onMouseEnter={e => { e.currentTarget.style.background='#f97316'; e.currentTarget.style.borderColor='#f97316'; e.currentTarget.style.color='#fff' }}
    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}
  >{children}</a>
)

const FooterLink = ({ to, children }) => (
  <Link to={to}
    style={{display:'flex',alignItems:'center',gap:7,color:'rgba(255,255,255,0.62)',textDecoration:'none',marginBottom:9,fontSize:13.5,transition:'color .15s,padding-left .15s'}}
    onMouseEnter={e => { e.currentTarget.style.color='#f97316'; e.currentTarget.style.paddingLeft='4px' }}
    onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.62)'; e.currentTarget.style.paddingLeft='0' }}
  >
    <span style={{width:5,height:5,borderRadius:'50%',background:'rgba(249,115,22,0.5)',flexShrink:0,display:'inline-block'}}/>
    {children}
  </Link>
)

const ContactRow = ({ icon, children }) => (
  <div style={{display:'flex',gap:10,alignItems:'flex-start',color:'rgba(255,255,255,0.62)',fontSize:13.5,marginBottom:13}}>
    <span>{icon}</span>
    <span style={{lineHeight:1.55}}>{children}</span>
  </div>
)

const ColTitle = ({ children }) => (
  <p style={{fontWeight:800,fontSize:11.5,letterSpacing:1.4,textTransform:'uppercase',color:'#f97316',marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
    <span style={{display:'inline-block',width:22,height:2,background:'#f97316',borderRadius:2}}/>
    {children}
  </p>
)

/* ── Mobile accordion for categories ─────────────────── */
function MobileCatGroup({ cat }) {
  const [open, setOpen] = useState(false)
  const subs = cat.children || cat.subcategories || []
  const cid  = cat._id || cat.id
  return (
    <div style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',cursor:'pointer',fontSize:13.5,fontWeight:600,color:'rgba(255,255,255,0.75)'}}
      >
        <span>{cat.name}</span>
        <span style={{transition:'transform .2s',transform:open?'rotate(180deg)':'rotate(0deg)'}}><ChevronDown /></span>
      </div>
      {open && (
        <div style={{paddingBottom:8,paddingLeft:12}}>
          <FooterLink to={`/products?category=${cid}`}>All in {cat.name}</FooterLink>
          {subs.map(sub => (
            <FooterLink key={sub._id||sub.id} to={`/products?category=${sub._id||sub.id}`}>{sub.name}</FooterLink>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Trust bar items ─────────────────────────────────── */
const trustItems = [
  { icon: <TruckIcon />,      label: 'Fast Delivery',   sub: 'Tracked shipping' },
  { icon: <ShieldIcon />,     label: 'Secure Payments', sub: '100% safe checkout' },
  { icon: <RefreshIcon />,    label: 'Easy Returns',    sub: '30-day policy' },
  { icon: <HeadphonesIcon />, label: '24/7 Support',    sub: 'Always here to help' },
]

/* ── Main Footer ─────────────────────────────────────── */
export default function Footer() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoriesApi.getTree()
      .then(data => setCategories(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {})
  }, [])

  return (
    <footer style={{background:'#9c155f',color:'#fff',marginTop:80}}>

      {/* Trust bar */}
      <div style={{background:'#8a1254',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'0'}}>
          {trustItems.map(({ icon, label, sub }) => (
            <div key={label} style={{display:'flex',alignItems:'center',gap:14,padding:'18px 16px',borderRight:'1px solid rgba(255,255,255,0.07)'}}>
              <span style={{color:'rgba(255,255,255,0.85)',flexShrink:0}}>{icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:13.5,color:'#fff'}}>{label}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:2}}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orange gradient divider */}
      <div style={{height:4,background:'linear-gradient(90deg,#f97316 0%,#fbbf24 60%,#f97316 100%)'}}/>

      {/* Main footer grid */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'56px 24px 48px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:'48px 40px'}}>

        {/* Brand column */}
        <div>
          {LOGO && (
            <img src={LOGO} alt={BRAND} style={{height:46,objectFit:'contain',marginBottom:16,display:'block',filter:'brightness(0) invert(1)'}}/>
          )}
          <p style={{fontWeight:900,fontSize:19,marginBottom:6,letterSpacing:-.3}}>{BRAND}</p>
          <p style={{color:'rgba(255,255,255,0.42)',fontSize:13,lineHeight:1.65,marginBottom:22}}>
            Your trusted electronics &amp; tech store in Tunisia. Quality products at the best prices.
          </p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {IG && IG !== '#' && <SocialBtn href={IG} title="Instagram"><InstagramIcon /></SocialBtn>}
            {FB && FB !== '#' && <SocialBtn href={FB} title="Facebook"><FacebookIcon /></SocialBtn>}
            <SocialBtn href="#" title="TikTok"><TikTokIcon /></SocialBtn>
          </div>
          <div style={{marginTop:24,padding:'14px 16px',background:'rgba(255,255,255,0.06)',borderRadius:10,border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#f97316',marginBottom:6}}>Newsletter</div>
            <div style={{display:'flex',gap:0}}>
              <input
                type="email" placeholder="your@email.com"
                style={{flex:1,padding:'8px 12px',border:'none',borderRadius:'8px 0 0 8px',fontSize:13,background:'rgba(255,255,255,0.12)',color:'#fff',outline:'none'}}
              />
              <button style={{padding:'8px 14px',background:'#f97316',border:'none',borderRadius:'0 8px 8px 0',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Navigation column */}
        <div>
          <ColTitle>Navigation</ColTitle>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/products">All Products</FooterLink>
          <FooterLink to="/products?sort=newest">New Arrivals</FooterLink>
          <FooterLink to="/products?isPromo=true">Deals &amp; Promos</FooterLink>
          <FooterLink to="/cart">My Cart</FooterLink>
        </div>

        {/* Categories column (desktop: static links; mobile: accordion) */}
        <div>
          <ColTitle>Categories</ColTitle>
          {categories.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:13}}>Loading…</p>
          ) : (
            <>
              {/* Desktop */}
              <div className="ftr-cats-desktop">
                {categories.map(cat => {
                  const cid = cat._id || cat.id
                  return <FooterLink key={cid} to={`/products?category=${cid}`}>{cat.name}</FooterLink>
                })}
                <FooterLink to="/products">Browse All →</FooterLink>
              </div>
              {/* Mobile accordion */}
              <div className="ftr-cats-mobile">
                {categories.map(cat => <MobileCatGroup key={cat._id||cat.id} cat={cat} />)}
              </div>
            </>
          )}
        </div>

        {/* Contact column */}
        <div>
          <ColTitle>Contact Us</ColTitle>
          {ADDRESS && <ContactRow icon={<MapPinIcon />}>{ADDRESS}</ContactRow>}
          {PHONE && (
            <a href={`tel:${PHONE}`}
              style={{display:'flex',gap:10,alignItems:'flex-start',color:'rgba(255,255,255,0.62)',textDecoration:'none',fontSize:13.5,marginBottom:13,transition:'color .15s'}}
              onMouseEnter={e => e.currentTarget.style.color='#f97316'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.62)'}
            >
              <PhoneIcon />{PHONE}
            </a>
          )}
          {EMAIL && (
            <a href={`mailto:${EMAIL}`}
              style={{display:'flex',gap:10,alignItems:'flex-start',color:'rgba(255,255,255,0.62)',textDecoration:'none',fontSize:13.5,marginBottom:13,transition:'color .15s'}}
              onMouseEnter={e => e.currentTarget.style.color='#f97316'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.62)'}
            >
              <MailIcon />{EMAIL}
            </a>
          )}
          {HOURS && <ContactRow icon={<ClockIcon />}>{HOURS}</ContactRow>}

          {/* Payment icons */}
          <div style={{marginTop:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#f97316',marginBottom:10}}>We Accept</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              {['Visa','CIB','Cash','COD'].map(m => (
                <span key={m} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:6,padding:'4px 10px',fontSize:11.5,fontWeight:600,color:'rgba(255,255,255,0.75)'}}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.32)'}}>
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(t => (
              <a key={t} href="#" style={{fontSize:12,color:'rgba(255,255,255,0.28)',textDecoration:'none',transition:'color .15s'}}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.65)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}
              >{t}</a>
            ))}
          </div>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.22)'}}>Powered by {BRAND}</p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .ftr-cats-mobile { display: none; }
        @media (max-width: 640px) {
          .ftr-cats-desktop { display: none; }
          .ftr-cats-mobile  { display: block; }
        }
        @media (max-width: 768px) {
          footer > div:first-child > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          footer > div:first-child > div {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}