import React, { useEffect, useState } from 'react'
import { categoriesApi, brandsApi } from '../../lib/api'
import toast from 'react-hot-toast'

const Btn = ({ onClick, children, danger, small }) => (
  <button onClick={onClick} style={{
    padding: small ? '4px 10px' : '9px 16px',
    border: danger ? '1px solid #fee2e2' : '1px solid #e5e5e5',
    borderRadius: 8, cursor: 'pointer', fontSize: small ? 11 : 13,
    background: '#fff', color: danger ? '#ef4444' : '#555',
    fontFamily: 'inherit', fontWeight: 500,
    transition: 'background 0.12s',
  }}
  onMouseEnter={e => e.currentTarget.style.background = danger ? '#fef2f2' : '#f9f9f9'}
  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
    {children}
  </button>
)

function CategoryNode({ cat, depth=0, onAddSub, onDelete, onEdit }) {
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderBottom:'1px solid #f8f8f8',
        paddingLeft: 14 + depth * 20 }}>
        {depth > 0 && <span style={{ color:'#ddd', fontSize:12, flexShrink:0 }}>└</span>}
        {cat.image
          ? <img src={cat.image} alt={cat.name} style={{ width:32, height:32, objectFit:'cover', borderRadius:6, border:'1px solid #eee', flexShrink:0 }}/>
          : <div style={{ width:32, height:32, borderRadius:6, background:'#f5f5f5', border:'1px solid #eee', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
        }
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14, fontWeight: depth===0 ? 600 : 400, color:'#1a1a1a' }}>{cat.name}</p>
          {cat.description && <p style={{ fontSize:11, color:'#bbb', marginTop:1 }}>{cat.description}</p>}
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          <Btn small onClick={() => onEdit(cat)}>Edit</Btn>
          <Btn small onClick={() => onAddSub(cat._id)}>+ Sub</Btn>
          <Btn small danger onClick={() => onDelete(cat._id)}>Delete</Btn>
        </div>
      </div>
      {cat.children?.map(child => (
        <CategoryNode key={child._id} cat={child} depth={depth+1} onAddSub={onAddSub} onDelete={onDelete} onEdit={onEdit}/>
      ))}
    </>
  )
}

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e5e5', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#1a1a1a' }
const F = ({ label, children }) => (
  <div>
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{label}</label>
    {children}
  </div>
)

export default function AdminCategories() {
  const [tree,   setTree]   = useState([])
  const [allCats, setAllCats] = useState([])
  const [brands, setBrands] = useState([])
  const [catModal, setCatModal] = useState(null) // null | 'add' | 'edit'
  const [catForm, setCatForm]   = useState({ name:'', description:'', parent:'', image:null })
  const [editCat, setEditCat]   = useState(null)
  const [brandName, setBrandName] = useState('')
  const [catSaving, setCatSaving] = useState(false)

  const loadCats = () => {
    categoriesApi.getTree().then(setTree).catch(console.error)
    categoriesApi.getAll().then(setAllCats).catch(console.error)
  }
  useEffect(() => { loadCats(); brandsApi.getAll().then(setBrands).catch(console.error) }, [])

  const openAdd = (parentId = '') => {
    setCatForm({ name:'', description:'', parent: parentId || '', image:null })
    setEditCat(null)
    setCatModal('add')
  }
  const openEdit = (cat) => {
    setCatForm({ name:cat.name, description:cat.description||'', parent:cat.parent?._id || cat.parent || '', image:null })
    setEditCat(cat)
    setCatModal('edit')
  }

  const saveCat = async () => {
    if (!catForm.name.trim()) return toast.error('Category name is required')
    setCatSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', catForm.name.trim())
      fd.append('description', catForm.description || '')
      fd.append('parent', catForm.parent || 'null')
      if (catForm.image) fd.append('image', catForm.image)
      if (catModal === 'add') {
        await categoriesApi.create(fd)
        toast.success('Category created!')
      } else {
        await categoriesApi.update(editCat._id, fd)
        toast.success('Category updated!')
      }
      setCatModal(null); loadCats()
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.error || err.message))
    } finally { setCatSaving(false) }
  }

  const delCat = async (id) => {
    if (!confirm('Delete this category and all its subcategories?')) return
    try { await categoriesApi.delete(id); toast.success('Deleted'); loadCats() }
    catch { toast.error('Delete failed') }
  }

  const addBrand = async () => {
    if (!brandName.trim()) return
    try { await brandsApi.create({ name: brandName.trim() }); toast.success('Brand added'); setBrandName(''); brandsApi.getAll().then(setBrands) }
    catch { toast.error('Failed to add brand') }
  }
  const delBrand = async (id) => {
    if (!confirm('Delete this brand?')) return
    try { await brandsApi.delete(id); brandsApi.getAll().then(setBrands); toast.success('Brand deleted') }
    catch { toast.error('Delete failed') }
  }

  const Panel = ({ title, sub, action, children }) => (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontWeight:700, fontSize:15, color:'#1a1a1a' }}>{title}</p>
          {sub && <p style={{ fontSize:12, color:'#aaa', marginTop:2 }}>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Categories & Brands</h1>
        <p style={{ fontSize:13, color:'#aaa', marginTop:3 }}>Manage your catalog structure</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:16, alignItems:'start' }}>
        {/* Categories */}
        <Panel title="Categories" sub="Images appear as cards on the homepage"
          action={
            <button onClick={() => openAdd('')}
              style={{ background:'#f8f8f4', color:'#f98512', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Category
            </button>
          }>
          {tree.length === 0
            ? <div style={{ padding:40, textAlign:'center', color:'#ccc', fontSize:13 }}>No categories yet — add one to get started</div>
            : tree.map(cat => <CategoryNode key={cat._id} cat={cat} onAddSub={openAdd} onDelete={delCat} onEdit={openEdit}/>)
          }
        </Panel>

        {/* Brands */}
        <Panel title="Brands" sub={brands.length + ' brands registered'}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #f8f8f8' }}>
            <div style={{ display:'flex', gap:8 }}>
              <input value={brandName} onChange={e => setBrandName(e.target.value)}
                placeholder="Brand name" style={{ ...inp, flex:1 }}
                onKeyDown={e => e.key === 'Enter' && addBrand()}/>
              <button onClick={addBrand}
                style={{ background:'#f8f8f4', color:'#f98512', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                Add
              </button>
            </div>
          </div>
          {brands.length === 0
            ? <div style={{ padding:32, textAlign:'center', color:'#ccc', fontSize:13 }}>No brands yet</div>
            : brands.map(b => (
              <div key={b._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid #f8f8f8' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#aaa', flexShrink:0 }}>
                  {b.name[0].toUpperCase()}
                </div>
                <span style={{ flex:1, fontWeight:500, fontSize:14, color:'#1a1a1a' }}>{b.name}</span>
                <Btn small danger onClick={() => delBrand(b._id)}>Delete</Btn>
              </div>
            ))
          }
        </Panel>
      </div>

      {/* Category modal */}
      {catModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={e => e.target === e.currentTarget && setCatModal(null)}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontWeight:700, fontSize:17, color:'#1a1a1a' }}>{catModal === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setCatModal(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <F label="Category Name *">
                <input style={inp} value={catForm.name} onChange={e => setCatForm(f => ({...f, name:e.target.value}))} placeholder="e.g. Footwear"/>
              </F>
              <F label="Description">
                <input style={inp} value={catForm.description} onChange={e => setCatForm(f => ({...f, description:e.target.value}))} placeholder="Short description (optional)"/>
              </F>
              <F label="Parent Category">
                <select style={{ ...inp }} value={catForm.parent} onChange={e => setCatForm(f => ({...f, parent:e.target.value}))}>
                  <option value="">Root level</option>
                  {allCats.filter(c => !editCat || c._id !== editCat._id).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </F>
              <F label="Cover Image — saved to Cloudinary">
                <label style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:'1.5px dashed #e5e5e5', borderRadius:9, cursor:'pointer', fontSize:13, color:'#888', background:'#fafafa' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {catForm.image ? catForm.image.name : 'Click to upload image'}
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => setCatForm(f => ({...f, image: e.target.files[0]||null}))}/>
                </label>
                {editCat?.image && !catForm.image && (
                  <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                    <img src={editCat.image} alt="" style={{ width:40, height:40, objectFit:'cover', borderRadius:6 }}/>
                    <span style={{ fontSize:12, color:'#aaa' }}>Current image</span>
                  </div>
                )}
              </F>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={() => setCatModal(null)}
                  style={{ flex:1, padding:'11px', border:'1px solid #e5e5e5', borderRadius:10, cursor:'pointer', background:'#fff', fontSize:14, fontFamily:'inherit', color:'#555' }}>Cancel</button>
                <button onClick={saveCat} disabled={catSaving}
                  style={{ flex:2, padding:'11px', border:'none', borderRadius:10, cursor:'pointer', background:'#f8f8f4', color:'#f98512', fontSize:14, fontWeight:700, fontFamily:'inherit', opacity:catSaving?0.7:1 }}>
                  {catSaving ? 'Saving...' : catModal === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
