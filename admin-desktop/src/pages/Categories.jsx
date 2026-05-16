import React, { useEffect, useState } from 'react'
import { categoriesApi, brandsApi } from '../lib/api'
import toast from 'react-hot-toast'

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a', boxSizing:'border-box' }

function CatNode({ cat, depth=0, onEdit, onDelete, onAddSub }) {
  return (
    <>
      <div style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 16px',borderBottom:'1px solid #f8f8f8',paddingLeft:16+depth*20 }}>
        {depth>0&&<span style={{ color:'#ddd',fontSize:11 }}>└</span>}
        {cat.image
          ? <img src={cat.image} alt="" style={{ width:30,height:30,objectFit:'cover',borderRadius:5,border:'1px solid #eee',flexShrink:0 }}/>
          : <div style={{ width:30,height:30,borderRadius:5,background:'#f5f5f5',border:'1px solid #eee',flexShrink:0 }}/>
        }
        <span style={{ flex:1,fontSize:13,fontWeight:depth===0?600:400 }}>{cat.name}</span>
        <div style={{ display:'flex',gap:5 }}>
          <button onClick={()=>onEdit(cat)} style={{ padding:'3px 9px',border:'1px solid #e5e5e5',borderRadius:6,cursor:'pointer',fontSize:11,background:'#fff',fontFamily:'inherit' }}>Edit</button>
          <button onClick={()=>onAddSub(cat._id)} style={{ padding:'3px 9px',border:'1px solid #e5e5e5',borderRadius:6,cursor:'pointer',fontSize:11,background:'#fff',fontFamily:'inherit' }}>+ Sub</button>
          <button onClick={()=>onDelete(cat._id)} style={{ padding:'3px 9px',border:'1px solid #fee2e2',borderRadius:6,cursor:'pointer',fontSize:11,background:'#fff',color:'#ef4444',fontFamily:'inherit' }}>Del</button>
        </div>
      </div>
      {cat.children?.map(c=><CatNode key={c._id} cat={c} depth={depth+1} onEdit={onEdit} onDelete={onDelete} onAddSub={onAddSub}/>)}
    </>
  )
}

export default function Categories() {
  const [tree, setTree]     = useState([])
  const [allCats, setAllCats] = useState([])
  const [brands, setBrands] = useState([])
  const [modal, setModal]   = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm]     = useState({ name:'', description:'', parent:'', image:null })
  const [brandName, setBrandName] = useState('')
  const [saving, setSaving] = useState(false)

  const loadCats = () => { categoriesApi.getTree().then(setTree); categoriesApi.getAll().then(setAllCats) }
  useEffect(() => { loadCats(); brandsApi.getAll().then(setBrands) }, [])

  const openAdd    = (parentId='') => { setForm({ name:'', description:'', parent:parentId, image:null }); setEditCat(null); setModal('cat') }
  const openEdit   = (cat) => { setForm({ name:cat.name, description:cat.description||'', parent:cat.parent?._id||cat.parent||'', image:null }); setEditCat(cat); setModal('cat') }

  const saveCat = async () => {
    if (!form.name.trim()) return toast.error('Name required')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('description', form.description||'')
      fd.append('parent', form.parent||'null')
      if (form.image) fd.append('image', form.image)
      if (!editCat) { await categoriesApi.create(fd); toast.success('Created!') }
      else          { await categoriesApi.update(editCat._id, fd); toast.success('Updated!') }
      setModal(null); loadCats()
    } catch(err) { toast.error(err.response?.data?.error||err.message) }
    finally { setSaving(false) }
  }

  const delCat = async id => {
    if (!confirm('Delete this category and subcategories?')) return
    try { await categoriesApi.delete(id); toast.success('Deleted'); loadCats() } catch { toast.error('Failed') }
  }

  const addBrand = async () => {
    if (!brandName.trim()) return
    try { await brandsApi.create({ name:brandName.trim() }); toast.success('Brand added'); setBrandName(''); brandsApi.getAll().then(setBrands) }
    catch { toast.error('Failed') }
  }

  const delBrand = async id => {
    if (!confirm('Delete brand?')) return
    try { await brandsApi.delete(id); brandsApi.getAll().then(setBrands); toast.success('Deleted') } catch { toast.error('Failed') }
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:16 }}>
      <div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
          <h1 style={{ fontSize:20,fontWeight:700,letterSpacing:-0.3 }}>Categories</h1>
          <button onClick={()=>openAdd()} style={{ background:'#f8f8f4',color:'#f98512',border:'none',borderRadius:9,padding:'8px 16px',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'inherit' }}>+ Add</button>
        </div>
        <div style={{ background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden' }}>
          {tree.length===0
            ? <div style={{ padding:40,textAlign:'center',color:'#ccc',fontSize:13 }}>No categories yet</div>
            : tree.map(c=><CatNode key={c._id} cat={c} onEdit={openEdit} onDelete={delCat} onAddSub={openAdd}/>)
          }
        </div>
      </div>
      <div>
        <h2 style={{ fontSize:16,fontWeight:700,marginBottom:14,letterSpacing:-0.2 }}>Brands</h2>
        <div style={{ background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden' }}>
          <div style={{ padding:'12px 14px',borderBottom:'1px solid #f5f5f5',display:'flex',gap:8 }}>
            <input value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="Brand name"
              style={{ ...inp,flex:1 }} onKeyDown={e=>e.key==='Enter'&&addBrand()}/>
            <button onClick={addBrand} style={{ background:'#f8f8f4',color:'#f98512',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap' }}>Add</button>
          </div>
          {brands.length===0
            ? <div style={{ padding:32,textAlign:'center',color:'#ccc',fontSize:13 }}>No brands yet</div>
            : brands.map(b=>(
              <div key={b._id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 14px',borderBottom:'1px solid #f8f8f8' }}>
                <div style={{ width:28,height:28,borderRadius:7,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#aaa',flexShrink:0 }}>{b.name[0]}</div>
                <span style={{ flex:1,fontWeight:500,fontSize:14 }}>{b.name}</span>
                <button onClick={()=>delBrand(b._id)} style={{ padding:'3px 9px',border:'1px solid #fee2e2',borderRadius:6,cursor:'pointer',fontSize:11,background:'#fff',color:'#ef4444',fontFamily:'inherit' }}>Del</button>
              </div>
            ))
          }
        </div>
      </div>

      {modal==='cat' && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{ background:'#fff',borderRadius:14,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden' }}>
            <div style={{ padding:'16px 22px',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <h2 style={{ fontWeight:700,fontSize:16 }}>{editCat?'Edit Category':'Add Category'}</h2>
              <button onClick={()=>setModal(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:20 }}>×</button>
            </div>
            <div style={{ padding:'20px 22px',display:'flex',flexDirection:'column',gap:14 }}>
              <div>
                <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Name *</label>
                <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Footwear"/>
              </div>
              <div>
                <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Parent</label>
                <select style={{ ...inp }} value={form.parent} onChange={e=>setForm(f=>({...f,parent:e.target.value}))}>
                  <option value="">Root level</option>
                  {allCats.filter(c=>!editCat||c._id!==editCat._id).map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5 }}>Cover Image → Cloudinary</label>
                <label style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 12px',border:'1.5px dashed #e5e5e5',borderRadius:8,cursor:'pointer',fontSize:13,color:'#888',background:'#fafafa' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {form.image?form.image.name:'Upload image'}
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>setForm(f=>({...f,image:e.target.files[0]||null}))}/>
                </label>
                {editCat?.image&&!form.image&&<img src={editCat.image} alt="" style={{ width:48,height:48,objectFit:'cover',borderRadius:6,marginTop:8 }}/>}
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={()=>setModal(null)} style={{ flex:1,padding:'10px',border:'1px solid #e5e5e5',borderRadius:9,cursor:'pointer',background:'#fff',fontSize:14,fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveCat} disabled={saving} style={{ flex:2,padding:'10px',border:'none',borderRadius:9,cursor:'pointer',background:'#f8f8f4',color:'#f98512',fontSize:14,fontWeight:700,fontFamily:'inherit',opacity:saving?0.7:1 }}>
                  {saving?'Saving...':editCat?'Save Changes':'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
