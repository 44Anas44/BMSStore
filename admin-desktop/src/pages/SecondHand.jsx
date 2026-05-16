import React, { useEffect, useState } from 'react'
import { productsApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function SecondHand() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  const load = () => {
    setLoading(true)
    productsApi.getAll({ limit: 200, all: 'true' }).then(d => {
      setProducts((d.products || []).filter(p => p.isSecondHand))
    }).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggle = async (p) => {
    try {
      await productsApi.update(p._id, { ...p, isSecondHand: !p.isSecondHand, category: p.category?._id || p.category, brand: p.brand?._id || p.brand })
      toast.success('Updated'); load()
    } catch { toast.error('Failed') }
  }

  return (
    <div style={{ padding:28, height:'100%', overflowY:'auto' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-0.3, color:'#1a1a1a' }}>Second-Hand Products</h1>
        <p style={{ fontSize:13, color:'#aaa', marginTop:3 }}>Products marked as second-hand appear on the /second-hand page, not on the main products page</p>
      </div>
      <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#c2410c' }}>
        To add a product as second-hand: go to Products → Edit any product → check "Second Hand". It will appear here and on the second-hand page.
      </div>
      {loading && <p style={{ color:'#aaa' }}>Loading...</p>}
      {!loading && products.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#ccc' }}>
          <p style={{ fontSize:14 }}>No second-hand products yet</p>
          <p style={{ fontSize:12, marginTop:6 }}>Mark products as "Second Hand" in the Products page</p>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {products.map(p => (
          <div key={p._id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:12, overflow:'hidden' }}>
            <img src={p.images?.[0] || 'https://placehold.co/260x160/f5f5f5/ccc?text=No+Image'} alt={p.name}
              style={{ width:'100%', height:140, objectFit:'cover' }}/>
            <div style={{ padding:'12px 14px' }}>
              <p style={{ fontWeight:600, fontSize:14, color:'#1a1a1a', marginBottom:4 }}>{p.name}</p>
              <p style={{ fontSize:13, color:'#888', marginBottom:10 }}>{p.price.toFixed(2)} TND</p>
              <button onClick={() => toggle(p)}
                style={{ width:'100%', padding:'8px', border:'1px solid #fee2e2', borderRadius:8, cursor:'pointer', background:'#fef2f2', color:'#ef4444', fontSize:12, fontFamily:'inherit', fontWeight:600 }}>
                Remove from Second-Hand
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
