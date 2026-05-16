import React, { useEffect, useState } from 'react'
import { productsApi, categoriesApi, brandsApi, uploadApi } from '../lib/api'
import toast from 'react-hot-toast'

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }
const EMPTY = { name:'', description:'', price:'', comparePrice:'', stock:'', images:[], category:'', brand:'', isPromo:false, isFeatured:false, isNewArrival:false, isSecondHand:false }

export default function Products() {
  const [products, setProducts] = useState([])
  const [cats, setCats] = useState([])
  const [brands, setBrands] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => productsApi.getAll({ limit:200, all: 'true' }).then(d => setProducts(d.products||[])).catch(console.error)
  useEffect(() => { load(); categoriesApi.getAll().then(setCats); brandsApi.getAll().then(setBrands) }, [])

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = p  => { setForm({ ...p, category: p.category?._id||'', brand: p.brand?._id||'' }); setModal('edit') }

  const handleImages = async (files) => {
    if (!files.length) return
    setUploading(true)
    try {
      const res = await uploadApi.productImages(files)
      setForm(f => ({ ...f, images: [...(f.images||[]), ...res.map(r=>r.url)].slice(0,5) }))
      toast.success('Uploaded!')
    } catch (err) { toast.error('Upload failed: '+(err.response?.data?.error||err.message)) }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!form.name||!form.price) return toast.error('Name and price required')
    setSaving(true)
    try {
      const d = { name:form.name, description:form.description||'', price:+form.price, comparePrice:form.comparePrice?+form.comparePrice:null, stock:+form.stock||0, images:form.images||[], isPromo:!!form.isPromo, isFeatured:!!form.isFeatured, isNewArrival:!!form.isNewArrival, isSecondHand:!!form.isSecondHand }
      if (form.category) d.category = form.category
      if (form.brand)    d.brand    = form.brand
      if (modal==='add') { await productsApi.create(d); toast.success('Created!') }
      else               { await productsApi.update(form._id, d); toast.success('Updated!') }
      setModal(null); load()
    } catch(err) { toast.error(err.response?.data?.error||err.message) }
    finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this product?')) return
    try { await productsApi.delete(id); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:-0.3 }}>Products</h1>
          <p style={{ fontSize:13, color:'#aaa', marginTop:2 }}>{products.length} total</p>
        </div>
        <button onClick={openAdd} style={{ background:'#f8f8f4', color:'#f98512', border:'none', borderRadius:10, padding:'9px 18px', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          + Add Product
        </button>
      </div>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 18px', borderBottom:'1px solid #f5f5f5', display:'flex', gap:8, alignItems:'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." style={{ border:'none', outline:'none', fontSize:13, flex:1, background:'transparent' }}/>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#fafafa' }}>
                {['','Product','Price','Stock','Category','Tags',''].map((h,i)=>(
                  <th key={i} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'#bbb', textTransform:'uppercase', letterSpacing:0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan="7" style={{ padding:40, textAlign:'center', color:'#ccc', fontSize:13 }}>No products found</td></tr>}
              {filtered.map(p => (
                <tr key={p._id} style={{ borderTop:'1px solid #f8f8f8' }}>
                  <td style={{ padding:'8px 10px 8px 14px' }}>
                    <img src={p.images?.[0]||'https://placehold.co/40x40/f5f5f5/ccc?text=?'} alt="" style={{ width:38,height:38,objectFit:'cover',borderRadius:7,border:'1px solid #f0f0f0' }}/>
                  </td>
                  <td style={{ padding:'8px 10px' }}><p style={{ fontWeight:600,fontSize:13 }}>{p.name}</p><p style={{ fontSize:11,color:'#bbb',marginTop:1 }}>{p.brand?.name||''}</p></td>
                  <td style={{ padding:'8px 10px',fontSize:13,fontWeight:700 }}>{(+p.price).toFixed(2)}</td>
                  <td style={{ padding:'8px 10px',fontSize:13,color: p.stock<5?'#ef4444':p.stock<20?'#f59e0b':'#22c55e',fontWeight:600 }}>{p.stock}</td>
                  <td style={{ padding:'8px 10px',fontSize:12,color:'#888' }}>{p.category?.name||'—'}</td>
                  <td style={{ padding:'8px 10px' }}>
                    <div style={{ display:'flex',gap:3,flexWrap:'wrap' }}>
                      {p.isPromo      && <span style={{ fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'#fef2f2',color:'#ef4444' }}>PROMO</span>}
                      {p.isFeatured   && <span style={{ fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'#f5f3ff',color:'#8b5cf6' }}>FEAT</span>}
                      {p.isNewArrival && <span style={{ fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'#f0fdf4',color:'#22c55e' }}>NEW</span>}
                    </div>
                  </td>
                  <td style={{ padding:'8px 14px' }}>
                    <div style={{ display:'flex',gap:5 }}>
                      <button onClick={()=>openEdit(p)} style={{ padding:'4px 10px',border:'1px solid #e5e5e5',borderRadius:6,cursor:'pointer',fontSize:11,background:'#fff',color:'#555',fontFamily:'inherit' }}>Edit</button>
                      <button onClick={()=>del(p._id)} style={{ padding:'4px 10px',border:'1px solid #fee2e2',borderRadius:6,cursor:'pointer',fontSize:11,background:'#fff',color:'#ef4444',fontFamily:'inherit' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{ background:'#fff',borderRadius:14,width:'100%',maxWidth:580,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding:'18px 24px',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1 }}>
              <h2 style={{ fontWeight:700,fontSize:16 }}>{modal==='add'?'Add Product':'Edit Product'}</h2>
              <button onClick={()=>setModal(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:20,lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Name *</label>
                  <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Product name"/>
                </div>
                <div>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Price *</label>
                  <input style={inp} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00"/>
                </div>
                <div>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Compare price</label>
                  <input style={inp} type="number" value={form.comparePrice} onChange={e=>setForm(f=>({...f,comparePrice:e.target.value}))} placeholder="Original price"/>
                </div>
                <div>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Stock</label>
                  <input style={inp} type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:Math.max(0,e.target.value)}))} placeholder="0"/>
                </div>
                <div>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Category</label>
                  <select style={{ ...inp }} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="">None</option>
                    {cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Brand</label>
                  <select style={{ ...inp }} value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))}>
                    <option value="">None</option>
                    {brands.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Description</label>
                  <textarea style={{ ...inp,minHeight:72,resize:'vertical' }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Product description"/>
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8 }}>Images (up to 5)</label>
                <label style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',border:'1.5px dashed #e5e5e5',borderRadius:9,cursor:'pointer',fontSize:13,color:'#888',background:'#fafafa' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {uploading?'Uploading...':'Click to upload images'}
                  <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e=>handleImages(e.target.files)} disabled={uploading}/>
                </label>
                {(form.images||[]).length>0 && (
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginTop:8 }}>
                    {(form.images||[]).map((url,i)=>(
                      <div key={i} style={{ position:'relative' }}>
                        <img src={url} alt="" style={{ width:64,height:64,objectFit:'cover',borderRadius:7,border:'1px solid #eee' }}/>
                        <button onClick={()=>setForm(f=>({...f,images:f.images.filter((_,j)=>j!==i)}))}
                          style={{ position:'absolute',top:-5,right:-5,background:'#ef4444',color:'#fff',border:'none',borderRadius:'50%',width:18,height:18,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:'flex',gap:18,padding:'12px 14px',background:'#fafafa',borderRadius:9,marginBottom:18 }}>
                {([...[ ['isPromo','Promo'],['isFeatured','Featured'],['isNewArrival','New Arrival'] ], ...(import.meta.env.VITE_FEATURE_SECONDHAND==='true'?[['isSecondHand','Second Hand']]:[])]).map(([k,l])=>(
                  <label key={k} style={{ display:'flex',alignItems:'center',gap:7,fontSize:13,cursor:'pointer' }}>
                    <input type="checkbox" checked={!!form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))} style={{ accentColor:'#f8f8f4',width:15,height:15 }}/>{l}
                  </label>
                ))}
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={()=>setModal(null)} style={{ flex:1,padding:'11px',border:'1px solid #e5e5e5',borderRadius:9,cursor:'pointer',background:'#fff',fontSize:14,fontFamily:'inherit',color:'#555' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2,padding:'11px',border:'none',borderRadius:9,cursor:'pointer',background:'#f8f8f4',color:'#f98512',fontSize:14,fontWeight:700,fontFamily:'inherit',opacity:saving?0.7:1 }}>
                  {saving?'Saving...':modal==='add'?'Create Product':'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
