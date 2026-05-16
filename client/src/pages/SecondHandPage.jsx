import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categoriesApi, brandsApi } from '../lib/api'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
const sh = { getAll: (params) => api.get('/secondhand', { params }).then(r => r.data) }

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }

export default function SecondHandPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [categories, setCategories] = useState([])
  const [brands,     setBrands]     = useState([])
  const [loading,    setLoading]    = useState(false)
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

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'inline-block', background:'var(--primary)', color:'var(--secondary)', fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:20, letterSpacing:0.8, textTransform:'uppercase', marginBottom:10 }}>Second Hand</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#1a1a1a', letterSpacing:-0.3 }}>
          Pre-owned Products
          <span style={{ fontSize:15, fontWeight:400, color:'#aaa', marginLeft:10 }}>({total})</span>
        </h1>
        <p style={{ fontSize:14, color:'#888', marginTop:4 }}>Quality second-hand items at great prices — inspected and verified.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:28, alignItems:'start' }}>
        <aside style={{ position:'sticky', top:80 }}>
          <div style={{ border:'1px solid #eee', borderRadius:14, padding:'18px 16px', background:'#fff' }}>
            <p style={{ fontWeight:700, marginBottom:16, fontSize:14, color:'#1a1a1a' }}>Filters</p>
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
            <select value={filters.sort} onChange={e => set('sort', e.target.value)} style={{ ...inp, marginBottom:14, cursor:'pointer' }}>
              <option value="default">Default</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <button onClick={clear} style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, cursor:'pointer', fontSize:13, background:'#fafafa', color:'#666', fontFamily:'inherit', fontWeight:500 }}>Clear Filters</button>
          </div>
        </aside>

        <div>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:20 }}>
              {[...Array(8)].map((_,i) => <div key={i} style={{ height:320, borderRadius:12, background:'#f0f0f0', animation:'shimmer 1.4s infinite' }}/>)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#bbb' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 16px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p style={{ fontSize:16, color:'#aaa' }}>No second-hand products found</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:20 }}>
              {products.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
