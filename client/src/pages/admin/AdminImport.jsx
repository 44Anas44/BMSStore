import React, { useState } from 'react'
import { importApi } from '../../lib/api'
import toast from 'react-hot-toast'

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }
const F = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{hint}</p>}
  </div>
)

export default function AdminImport() {
  const [rows, setRows]         = useState(null)   // parsed products from the JSON file
  const [fileName, setFileName] = useState('')
  const [category, setCategory] = useState('Dell')
  const [brand, setBrand]       = useState('Dell')
  const [margin, setMargin]     = useState(0)
  const [stock, setStock]       = useState(0)
  const [exclude, setExclude]   = useState('')
  const [update, setUpdate]     = useState(false)
  const [busy, setBusy]         = useState(false)
  const [result, setResult]     = useState(null)
  const [delImgs, setDelImgs]   = useState(true)   // only delete products without images

  const onFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const list = Array.isArray(data) ? data : data.products
      if (!Array.isArray(list)) throw new Error('Expected an array of products')
      // send only what the server needs (title, price, specs)
      setRows(list.map(p => ({ title: p.title, price: p.price, specs: p.specs || {} })))
      setFileName(file.name); setResult(null)
    } catch (err) {
      setRows(null); setFileName('')
      toast.error('Invalid file: ' + err.message)
    }
  }

  const run = async (dryRun) => {
    if (!rows?.length) return toast.error('Choose dell-products.json first')
    setBusy(true)
    try {
      const r = await importApi.products({
        products: rows,
        categoryName: category, brandName: brand,
        margin: Number(margin) || 0, stock: Number(stock) || 0,
        exclude: exclude.split(',').map(s => s.trim()).filter(Boolean),
        updateExisting: update, dryRun,
      })
      setResult(r)
      toast.success(dryRun ? 'Preview ready (nothing saved)' : `Imported ${r.created} products`)
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.error || err.message))
    } finally { setBusy(false) }
  }

  const removeProducts = async () => {
    if (!category.trim()) return toast.error('Enter the category name')
    setBusy(true)
    try {
      const payload = { categoryName: category, onlyWithoutImages: delImgs }
      const { matched } = await importApi.remove({ ...payload, dryRun: true })
      if (!matched) { toast('Nothing to delete in “' + category + '”'); return }
      const ok = window.confirm(`Delete ${matched} product(s) from “${category}”${delImgs ? ' that have no images' : ''}?\n\nThis cannot be undone.`)
      if (!ok) return
      const r = await importApi.remove({ ...payload, confirm: 'DELETE' })
      setResult(null)
      toast.success(`Deleted ${r.deleted} products`)
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.error || err.message))
    } finally { setBusy(false) }
  }

  const btn = (primary) => ({
    padding: '10px 18px', borderRadius: 8, border: primary ? 'none' : '1px solid #ddd', cursor: busy ? 'wait' : 'pointer',
    background: primary ? '#f98512' : '#fff', color: primary ? '#fff' : '#333', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', opacity: busy ? 0.6 : 1,
  })

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Import products</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 22 }}>
        Upload <b>dell-products.json</b>. Products are added to the category below (created if missing).
        Images are added afterwards from the Products page.
      </p>

      <F label="Products file (.json)" hint={rows ? `${fileName} — ${rows.length} products` : ''}>
        <input type="file" accept=".json,application/json" onChange={onFile} style={inp} />
      </F>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><F label="Category"><input style={inp} value={category} onChange={e => setCategory(e.target.value)} /></F></div>
        <div style={{ flex: 1 }}><F label="Brand"><input style={inp} value={brand} onChange={e => setBrand(e.target.value)} /></F></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><F label="Price margin (%)" hint="Added on top of the scraped price"><input style={inp} type="number" value={margin} onChange={e => setMargin(e.target.value)} /></F></div>
        <div style={{ flex: 1 }}><F label="Initial stock" hint="0 = cannot be ordered yet"><input style={inp} type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} /></F></div>
      </div>
      <F label="Skip titles containing" hint="Comma separated, e.g. nappe, charnière, chargeur">
        <input style={inp} value={exclude} onChange={e => setExclude(e.target.value)} placeholder="nappe, charnière" />
      </F>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 20 }}>
        <input type="checkbox" checked={update} onChange={e => setUpdate(e.target.checked)} />
        Update prices of products that already exist
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={btn(false)} disabled={busy} onClick={() => run(true)}>Preview (saves nothing)</button>
        <button style={btn(true)} disabled={busy} onClick={() => run(false)}>Import now</button>
      </div>

      {result && (
        <div style={{ marginTop: 24, background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 18, fontSize: 14, lineHeight: 1.7 }}>
          <b>{result.dryRun ? 'Preview' : 'Done'}</b> — category “{result.category}”
          {result.categoryCreated && (result.dryRun ? ' (will be created)' : ' (created)')}
          <br />Created: <b>{result.created}</b> · Updated prices: <b>{result.updated}</b> · Already existed: {result.skipped} · Excluded: {result.excluded} · Invalid: {result.invalid}
          {result.sample?.length > 0 && (
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: '#666', fontSize: 13 }}>
              {result.sample.map(s => <li key={s.name}>{s.name} — {s.price} TND</li>)}
            </ul>
          )}
        </div>
      )}

      <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid #eee' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#b91c1c' }}>Delete imported products</h2>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
          Removes products in the category above (“{category}”). Products that were ever sold are never deleted.
        </p>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 14 }}>
          <input type="checkbox" checked={delImgs} onChange={e => setDelImgs(e.target.checked)} />
          Only products that have no images
        </label>
        <button style={{ ...btn(false), borderColor: '#fca5a5', color: '#b91c1c' }} disabled={busy} onClick={removeProducts}>
          Delete products…
        </button>
      </div>
    </div>
  )
}
