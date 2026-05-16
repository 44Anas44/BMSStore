import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productsApi, categoriesApi, brandsApi } from '../lib/api'

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }
const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }

export default function ProductsPage() {
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
    page: 1,
  })

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error)
    brandsApi.getAll().then(setBrands).catch(console.error)
  }, [])

  const set = (k, v) => {
    const next = { ...filters, [k]: v, page: 1 }
    setFilters(next)
    const p = {}
    Object.entries(next).forEach(([key, val]) => {
      if (val && val !== 'default' && key !== 'page') p[key] = val
    })
    setSearchParams(p, { replace: true })
  }

  const load = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(
      Object.entries(filters).filter(([,v]) => v !== '' && v !== 'default')
    )
    productsApi.getAll(params)
      .then(d => { setProducts(d.products); setTotal(d.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const clear = () => {
    const empty = { category: '', brand: '', minPrice: '', maxPrice: '', sort: 'default', search: '', page: 1 }
    setFilters(empty)
    setSearchParams({}, { replace: true })
  }

  const activeCat = categories.find(c => c._id === filters.category)

  // Count active filters for the badge
  const activeFilterCount = [
    filters.category, filters.brand, filters.minPrice, filters.maxPrice,
    filters.search, filters.sort !== 'default' ? filters.sort : ''
  ].filter(Boolean).length

  const FilterPanel = () => (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: '18px 16px', background: '#fff' }}>
      <p style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, color: '#1a1a1a' }}>Filters</p>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><SearchIcon/></div>
        <input placeholder="Search products..." value={filters.search}
          onChange={e => set('search', e.target.value)}
          style={{ ...inp, paddingLeft: 32 }}/>
      </div>

      <label style={lbl}>Category</label>
      <select value={filters.category} onChange={e => set('category', e.target.value)} style={{ ...inp, marginBottom: 14, cursor: 'pointer' }}>
        <option value="">All categories</option>
        {categories.map(c => <option key={c._id} value={c._id}>{c.parent ? '  └ ' : ''}{c.name}</option>)}
      </select>

      <label style={lbl}>Brand</label>
      <select value={filters.brand} onChange={e => set('brand', e.target.value)} style={{ ...inp, marginBottom: 14, cursor: 'pointer' }}>
        <option value="">All brands</option>
        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
      </select>

      <label style={lbl}>Price Range</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <input type="number" min="0" placeholder="Min" value={filters.minPrice}
          onChange={e => set('minPrice', e.target.value)}
          style={{ ...inp, width: 0, flex: 1, minWidth: 0 }}/>
        <span style={{ color: '#ccc', lineHeight: '38px', flexShrink: 0, fontSize: 13 }}>—</span>
        <input type="number" min="0" placeholder="Max" value={filters.maxPrice}
          onChange={e => set('maxPrice', e.target.value)}
          style={{ ...inp, width: 0, flex: 1, minWidth: 0 }}/>
      </div>

      <label style={lbl}>Sort By</label>
      <select value={filters.sort} onChange={e => set('sort', e.target.value)} style={{ ...inp, marginBottom: 14, cursor: 'pointer' }}>
        <option value="default">Default</option>
        <option value="newest">Newest</option>
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
      </select>

      <button onClick={clear}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: '#fafafa', color: '#666', fontFamily: 'inherit', fontWeight: 500, transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background='#f0f0f0'}
        onMouseLeave={e => e.currentTarget.style.background='#fafafa'}>
        Clear All Filters
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.3 }}>
            {activeCat ? activeCat.name : 'All Products'}
            <span style={{ fontSize: 15, fontWeight: 400, color: '#aaa', marginLeft: 10 }}>({total})</span>
          </h1>
          {activeCat && (
            <button onClick={clear} style={{ marginTop: 6, fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear category filter
            </button>
          )}
        </div>

        {/* Mobile filter button — hidden on desktop */}
        <button
          className="mobile-filter-btn"
          onClick={() => setDrawerOpen(true)}
          style={{
            display: 'none', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 10,
            border: '1px solid #e5e5e5', background: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#1a1a1a', fontFamily: 'inherit',
            position: 'relative', flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
          <FilterIcon />
          Filters
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute', top: -7, right: -7,
              background: 'var(--primary)', color: 'var(--secondary)',
              borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, lineHeight: 1,
              border: '2px solid #fff',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer overlay */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 300, backdropFilter: 'blur(2px)',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', zIndex: 301,
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px 32px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
            maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>Filters</span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#666' }}>
                <CloseIcon />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                width: '100%', marginTop: 16, padding: '13px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'var(--primary)', color: 'var(--secondary)',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              }}>
              Show Results ({total})
            </button>
          </div>
        </>
      )}

      <div className="products-layout" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Desktop filter sidebar */}
        <aside style={{ width: '220px', flexShrink: 0, position: 'sticky', top: 80 }}>
          <FilterPanel />
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
              {[...Array(8)].map((_,i) => <div key={i} style={{ height: 340, borderRadius: 14, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#bbb' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 16px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontSize: 16, marginBottom: 8, color: '#aaa' }}>No products found</p>
              <p style={{ fontSize: 13 }}>Try adjusting or clearing your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20, alignItems: 'stretch' }}>
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
