import React, { useEffect, useState } from 'react'
import { productsApi, categoriesApi, brandsApi, uploadApi } from '../../lib/api'
import toast from 'react-hot-toast'

const EMPTY = { name:'', description:'', price:'', comparePrice:'', stock:'', images:[], category:'', brand:'', isPromo:false, isFeatured:false, isNewArrival:false, isSecondHand:false }

const F = ({ label, children }) => (
  <div>
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{label}</label>
    {children}
  </div>
)

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => productsApi.getAll({ limit: 200, all: 'true' }).then(d => setProducts(d.products)).catch(console.error)
  useEffect(() => {
    load()
    categoriesApi.getAll().then(setCategories).catch(console.error)
    brandsApi.getAll().then(setBrands).catch(console.error)
  }, [])

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = p  => { setForm({ ...p, category: p.category?._id || '', brand: p.brand?._id || '' }); setModal('edit') }

  const handleImages = async (files) => {
    if (!files.length) return
    setUploading(true)
    try {
      const res = await uploadApi.productImages(files)
      setForm(f => ({ ...f, images: [...(f.images || []), ...res.map(r => r.url)].slice(0, 5) }))
      toast.success('Images uploaded!')
    } catch (err) { toast.error('Upload failed: ' + (err.response?.data?.error || err.message)) }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!form.name || !form.price) return toast.error('Name and price are required')
    setSaving(true)
    try {
      const data = {
        name: form.name,
        description: form.description || '',
        price: +form.price,
        comparePrice: form.comparePrice ? +form.comparePrice : null,
        stock: Math.max(0, +form.stock || 0),
        images: form.images || [],
        isPromo: !!form.isPromo,
        isFeatured: !!form.isFeatured,
        isNewArrival: !!form.isNewArrival,
      }
      if (form.category) data.category = form.category
      if (form.brand) data.brand = form.brand

      if (modal === 'add') { await productsApi.create(data); toast.success('Product created!') }
      else { await productsApi.update(form._id, data); toast.success('Product updated!') }
      setModal(null); load()
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.error || err.message))
    } finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await productsApi.delete(id); toast.success('Product deleted'); load() }
    catch (err) { toast.error('Delete failed') }
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const Tag = ({ label, color, bg }) => (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5, background:bg, color, letterSpacing:0.4 }}>{label}</span>
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Products</h1>
          <p style={{ fontSize:13, color:'#aaa', marginTop:3 }}>{products.length} total</p>
        </div>
        <button onClick={openAdd}
          style={{ background:'#f8f8f4', color:'#f98512', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f5f5f5', display:'flex', alignItems:'center', gap:10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ border:'none', outline:'none', fontSize:14, flex:1, background:'transparent', color:'#1a1a1a' }}/>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#fafafa' }}>
                {['','Product','Price','Stock','Category','Brand','Tags',''].map((h,i) => (
                  <th key={i} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#bbb', textTransform:'uppercase', letterSpacing:0.6, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ padding:'48px 20px', textAlign:'center', color:'#ccc', fontSize:14 }}>
                  {products.length === 0 ? 'No products yet — click Add Product to get started' : 'No results for "' + search + '"'}
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p._id} style={{ borderTop:'1px solid #f8f8f8', transition:'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <td style={{ padding:'10px 12px 10px 16px' }}>
                    <img src={p.images?.[0] || 'https://placehold.co/44x44/f5f5f5/ccc?text=?'}
                      alt={p.name} style={{ width:44, height:44, objectFit:'cover', borderRadius:8, border:'1px solid #f0f0f0' }}/>
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <p style={{ fontWeight:600, fontSize:14, color:'#1a1a1a', marginBottom:2 }}>{p.name}</p>
                    {p.description && <p style={{ fontSize:12, color:'#bbb', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</p>}
                  </td>
                  <td style={{ padding:'10px 12px', whiteSpace:'nowrap' }}>
                    <span style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>{(+p.price).toFixed(2)}</span>
                    {p.comparePrice > p.price && <span style={{ fontSize:11, color:'#ccc', textDecoration:'line-through', marginLeft:6 }}>{(+p.comparePrice).toFixed(2)}</span>}
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ fontSize:13, color: p.stock < 5 ? '#ef4444' : p.stock < 20 ? '#f59e0b' : '#22c55e', fontWeight:600 }}>{p.stock}</span>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:13, color:'#888' }}>{p.category?.name || <span style={{ color:'#ddd' }}>—</span>}</td>
                  <td style={{ padding:'10px 12px', fontSize:13, color:'#888' }}>{p.brand?.name || <span style={{ color:'#ddd' }}>—</span>}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {p.isPromo      && <Tag label="PROMO" color="#ef4444" bg="#fef2f2"/>}
                      {p.isFeatured   && <Tag label="FEAT"  color="#8b5cf6" bg="#f5f3ff"/>}
                      {p.isNewArrival && <Tag label="NEW"   color="#22c55e" bg="#f0fdf4"/>}
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(p)}
                        style={{ padding:'5px 12px', borderRadius:7, border:'1px solid #e5e5e5', cursor:'pointer', fontSize:12, background:'#fff', color:'#555', fontFamily:'inherit' }}>Edit</button>
                      <button onClick={() => del(p._id)}
                        style={{ padding:'5px 12px', borderRadius:7, border:'1px solid #fee2e2', cursor:'pointer', fontSize:12, background:'#fff', color:'#ef4444', fontFamily:'inherit' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:620, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding:'22px 28px', borderBottom:'1px solid #f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1, borderRadius:'16px 16px 0 0' }}>
              <h2 style={{ fontWeight:700, fontSize:18, color:'#1a1a1a' }}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', padding:4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding:'24px 28px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <F label="Product Name *">
                    <input style={inp} value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="e.g. Classic White Sneaker"/>
                  </F>
                </div>
                <F label="Price (TND) *">
                  <input style={inp} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))} placeholder="0.00"/>
                </F>
                <F label="Compare Price (optional)">
                  <input style={inp} type="number" min="0" step="0.01" value={form.comparePrice} onChange={e => setForm(f => ({...f, comparePrice:e.target.value}))} placeholder="Original price"/>
                </F>
                <F label="Stock">
                  <input style={inp} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({...f, stock:e.target.value}))} placeholder="0"/>
                </F>
                <F label="Category">
                  <select style={{ ...inp }} value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                    <option value="">— None —</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.parent ? '  └ ' : ''}{c.name}</option>)}
                  </select>
                </F>
                <div style={{ gridColumn:'1/-1' }}>
                  <F label="Brand">
                    <select style={{ ...inp }} value={form.brand} onChange={e => setForm(f => ({...f, brand:e.target.value}))}>
                      <option value="">— None —</option>
                      {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </F>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <F label="Description">
                    <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="Product description..."/>
                  </F>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Images (up to 5) — uploaded to Cloudinary</label>
                <label style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', border:'1.5px dashed #e5e5e5', borderRadius:10, cursor:'pointer', fontSize:13, color:'#888', background:'#fafafa', transition:'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#ccc'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#e5e5e5'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                  <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => handleImages(e.target.files)} disabled={uploading}/>
                </label>
                {(form.images || []).length > 0 && (
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:10 }}>
                    {(form.images || []).map((url, i) => (
                      <div key={i} style={{ position:'relative' }}>
                        <img src={url} alt="" style={{ width:76, height:76, objectFit:'cover', borderRadius:8, border:'1px solid #eee' }}/>
                        <button onClick={() => setForm(f => ({...f, images: f.images.filter((_,j)=>j!==i)}))}
                          style={{ position:'absolute', top:-6, right:-6, background:'#ef4444', color:'#fff', border:'none', borderRadius:'50%', width:20, height:20, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display:'flex', gap:20, marginBottom:24, padding:'14px 16px', background:'#fafafa', borderRadius:10 }}>
                {([...[ ['isPromo','On Promo'],['isFeatured','Featured'],['isNewArrival','New Arrival'] ], ...(cfg.features?.secondHand ? [['isSecondHand','Second Hand']] : [])]).map(([k,l]) => (
                  <label key={k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer', userSelect:'none' }}>
                    <input type="checkbox" checked={!!form[k]} onChange={e => setForm(f => ({...f, [k]:e.target.checked}))}
                      style={{ width:16, height:16, cursor:'pointer', accentColor:'#f8f8f4' }}/>
                    {l}
                  </label>
                ))}
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setModal(null)}
                  style={{ flex:1, padding:'12px', border:'1px solid #e5e5e5', borderRadius:10, cursor:'pointer', background:'#fff', fontSize:14, fontFamily:'inherit', color:'#555' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  style={{ flex:2, padding:'12px', border:'none', borderRadius:10, cursor:saving?'not-allowed':'pointer', background:'#f8f8f4', color:'#f98512', fontSize:14, fontWeight:700, fontFamily:'inherit', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : modal === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
