import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productsApi } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => { productsApi.getById(id).then(setProduct).catch(console.error) }, [id])

  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>
  const imgs = product.images?.length ? product.images : ['https://placehold.co/600x600?text=No+Image']

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        <div>
          <img src={imgs[imgIdx]} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 14, marginBottom: 12 }} />
          {imgs.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {imgs.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i===imgIdx ? '2px solid var(--primary)' : '2px solid transparent', opacity: i===imgIdx ? 1 : 0.6 }} />
              ))}
            </div>
          )}
        </div>
        <div>
          <p style={{ color: '#888', marginBottom: 6 }}>{product.brand?.name}</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>{product.name}</h1>
          <p style={{ color: '#555', marginBottom: 20, lineHeight: 1.7 }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>{product.price.toFixed(2)} TND</span>
            {product.comparePrice > product.price && (
              <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: 18 }}>{product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>Category: {product.category?.name || '—'}</p>
          {product.stock > 0 ? (
            <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, marginBottom: 24 }}>✓ In stock: {product.stock} available</p>
          ) : (
            <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 24 }}>✗ Out of stock</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', fontSize: 18, background: '#fff' }}>−</button>
            <span style={{ fontSize: 18, fontWeight: 600, minWidth: 32, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', fontSize: 18, background: '#fff' }}>+</button>
          </div>
          {product.stock === 0 ? (
            <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '14px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
              Out of Stock
            </button>
          ) : (
            <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '14px' }}
              onClick={() => {
                const result = addItem(product, qty)
                if (result?.clamped) {
                  toast.success(`Added to cart (only ${result.available} available — quantity adjusted)`)
                } else {
                  toast.success(`${qty}× added to cart!`)
                }
              }}>
              🛒 Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
