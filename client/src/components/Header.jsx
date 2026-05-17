import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { categoriesApi, productsApi } from '../lib/api'

const BRAND    = import.meta.env.VITE_BRAND_NAME || 'BMS Store'
const LOGO     = import.meta.env.VITE_LOGO_URL   || 'https://res.cloudinary.com/dktehnkms/image/upload/v1778760350/Logo-BMS_zoxgfa.jpg'
const LOGO_ALT = import.meta.env.VITE_LOGO_ALT   || 'BMS logo'
const PHONE    = import.meta.env.VITE_CONTACT_PHONE || '+21629226349'

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ChevronRight = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const CategoryIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
)

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Header() {
  const count    = useCartStore(s => s.items.reduce((n, i) => n + i.qty, 0))
  const loc      = useLocation()
  const navigate = useNavigate()

  const [menuOpen,           setMenuOpen]           = useState(false)
  const [searchQuery,        setSearchQuery]        = useState('')
  const [suggestions,        setSuggestions]        = useState([])
  const [showSuggest,        setShowSuggest]        = useState(false)
  const [loadingSuggest,     setLoadingSuggest]     = useState(false)
  const [categories,         setCategories]         = useState([])
  const [showCatMenu,        setShowCatMenu]        = useState(false)
  const [hoveredCat,         setHoveredCat]         = useState(null)
  const [mobileExpandedCats, setMobileExpandedCats] = useState({})

  const searchRef  = useRef(null)
  const catMenuRef = useRef(null)
  const debounced  = useDebounce(searchQuery, 300)

  const HAS_SECONDHAND  = import.meta.env.VITE_FEATURE_SECONDHAND  === 'true'
  const HAS_DIAGNOSTICS = import.meta.env.VITE_FEATURE_DIAGNOSTICS === 'true'

  useEffect(() => {
    categoriesApi.getTree()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!debounced.trim() || debounced.trim().length < 2) {
      setSuggestions([])
      setShowSuggest(false)
      return
    }
    setLoadingSuggest(true)
    productsApi.getAll({ search: debounced.trim(), limit: 6 })
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.products || data?.data || [])
        setSuggestions(items.slice(0, 6))
        setShowSuggest(true)
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggest(false))
  }, [debounced])

  useEffect(() => {
    function onOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggest(false)
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) { setShowCatMenu(false); setHoveredCat(null) }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const handleSearch = useCallback((e) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery(''); setSuggestions([]); setShowSuggest(false); setMenuOpen(false)
    }
  }, [searchQuery, navigate])

  const handleSuggestionClick = (p) => {
    navigate(`/products/${p._id || p.id}`)
    setSearchQuery(''); setShowSuggest(false); setMenuOpen(false)
  }

  const toggleMobileCat = (id) =>
    setMobileExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))

  const navItems = [
    { label: 'Home',         to: '/' },
    { label: 'Products',     to: '/products' },
    { label: 'New Arrivals', to: '/products?sort=newest' },
    { label: 'Deals',        to: '/products?isPromo=true' },
    ...(HAS_SECONDHAND  ? [{ label: 'Second Hand',  to: '/secondhand'  }] : []),
    ...(HAS_DIAGNOSTICS ? [{ label: 'Track Repair', to: '/diagnostics' }] : []),
  ]

  const activeCat = categories.find(c => c._id === hoveredCat) || categories[0] || null
  const subs      = activeCat?.children || activeCat?.subcategories || []

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        .hdr-wrap{position:sticky;top:0;z-index:200;box-shadow:0 2px 16px rgba(0,0,0,.13)}
        .hdr-top{background:#9c155f;color:rgba(255,255,255,.72);font-size:12px;padding:7px 0}
        .hdr-top-inner{max-width:1280px;margin:0 auto;padding:0 20px;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .hdr-phone{display:flex;align-items:center;gap:6px;color:inherit;text-decoration:none;transition:color .15s}
        .hdr-phone:hover{color:#fff}
        .hdr-badge{background:#f97316;color:#fff;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap}
        .hdr-main{background:#fff;border-bottom:1px solid #e8eaed;padding:12px 0}
        .hdr-main-inner{max-width:1280px;margin:0 auto;padding:0 20px;display:flex;align-items:center;gap:16px}
        .hdr-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex-shrink:0}
        .hdr-logo img{height:42px;object-fit:contain}
        .hdr-logo-name{font-weight:900;font-size:19px;color:#9c155f;letter-spacing:-.5px}
        .hdr-logo-name span{color:#f97316}
        .hdr-search-wrap{flex:1;max-width:680px;position:relative}
        .hdr-search-form{display:flex;width:100%}
        .hdr-search-input{width:100%;padding:11px 16px;border:2px solid #e2e5ea;border-right:none;border-radius:10px 0 0 10px;font-size:14px;font-family:inherit;outline:none;background:#f8f9fb;color:#1a1a2e;transition:border-color .2s,background .2s}
        .hdr-search-input:focus{border-color:#f97316;background:#fff}
        .hdr-search-input::placeholder{color:#aab}
        .hdr-search-btn{background:#f97316;color:#fff;border:2px solid #f97316;border-radius:0 10px 10px 0;padding:0 22px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s}
        .hdr-search-btn:hover{background:#ea6500;border-color:#ea6500}
        .hdr-suggest{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.07);border:1px solid #eee;z-index:500;overflow:hidden;animation:sgFade .15s ease}
        @keyframes sgFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .hdr-suggest-header{padding:10px 14px 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9c155f;border-bottom:1px solid #f5f5f5}
        .hdr-suggest-item{display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;transition:background .12s;border-bottom:1px solid #fafafa}
        .hdr-suggest-item:hover{background:#fff8f2}
        .hdr-suggest-img{width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;background:#f0f0f0;border:1px solid #eee}
        .hdr-suggest-img-ph{width:42px;height:42px;border-radius:8px;background:#f5f0fd;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#9c155f}
        .hdr-suggest-name{font-size:13.5px;font-weight:600;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
        .hdr-suggest-price{font-size:13px;font-weight:700;color:#f97316;flex-shrink:0}
        .hdr-suggest-footer{padding:10px 14px;background:#fafafa;text-align:center}
        .hdr-suggest-footer button{background:none;border:none;cursor:pointer;color:#9c155f;font-weight:700;font-size:13px;text-decoration:underline;font-family:inherit}
        .hdr-suggest-info{padding:18px;text-align:center;color:#999;font-size:13px}
        .hdr-cart{display:flex;align-items:center;gap:8px;background:#9c155f;color:#fff;border-radius:10px;padding:10px 18px;text-decoration:none;font-weight:700;font-size:13px;flex-shrink:0;transition:background .2s;white-space:nowrap}
        .hdr-cart:hover{background:#f97316}
        .hdr-cart-count{background:#f97316;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;transition:background .2s}
        .hdr-cart:hover .hdr-cart-count{background:#fff;color:#f97316}
        .hdr-nav{background:#f97316;position:relative}
        .hdr-nav-inner{max-width:1280px;margin:0 auto;padding:0 20px;display:flex;align-items:center}
        .hdr-nav-link{display:flex;align-items:center;gap:5px;padding:12px 18px;color:#fff;text-decoration:none;font-size:13.5px;font-weight:600;white-space:nowrap;transition:background .15s;position:relative}
        .hdr-nav-link:hover,.hdr-nav-link.is-active{background:rgba(0,0,0,.15)}
        .hdr-nav-link.is-active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:#fff;border-radius:3px 3px 0 0}
        .hdr-products-btn{display:flex;align-items:center;gap:6px;padding:12px 18px;color:#fff;font-size:13.5px;font-weight:700;white-space:nowrap;background:rgba(0,0,0,.18);cursor:pointer;border:none;font-family:inherit;transition:background .15s;letter-spacing:.2px}
        .hdr-products-btn:hover,.hdr-products-btn.is-open{background:rgba(0,0,0,.28)}
        .hdr-products-btn svg:last-child{transition:transform .2s}
        .hdr-products-btn.is-open svg:last-child{transform:rotate(180deg)}
        .hdr-mega{position:absolute;top:100%;left:0;right:0;background:#fff;z-index:400;box-shadow:0 12px 40px rgba(0,0,0,.16);border-top:3px solid #f97316;display:flex;max-height:520px;animation:megaFade .18s ease}
        @keyframes megaFade{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .hdr-mega-left{width:240px;flex-shrink:0;background:#f9f7fb;border-right:1px solid #eee;overflow-y:auto;padding:8px 0}
        .hdr-mega-cat{display:flex;align-items:center;justify-content:space-between;padding:11px 18px;cursor:pointer;font-size:13.5px;font-weight:600;color:#2d2d2d;border-left:3px solid transparent;transition:background .12s,color .12s,border-color .12s;gap:8px;text-decoration:none}
        .hdr-mega-cat:hover,.hdr-mega-cat.active{background:#fff;color:#9c155f;border-left-color:#9c155f}
        .hdr-mega-cat-icon{display:flex;align-items:center;color:#9c155f;opacity:.6;flex-shrink:0}
        .hdr-mega-cat.active .hdr-mega-cat-icon{opacity:1}
        .hdr-mega-cat-name{flex:1}
        .hdr-mega-cat-count{font-size:11px;color:#aaa;font-weight:500;flex-shrink:0}
        .hdr-mega-right{flex:1;padding:24px 28px;overflow-y:auto}
        .hdr-mega-right-title{font-size:15px;font-weight:800;color:#9c155f;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #f97316;display:flex;align-items:center;gap:8px}
        .hdr-mega-subs{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:4px 12px}
        .hdr-mega-sub{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#444;font-size:13px;transition:background .12s,color .12s}
        .hdr-mega-sub:hover{background:#fff4ee;color:#f97316}
        .hdr-mega-sub-dot{width:5px;height:5px;border-radius:50%;background:#ddd;flex-shrink:0;transition:background .12s}
        .hdr-mega-sub:hover .hdr-mega-sub-dot{background:#f97316}
        .hdr-mega-all{margin-top:20px;display:inline-flex;align-items:center;gap:6px;background:#9c155f;color:#fff;text-decoration:none;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;transition:background .15s}
        .hdr-mega-all:hover{background:#f97316}
        .hdr-mega-empty{color:#aaa;font-size:13px;padding:20px 0}
        .hdr-mobile-btn{display:none;background:none;border:none;color:#9c155f;cursor:pointer;padding:4px;flex-shrink:0}
        .hdr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:198}
        .hdr-drawer{position:fixed;top:0;left:0;bottom:0;width:310px;background:#fff;z-index:199;overflow-y:auto;box-shadow:4px 0 24px rgba(0,0,0,.15)}
        .hdr-drawer-head{background:#9c155f;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;color:#fff}
        .hdr-drawer-close{background:none;border:none;color:#fff;cursor:pointer;padding:4px;display:flex}
        .hdr-drawer-search{padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;gap:8px}
        .hdr-drawer-search-input{flex:1;padding:10px 14px;border:2px solid #e2e5ea;border-radius:8px;font-size:14px;font-family:inherit;outline:none}
        .hdr-drawer-search-input:focus{border-color:#f97316}
        .hdr-drawer-search-btn{background:#f97316;color:#fff;border:none;border-radius:8px;padding:0 14px;cursor:pointer;display:flex;align-items:center}
        .hdr-drawer-link{display:block;padding:13px 20px;color:#9c155f;text-decoration:none;font-weight:600;font-size:14.5px;border-bottom:1px solid #f0f0f0;transition:background .15s}
        .hdr-drawer-link:hover,.hdr-drawer-link.active{background:#fff8f5;color:#f97316}
        .hdr-drawer-cats-head{display:flex;align-items:center;justify-content:space-between;padding:13px 20px;cursor:default;font-weight:700;font-size:13px;color:#9c155f;background:#fdf8fb;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #eee}
        .hdr-drawer-cat{display:flex;align-items:center;justify-content:space-between;padding:11px 20px 11px 28px;font-size:13.5px;font-weight:600;color:#333;border-bottom:1px solid #f8f8f8;cursor:pointer;transition:background .12s}
        .hdr-drawer-cat:hover{background:#fff4ee;color:#f97316}
        .hdr-drawer-cat-chev{transition:transform .2s}
        .hdr-drawer-cat-chev.open{transform:rotate(90deg)}
        .hdr-drawer-sub{display:block;padding:9px 20px 9px 44px;font-size:13px;color:#666;text-decoration:none;border-bottom:1px solid #f9f9f9;transition:background .12s}
        .hdr-drawer-sub:hover{background:#fff4ee;color:#f97316}
        @media(max-width:900px){
          .hdr-mobile-btn{display:flex!important}
          .hdr-nav{display:none}
          .hdr-search-wrap{max-width:unset}
          .hdr-cart-label{display:none}
          .hdr-cart{padding:10px 14px}
          .hdr-top-promo{display:none}
        }
        @media(max-width:560px){
          .hdr-logo-name{display:none}
          .hdr-logo img{height:36px}
        }
      `}</style>

      <div className="hdr-wrap">
        {/* Top bar */}
        <div className="hdr-top">
          <div className="hdr-top-inner">
            <a href={`tel:${PHONE}`} className="hdr-phone"><PhoneIcon /> {PHONE}</a>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span className="hdr-badge hdr-top-promo">Free delivery on orders over 200 TND</span>
              <span style={{opacity:.55}}>Mon–Sat 9am–6pm</span>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="hdr-main">
          <div className="hdr-main-inner">
            <Link to="/" className="hdr-logo">
              {LOGO && <img src={LOGO} alt={LOGO_ALT} />}
              <span className="hdr-logo-name">
                {BRAND.length > 1 ? <>{BRAND.slice(0,-1)}<span>{BRAND.slice(-1)}</span></> : BRAND}
              </span>
            </Link>

            {/* Search with live suggestions */}
            <div className="hdr-search-wrap" ref={searchRef}>
              <form className="hdr-search-form" onSubmit={handleSearch}>
                <input
                  type="text" className="hdr-search-input" autoComplete="off"
                  placeholder="Search for products, brands, categories…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                />
                <button type="submit" className="hdr-search-btn" aria-label="Search"><SearchIcon /></button>
              </form>

              {showSuggest && (
                <div className="hdr-suggest">
                  <div className="hdr-suggest-header">
                    {loadingSuggest ? 'Searching…' : `Results for "${debounced}"`}
                  </div>
                  {loadingSuggest ? (
                    <div className="hdr-suggest-info">Loading suggestions…</div>
                  ) : suggestions.length === 0 ? (
                    <div className="hdr-suggest-info">No products found</div>
                  ) : (
                    <>
                      {suggestions.map(p => {
                        const img   = p.images?.[0] || p.image || p.imageUrl || null
                        const price = p.price ?? p.salePrice ?? null
                        const pid   = p._id || p.id
                        return (
                          <div key={pid} className="hdr-suggest-item" onClick={() => handleSuggestionClick(p)}>
                            {img
                              ? <img src={img} alt={p.name} className="hdr-suggest-img" />
                              : <div className="hdr-suggest-img-ph"><TagIcon /></div>
                            }
                            <span className="hdr-suggest-name">{p.name}</span>
                            {price != null && <span className="hdr-suggest-price">{Number(price).toLocaleString('fr-TN')} TND</span>}
                          </div>
                        )
                      })}
                      <div className="hdr-suggest-footer">
                        <button onClick={handleSearch}>View all results for &ldquo;{debounced}&rdquo; →</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart" className="hdr-cart" title="View cart">
              <CartIcon />
              <span className="hdr-cart-label">Cart</span>
              {count > 0 && <span className="hdr-cart-count">{count > 99 ? '99+' : count}</span>}
            </Link>

            <button onClick={() => setMenuOpen(o => !o)} className="hdr-mobile-btn" aria-label="Menu">
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Nav bar with mega-menu */}
        <nav className="hdr-nav">
          <div className="hdr-nav-inner">
            {/* Products dropdown */}
            <div ref={catMenuRef}>
              <button
                className={`hdr-products-btn${showCatMenu ? ' is-open' : ''}`}
                onClick={() => setShowCatMenu(o => !o)}
                onMouseEnter={() => setShowCatMenu(true)}
              >
                <GridIcon /> Products <ChevronDown />
              </button>

              {showCatMenu && (
                <div className="hdr-mega" onMouseLeave={() => { setShowCatMenu(false); setHoveredCat(null) }}>
                  <div className="hdr-mega-left">
                    {categories.length === 0
                      ? <div style={{padding:'20px 18px',color:'#aaa',fontSize:13}}>Loading…</div>
                      : categories.map(cat => {
                          const cid      = cat._id || cat.id
                          const subCount = (cat.children || cat.subcategories || []).length
                          const isActive = hoveredCat === cid || (!hoveredCat && categories[0]?._id === cid)
                          return (
                            <div
                              key={cid}
                              className={`hdr-mega-cat${isActive ? ' active' : ''}`}
                              onMouseEnter={() => setHoveredCat(cid)}
                              onClick={() => { navigate(`/products?category=${cid}`); setShowCatMenu(false) }}
                            >
                              <span className="hdr-mega-cat-icon"><CategoryIcon /></span>
                              <span className="hdr-mega-cat-name">{cat.name}</span>
                              {subCount > 0 && <span className="hdr-mega-cat-count">{subCount}</span>}
                              {subCount > 0 && <ChevronRight />}
                            </div>
                          )
                        })
                    }
                  </div>

                  <div className="hdr-mega-right">
                    {activeCat ? (
                      <>
                        <div className="hdr-mega-right-title">
                          <CategoryIcon /> {activeCat.name}
                        </div>
                        {subs.length === 0
                          ? <div className="hdr-mega-empty">No subcategories available</div>
                          : <div className="hdr-mega-subs">
                              {subs.map(sub => {
                                const sid = sub._id || sub.id
                                return (
                                  <Link key={sid} to={`/products?category=${sid}`} className="hdr-mega-sub" onClick={() => setShowCatMenu(false)}>
                                    <span className="hdr-mega-sub-dot" />{sub.name}
                                  </Link>
                                )
                              })}
                            </div>
                        }
                        <Link to={`/products?category=${activeCat._id || activeCat.id}`} className="hdr-mega-all" onClick={() => setShowCatMenu(false)}>
                          View all in {activeCat.name} →
                        </Link>
                      </>
                    ) : <div className="hdr-mega-empty">Select a category</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Other nav items */}
            {navItems.map(({ label, to }) => {
              const path     = to.split('?')[0]
              const isActive = loc.pathname === path && !to.includes('?')
              return (
                <Link key={to} to={to} className={`hdr-nav-link${isActive ? ' is-active' : ''}`}>{label}</Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="hdr-overlay" onClick={() => setMenuOpen(false)} />
          <div className="hdr-drawer">
            <div className="hdr-drawer-head">
              <span style={{fontWeight:800,fontSize:17}}>{BRAND}</span>
              <button className="hdr-drawer-close" onClick={() => setMenuOpen(false)}><CloseIcon /></button>
            </div>

            <form className="hdr-drawer-search" onSubmit={e => { handleSearch(e); setMenuOpen(false) }}>
              <input type="text" className="hdr-drawer-search-input" placeholder="Search products…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button type="submit" className="hdr-drawer-search-btn" aria-label="Search"><SearchIcon /></button>
            </form>

            {navItems.map(({ label, to }) => {
              const path     = to.split('?')[0]
              const isActive = loc.pathname === path && !to.includes('?')
              return (
                <Link key={to} to={to} className={`hdr-drawer-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              )
            })}

            {categories.length > 0 && (
              <>
                <div className="hdr-drawer-cats-head">
                  <span>All Categories</span>
                </div>
                {categories.map(cat => {
                  const cid        = cat._id || cat.id
                  const catSubs    = cat.children || cat.subcategories || []
                  const isExpanded = !!mobileExpandedCats[cid]
                  return (
                    <div key={cid}>
                      <div className="hdr-drawer-cat"
                        onClick={() => catSubs.length > 0
                          ? toggleMobileCat(cid)
                          : (navigate(`/products?category=${cid}`), setMenuOpen(false))
                        }
                      >
                        <span>{cat.name}</span>
                        {catSubs.length > 0 && (
                          <span className={`hdr-drawer-cat-chev${isExpanded ? ' open' : ''}`}>
                            <ChevronRight />
                          </span>
                        )}
                      </div>
                      {isExpanded && catSubs.map(sub => {
                        const sid = sub._id || sub.id
                        return (
                          <Link key={sid} to={`/products?category=${sid}`} className="hdr-drawer-sub" onClick={() => setMenuOpen(false)}>
                            › {sub.name}
                          </Link>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}

            <Link to="/cart" className="hdr-drawer-link" onClick={() => setMenuOpen(false)}>
              Cart {count > 0 && `(${count})`}
            </Link>
          </div>
        </>
      )}
    </>
  )
}
