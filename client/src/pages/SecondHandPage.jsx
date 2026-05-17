import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categoriesApi, brandsApi } from '../lib/api'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
const sh = { getAll: (params) => api.get('/secondhand', { params }).then(r => r.data) }

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }

function FilterPanel({ filters, categories, brands, set, clear }) {
  return (
    <div style={{ border:'1px solid #eee', borderRadius:14, padding:'18px 16px', background:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>Filters</p>
        <button onClick={clear} style={{ background:'none', border:'none', fontSize:12, color:'#f97316', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Clear all</button>
      </div>
      <div style={{ position:'relative', marginBottom:16 }}>
        <input placeholder="Search..." value={filters.search} onChange={e => set('search', e.target.value)} style={{ ...inp, paddingLeft:32 }}/>
        <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <label style={lbl}>Category</label>
      <select value={filters.category} onChange={e => set('category', e.target.value)} style={{ ...inp, marginBottom:14, cursor:'pointer' }}>
        <option value="">All</option>
        {categories.map(c => <option key={c._id} value={c._id}>{c.parent?'  └ ':''}{c.name}</option>)}
      </select>
      <label style={lbl}>Brand</label>
      <select value={filters.brand} onChange={e => set('brand', e.target.value)} style={{ ...inp, marginBottom:14, cursor:'pointer' }}>
        <option value="">All</option>
        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
      </select>
      <label style={lbl}>Price Range</label>
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        <input type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} style={{ ...inp, flex:1, width:0 }}/>
        <span style={{ color:'#ccc', lineHeight:'38px', flexShrink:0 }}>—</span>
        <input type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} style={{ ...inp, flex:1, width:0 }}/>
      </div>
      <label style={lbl}>Sort By</label>
      <select value={filters.sort} onChange={e => set('sort', e.target.value)} style={{ ...inp, cursor:'pointer' }}>
        <option value="default">Default</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
      </select>
    </div>
  )
}

export default function SecondHandPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [categories, setCategories] = useState([])
  const [brands,     setBrands]     = useState([])
  const [loading,    setLoading]    = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand:    searchParams.get('brand')    || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort:     searchParams.get('sort')     || 'default',
    search:   searchParams.get('search')   || '',
  })

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error)
    brandsApi.getAll().then(setBrands).catch(console.error)
  }, [])

  const set = (k, v) => {
    const next = { ...filters, [k]: v }
    setFilters(next)
    const p = {}
    Object.entries(next).forEach(([key, val]) => { if (val && val !== 'default') p[key] = val })
    setSearchParams(p, { replace: true })
  }

  const load = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v && v !== 'default'))
    sh.getAll(params).then(d => { setProducts(d.products); setTotal(d.total) }).catch(console.error).finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const clear = () => { setFilters({ category:'', brand:'', minPrice:'', maxPrice:'', sort:'default', search:'' }); setSearchParams({}, { replace:true }) }

  const activeFilters = Object.entries(filters).filter(([k,v]) => v && v !== 'default' && k !== 'sort').length

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .sh-drawer-overlay { display:none }
        .sh-sidebar { display:block }
        @media(max-width:768px) {
          .sh-layout { grid-template-columns: 1fr !important }
          .sh-sidebar { display:none }
          .sh-drawer-overlay { display:block; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:300 }
          .sh-drawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:20px 20px 0 0; padding:20px 16px 32px; z-index:301; max-height:88vh; overflow-y:auto; box-shadow:0 -8px 32px rgba(0,0,0,.15) }
          .sh-filter-fab { display:flex !important }
        }
        .sh-filter-fab { display:none; position:fixed; bottom:24px; right:20px; z-index:200; align-items:center; gap:8px; background:#9c155f; color:#fff; border:none; border-radius:50px; padding:12px 20px; font-size:14px; font-weight:700; font-family:inherit; cursor:pointer; box-shadow:0 4px 20px rgba(156,21,95,0.4) }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:20, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'inline-block', background:'var(--primary)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:20, letterSpacing:0.8, textTransform:'uppercase', marginBottom:8 }}>Second Hand</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a1a', letterSpacing:-0.3 }}>
            Pre-owned Products
            <span style={{ fontSize:14, fontWeight:400, color:'#aaa', marginLeft:8 }}>({total})</span>
          </h1>
        </div>
        {/* Desktop sort */}
        <select value={filters.sort} onChange={e => set('sort', e.target.value)}
          style={{ ...inp, width:'auto', minWidth:160, cursor:'pointer', flexShrink:0 }}>
          <option value="default">Sort: Default</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {/* Layout */}
      <div className="sh-layout" style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24, alignItems:'start' }}>
        {/* Sidebar — desktop */}
        <aside className="sh-sidebar" style={{ position:'sticky', top:80 }}>
          <FilterPanel filters={filters} categories={categories} brands={brands} set={set} clear={clear} />
        </aside>

        {/* Products */}
        <div>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16 }}>
              {[...Array(8)].map((_,i) => <div key={i} style={{ height:300, borderRadius:12, background:'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#bbb' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 16px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p style={{ fontSize:16, color:'#aaa' }}>No second-hand products found</p>
              <button onClick={clear} style={{ marginTop:12, background:'none', border:'1px solid #ddd', borderRadius:8, padding:'8px 20px', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'#888' }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16 }}>
              {products.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="sh-filter-fab" onClick={() => setDrawerOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
        Filters {activeFilters > 0 && <span style={{ background:'#f97316', borderRadius:50, padding:'1px 7px', fontSize:11 }}>{activeFilters}</span>}
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="sh-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="sh-drawer">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontWeight:800, fontSize:16 }}>Filters</p>
              <button onClick={() => setDrawerOpen(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#aaa', fontFamily:'inherit' }}>×</button>
            </div>
            <FilterPanel filters={filters} categories={categories} brands={brands} set={set} clear={clear} />
            <button onClick={() => setDrawerOpen(false)}
              style={{ width:'100%', marginTop:16, padding:'13px', background:'#9c155f', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
              Show Results ({total})
            </button>
          </div>
        </>
      )}
    </div>
  )
}
