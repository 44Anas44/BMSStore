import React, { useEffect, useState } from 'react'
import { slidesApi } from '../../lib/api'
import toast from 'react-hot-toast'

const EMPTY = { title: '', subtitle: '', imageUrl: '', linkUrl: '/products', linkLabel: 'Shop Now', isActive: true }

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }
const F = ({ label, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{hint}</p>}
  </div>
)

export default function AdminSlides() {
  const [slides,  setSlides]  = useState([])
  const [modal,   setModal]   = useState(null)   // null | 'add' | 'edit'
  const [form,    setForm]    = useState(EMPTY)
  const [editId,  setEditId]  = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [imgFile, setImgFile] = useState(null)
  const [preview, setPreview] = useState('')

  const load = () => slidesApi.getAll().then(setSlides).catch(console.error)
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(EMPTY); setEditId(null); setImgFile(null); setPreview(''); setModal('add')
  }
  const openEdit = (s) => {
    setForm({ title: s.title, subtitle: s.subtitle, imageUrl: s.imageUrl, linkUrl: s.linkUrl || '/products', linkLabel: s.linkLabel || 'Shop Now', isActive: s.isActive })
    setEditId(s._id); setImgFile(null); setPreview(s.imageUrl || ''); setModal('edit')
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const save = async () => {
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      let slide
      if (modal === 'add') {
        slide = await slidesApi.create(form)
      } else {
        slide = await slidesApi.update(editId, form)
      }
      // Upload image if a file was selected
      if (imgFile) {
        await slidesApi.uploadImage(slide._id || editId, imgFile)
      }
      toast.success(modal === 'add' ? 'Slide created!' : 'Slide updated!')
      setModal(null); load()
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.error || err.message))
    } finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this slide?')) return
    try { await slidesApi.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const toggle = async (slide) => {
    try {
      await slidesApi.update(slide._id, { ...slide, isActive: !slide.isActive })
      load()
    } catch { toast.error('Failed to update') }
  }

  const move = async (id, dir) => {
    const ids = slides.map(s => s._id)
    const i   = ids.indexOf(id)
    if (dir === 'up'   && i === 0)              return
    if (dir === 'down' && i === ids.length - 1) return
    const swapIdx = dir === 'up' ? i - 1 : i + 1;
    [ids[i], ids[swapIdx]] = [ids[swapIdx], ids[i]]
    try { await slidesApi.reorder(ids); load() }
    catch { toast.error('Reorder failed') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: '#1a1a1a' }}>Hero Slides</h1>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 3 }}>Manage the homepage hero slider — drag to reorder</p>
        </div>
        <button onClick={openAdd}
          style={{ background: '#f8f8f4', color: '#f98512', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Slide
        </button>
      </div>

      {slides.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 12px' }}>
            <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
          </svg>
          <p style={{ fontSize: 14 }}>No slides yet — click Add Slide to create your first hero slide</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slides.map((s, i) => (
          <div key={s._id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, overflow: 'hidden', display: 'flex', alignItems: 'stretch', opacity: s.isActive ? 1 : 0.55 }}>
            {/* Image preview */}
            <div style={{ width: 160, flexShrink: 0, background: s.imageUrl ? 'transparent' : '#f5f5f5', position: 'relative' }}>
              {s.imageUrl
                ? <img src={s.imageUrl} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 12 }}>No image</div>
              }
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#bbb', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>#{i + 1}</span>
                {!s.isActive && <span style={{ fontSize: 11, color: '#bbb', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>Hidden</span>}
              </div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>{s.title || <span style={{ color: '#ccc' }}>No title</span>}</p>
              {s.subtitle && <p style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{s.subtitle}</p>}
              <p style={{ fontSize: 12, color: '#bbb' }}>
                Button: <span style={{ color: '#555' }}>"{s.linkLabel || 'Shop Now'}"</span>
                {' → '}
                <span style={{ color: '#f8f8f4', fontFamily: 'monospace' }}>{s.linkUrl || '/products'}</span>
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px', justifyContent: 'center', borderLeft: '1px solid #f5f5f5' }}>
              <button onClick={() => move(s._id, 'up')} disabled={i === 0}
                style={{ padding: '5px 10px', border: '1px solid #e5e5e5', borderRadius: 7, cursor: i===0?'default':'pointer', background: '#fff', color: '#555', opacity: i===0?0.3:1, fontSize: 12, fontFamily: 'inherit' }}>
                ↑
              </button>
              <button onClick={() => move(s._id, 'down')} disabled={i === slides.length - 1}
                style={{ padding: '5px 10px', border: '1px solid #e5e5e5', borderRadius: 7, cursor: i===slides.length-1?'default':'pointer', background: '#fff', color: '#555', opacity: i===slides.length-1?0.3:1, fontSize: 12, fontFamily: 'inherit' }}>
                ↓
              </button>
              <button onClick={() => toggle(s)}
                style={{ padding: '5px 10px', border: '1px solid #e5e5e5', borderRadius: 7, cursor: 'pointer', background: '#fff', color: s.isActive ? '#888' : '#22c55e', fontSize: 12, fontFamily: 'inherit' }}>
                {s.isActive ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => openEdit(s)}
                style={{ padding: '5px 10px', border: '1px solid #e5e5e5', borderRadius: 7, cursor: 'pointer', background: '#fff', color: '#555', fontSize: 12, fontFamily: 'inherit' }}>
                Edit
              </button>
              <button onClick={() => del(s._id)}
                style={{ padding: '5px 10px', border: '1px solid #fee2e2', borderRadius: 7, cursor: 'pointer', background: '#fff', color: '#ef4444', fontSize: 12, fontFamily: 'inherit' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding: '20px 26px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>{modal === 'add' ? 'Add Slide' : 'Edit Slide'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '22px 26px' }}>
              <F label="Title *">
                <input style={inp} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Summer Collection 2025"/>
              </F>
              <F label="Subtitle">
                <input style={inp} value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))} placeholder="e.g. Up to 40% off selected items"/>
              </F>

              <F label="Slide Image — uploaded to Cloudinary" hint="Recommended: 1920 × 600px, JPG or PNG">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px dashed #e5e5e5', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#888', background: '#fafafa' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {imgFile ? imgFile.name : 'Click to upload image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile}/>
                </label>
                {preview && (
                  <img src={preview} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #eee' }}/>
                )}
              </F>

              <F label="Button Label" hint='Text shown on the call-to-action button'>
                <input style={inp} value={form.linkLabel} onChange={e => setForm(f => ({...f, linkLabel: e.target.value}))} placeholder="Shop Now"/>
              </F>

              <F label="Button Link" hint='Internal path (e.g. /products, /products?category=xxx) or full URL (https://...)'>
                <input style={inp} value={form.linkUrl} onChange={e => setForm(f => ({...f, linkUrl: e.target.value}))} placeholder="/products"/>
              </F>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 14px', background: '#fafafa', borderRadius: 10 }}>
                <input type="checkbox" id="slideActive" checked={!!form.isActive}
                  onChange={e => setForm(f => ({...f, isActive: e.target.checked}))}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#f8f8f4' }}/>
                <label htmlFor="slideActive" style={{ fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>Visible on homepage</label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModal(null)}
                  style={{ flex: 1, padding: '12px', border: '1px solid #e5e5e5', borderRadius: 10, cursor: 'pointer', background: '#fff', fontSize: 14, fontFamily: 'inherit', color: '#555' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', background: '#f8f8f4', color: '#f98512', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : modal === 'add' ? 'Create Slide' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
