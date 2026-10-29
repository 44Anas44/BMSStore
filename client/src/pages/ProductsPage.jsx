import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productsApi, categoriesApi, brandsApi } from '../lib/api'

const PAGE_SIZE = 24   // products loaded per click on "Afficher plus"

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }

/* ───────── filters live in the URL (single source of truth) ───────── */
// ?category=…&brand=…&minPrice=…&f.processeur=Intel Core i5|AMD Ryzen 5&f.memoire=16 Go
const SIMPLE_KEYS = ['category', 'brand', 'minPrice', 'maxPrice', 'sort', 'search', 'isPromo', 'isNewArrival']
const SPEC_PREFIX = 'f.'

function readFilters(sp) {
  const f = {}
  SIMPLE_KEYS.forEach(k => { f[k] = sp.get(k) || '' })
  if (!f.sort) f.sort = 'default'
  f.specs = {}
  for (const [k, v] of sp.entries()) {
    if (!k.startsWith(SPEC_PREFIX) || !v) continue
    const vals = v.split('|').filter(Boolean)
    if (vals.length) f.specs[k.slice(SPEC_PREFIX.length)] = vals
  }
  return f
}

function writeParams(f) {
  const p = {}
  SIMPLE_KEYS.forEach(k => { if (f[k] && f[k] !== 'default') p[k] = f[k] })
  Object.entries(f.specs).forEach(([k, vals]) => { if (vals.length) p[SPEC_PREFIX + k] = vals.join('|') })
  return p
}

/** What the API understands (the `specs` param is JSON). */
function apiParams(f, { withSort }) {
  const p = {}
  SIMPLE_KEYS.forEach(k => { if (f[k] && f[k] !== 'default' && (withSort || k !== 'sort')) p[k] = f[k] })
  if (Object.keys(f.specs).length) p.specs = JSON.stringify(f.specs)
  return p
}

function findPath(nodes, id, acc = []) {
  for (const n of nodes || []) {
    const next = [...acc, n]
    if (n._id === id) return next
    const r = findPath(n.children, id, next)
    if (r) return r
  }
  return null
}

/* ───────── small pieces ───────── */

function SearchBox({ value, onCommit }) {
  const [text, setText] = useState(value)
  useEffect(() => { setText(value) }, [value])
  useEffect(() => {          // wait for a pause in typing before querying
    if (text === value) return
    const t = setTimeout(() => onCommit(text), 350)
    return () => clearTimeout(t)
  }, [text])                 // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ position:'relative', marginBottom:16 }}>
      <input placeholder="Rechercher des produits..." value={text} onChange={e => setText(e.target.value)} style={{ ...inp, paddingLeft:32 }}/>
      <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </div>
  )
}

const VISIBLE_VALUES = 6

function SpecGroup({ spec, selected, onToggle }) {
  const [open, setOpen] = useState(false)
  const values = open ? spec.values : spec.values.slice(0, VISIBLE_VALUES)
  return (
    <div style={{ marginBottom:16, paddingTop:14, borderTop:'1px solid #f3f3f3' }}>
      <label style={lbl}>{spec.label}</label>
      {values.map(v => {
        const checked = selected.includes(v.value)
        return (
          <label key={v.value} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0', fontSize:13, color: v.count === 0 && !checked ? '#bbb' : '#333', cursor:'pointer' }}>
            <input type="checkbox" checked={checked} onChange={() => onToggle(spec.key, v.value)} style={{ accentColor:'#9c155f', width:15, height:15, margin:0, flexShrink:0 }}/>
            <span style={{ flex:1, minWidth:0, overflowWrap:'anywhere' }}>{v.value}</span>
            <span style={{ fontSize:11, color:'#bbb' }}>{v.count}</span>
          </label>
        )
      })}
      {spec.values.length > VISIBLE_VALUES && (
        <button onClick={() => setOpen(o => !o)} style={{ background:'none', border:'none', padding:'4px 0', fontSize:12, fontWeight:600, color:'#9c155f', cursor:'pointer', fontFamily:'inherit' }}>
          {open ? 'Voir moins' : `Voir plus (${spec.values.length - VISIBLE_VALUES})`}
        </button>
      )}
    </div>
  )
}

function FilterPanel({ filters, facets, brandNames, set, setSearch, toggleSpec, clear }) {
  // brands that really have products in this category (server-side), plus the selected one if filters hide it
  const brandOptions = useMemo(() => {
    const list = [...facets.brands]
    if (filters.brand && !list.some(b => b._id === filters.brand)) {
      list.unshift({ _id: filters.brand, name: brandNames[filters.brand] || 'Marque', count: 0 })
    }
    return list
  }, [facets.brands, filters.brand, brandNames])

  return (
    <div style={{ border:'1px solid #eee', borderRadius:14, padding:'18px 16px', background:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>Filtres</p>
        <button onClick={clear} style={{ background:'none', border:'none', fontSize:12, color:'#f97316', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Tout effacer</button>
      </div>

      <SearchBox value={filters.search} onCommit={setSearch} />

      {brandOptions.length > 0 && (
        <>
          <label style={lbl}>Marque</label>
          <select value={filters.brand} onChange={e => set('brand', e.target.value)} style={{ ...inp, marginBottom:14, cursor:'pointer' }}>
            <option value="">Toutes les marques</option>
            {brandOptions.map(b => <option key={b._id} value={b._id}>{b.name} ({b.count})</option>)}
          </select>
        </>
      )}

      <label style={lbl}>Prix</label>
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        <input type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} style={{ ...inp, flex:1, width:0 }}/>
        <span style={{ color:'#ccc', lineHeight:'38px', flexShrink:0 }}>—</span>
        <input type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} style={{ ...inp, flex:1, width:0 }}/>
      </div>

      {/* caractéristiques of this category: processeur, mémoire, disque… */}
      {facets.specs.map(spec => (
        <SpecGroup key={spec.key} spec={spec} selected={filters.specs[spec.key] || []} onToggle={toggleSpec} />
      ))}
    </div>
  )
}

/* ───────── page ───────── */

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => readFilters(searchParams), [searchParams])
  const filtersKey = searchParams.toString()

  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [tree,       setTree]       = useState([])
  const [brandNames, setBrandNames] = useState({})
  const [facets,     setFacets]     = useState({ brands: [], specs: [] })
  const [loading,    setLoading]    = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page,        setPage]        = useState(1)
  const [pages,       setPages]       = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const reqId   = useRef(0)   // ignores answers from outdated requests (e.g. filter changed meanwhile)
  const facetId = useRef(0)

  useEffect(() => {
    categoriesApi.getTree().then(setTree).catch(console.error)
    brandsApi.getAll().then(b => setBrandNames(Object.fromEntries(b.map(x => [x._id, x.name])))).catch(console.error)
  }, [])

  /* ---- update the URL ---- */
  const update = (mutate) => {
    const next = { ...filters, specs: { ...filters.specs } }
    mutate(next)
    setSearchParams(writeParams(next), { replace: true })
  }
  const set       = (k, v) => update(f => { f[k] = v })
  const setSearch = (v)    => set('search', v)
  const toggleSpec = (key, value) => update(f => {
    const cur = f.specs[key] || []
    const vals = cur.includes(value) ? cur.filter(x => x !== value) : [...cur, value]
    if (vals.length) f.specs[key] = vals; else delete f.specs[key]
  })
  // keeps the category (chosen from the menu), drops every other filter
  const clear = () => setSearchParams(filters.category ? { category: filters.category } : {}, { replace: true })

  /* ---- products ---- */
  const query = useCallback((pageNum) =>
    productsApi.getAll({ ...apiParams(filters, { withSort: true }), page: pageNum, limit: PAGE_SIZE }),
  [filtersKey])   // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(() => {
    const id = ++reqId.current
    setLoading(true)
    query(1)
      .then(d => { if (id !== reqId.current) return; setProducts(d.products); setTotal(d.total); setPage(1); setPages(d.pages || 1) })
      .catch(console.error)
      .finally(() => { if (id === reqId.current) setLoading(false) })
  }, [query])

  const loadMore = () => {
    const id = reqId.current
    setLoadingMore(true)
    query(page + 1)
      .then(d => {
        if (id !== reqId.current) return
        // append, skipping anything already on screen
        setProducts(prev => { const seen = new Set(prev.map(p => p._id)); return [...prev, ...d.products.filter(p => !seen.has(p._id))] })
        setPage(page + 1); setPages(d.pages || pages); setTotal(d.total)
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false))
  }

  useEffect(() => { load() }, [load])

  /* ---- filter choices (brands + specs of the current category) ---- */
  useEffect(() => {
    const id = ++facetId.current
    productsApi.getFacets(apiParams(filters, { withSort: false }))
      .then(d => { if (id === facetId.current) setFacets({ brands: d.brands || [], specs: d.specs || [] }) })
      .catch(console.error)
  }, [filtersKey])   // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- category shown as breadcrumb + shortcuts (not a filter) ---- */
  const path = useMemo(() => (filters.category ? findPath(tree, filters.category) : null) || [], [tree, filters.category])
  const current = path[path.length - 1]
  const childCats = current?.children || []
  const title = current ? current.name : (filters.category ? 'Produits' : 'Tous les produits')

  const specCount = Object.values(filters.specs).reduce((n, v) => n + v.length, 0)
  const activeFilters = ['brand', 'minPrice', 'maxPrice', 'search', 'isPromo', 'isNewArrival'].filter(k => filters[k]).length + specCount

  const panel = (
    <FilterPanel filters={filters} facets={facets} brandNames={brandNames} set={set} setSearch={setSearch} toggleSpec={toggleSpec} clear={clear} />
  )

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .pr-drawer-overlay { display:none }
        .pr-sidebar { display:block }
        .pr-crumb a { color:#888; text-decoration:none } .pr-crumb a:hover { color:#9c155f }
        .pr-chip { display:inline-block; padding:6px 14px; border:1px solid #eadfe6; border-radius:20px; font-size:13px; color:#444; text-decoration:none; background:#fff; white-space:nowrap }
        .pr-chip:hover { border-color:#9c155f; color:#9c155f }
        @media(max-width:768px) {
          .pr-layout { grid-template-columns: 1fr !important }
          .pr-sidebar { display:none }
          .pr-drawer-overlay { display:block; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:300 }
          .pr-drawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:20px 20px 0 0; padding:20px 16px 32px; z-index:301; max-height:88vh; overflow-y:auto; box-shadow:0 -8px 32px rgba(0,0,0,.15) }
          .pr-filter-fab { display:flex !important }
          .pr-chips { flex-wrap:nowrap !important; overflow-x:auto; padding-bottom:4px }
        }
        .pr-sort-select { display:block }
        @media(max-width:768px) { .pr-sort-select { display:none } }
        .pr-filter-fab { display:none; position:fixed; bottom:24px; right:20px; z-index:200; align-items:center; gap:8px; background:#9c155f; color:#fff; border:none; border-radius:50px; padding:12px 20px; font-size:14px; font-weight:700; font-family:inherit; cursor:pointer; box-shadow:0 4px 20px rgba(156,21,95,0.4) }
      `}</style>

      <div style={{ marginBottom:16, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div style={{ minWidth:0 }}>
          <nav className="pr-crumb" style={{ fontSize:12.5, color:'#aaa', marginBottom:8, display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
            <Link to="/products">Tous les produits</Link>
            {path.map((c, i) => (
              <React.Fragment key={c._id}>
                <span>›</span>
                {i === path.length - 1
                  ? <span style={{ color:'#1a1a1a', fontWeight:600 }}>{c.name}</span>
                  : <Link to={`/products?category=${c._id}`}>{c.name}</Link>}
              </React.Fragment>
            ))}
          </nav>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a1a', letterSpacing:-0.3 }}>
            {title}
            <span style={{ fontSize:14, fontWeight:400, color:'#aaa', marginLeft:8 }}>({total})</span>
          </h1>
        </div>
        <select className="pr-sort-select" value={filters.sort} onChange={e => set('sort', e.target.value)}
          style={{ ...inp, width:'auto', minWidth:160, cursor:'pointer', flexShrink:0 }}>
          <option value="default">Trier : Par défaut</option>
          <option value="newest">Nouveautés</option>
          <option value="popular">Les plus populaires</option>
          <option value="price-asc">Prix : croissant</option>
          <option value="price-desc">Prix : décroissant</option>
        </select>
      </div>

      {childCats.length > 0 && (
        <div className="pr-chips" style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:18 }}>
          {childCats.map(c => <Link key={c._id} className="pr-chip" to={`/products?category=${c._id}`}>{c.name}</Link>)}
        </div>
      )}

      <div className="pr-layout" style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24, alignItems:'start' }}>
        <aside className="pr-sidebar" style={{ position:'sticky', top:172, maxHeight:'calc(100vh - 192px)', overflowY:'auto' }}>
          {panel}
        </aside>

        <div>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16 }}>
              {[...Array(8)].map((_,i) => <div key={i} style={{ height:300, borderRadius:12, background:'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#bbb' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 16px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p style={{ fontSize:16, color:'#aaa' }}>Aucun produit trouvé</p>
              {activeFilters > 0 && <button onClick={clear} style={{ marginTop:12, background:'none', border:'1px solid #ddd', borderRadius:8, padding:'8px 20px', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'#888' }}>Effacer les filtres</button>}
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16 }}>
                {products.map(p => <ProductCard key={p._id} product={p}/>)}
              </div>
              {page < pages && (
                <div style={{ textAlign:'center', marginTop:28 }}>
                  <p style={{ fontSize:12, color:'#aaa', marginBottom:10 }}>{products.length} sur {total} produits</p>
                  <button onClick={loadMore} disabled={loadingMore}
                    style={{ padding:'11px 28px', borderRadius:10, border:'1px solid #ddd', background:'#fff', color:'#333', fontWeight:700, fontSize:14, fontFamily:'inherit', cursor: loadingMore ? 'wait' : 'pointer', opacity: loadingMore ? 0.6 : 1 }}>
                    {loadingMore ? 'Chargement...' : 'Afficher plus'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <button className="pr-filter-fab" onClick={() => setDrawerOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
        Filtres {activeFilters > 0 && <span style={{ background:'#f97316', borderRadius:50, padding:'1px 7px', fontSize:11 }}>{activeFilters}</span>}
      </button>

      {drawerOpen && (
        <>
          <div className="pr-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="pr-drawer">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <p style={{ fontWeight:800, fontSize:16 }}>Filtres</p>
              <button onClick={() => setDrawerOpen(false)} style={{ background:'none', border:'none', fontSize:24, lineHeight:1, cursor:'pointer', color:'#aaa', fontFamily:'inherit' }}>×</button>
            </div>
            <label style={lbl}>Trier par</label>
            <select value={filters.sort} onChange={e => set('sort', e.target.value)} style={{ ...inp, cursor:'pointer', marginBottom:16 }}>
              <option value="default">Par défaut</option>
              <option value="newest">Nouveautés</option>
              <option value="popular">Les plus populaires</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
            </select>
            {panel}
            <button onClick={() => setDrawerOpen(false)}
              style={{ width:'100%', marginTop:16, padding:'13px', background:'#9c155f', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
              Voir les Résultats ({total})
            </button>
          </div>
        </>
      )}
    </div>
  )
}
