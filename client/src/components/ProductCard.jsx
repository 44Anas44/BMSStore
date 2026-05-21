import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

const CartPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const [hovered, setHovered] = useState(false)
  const img = product.images?.[0] || 'https://placehold.co/400x400/f0f0f0/aaaaaa?text=No+Image'
  const img2 = product.images?.[1]
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #e8e8e8', borderRadius: 14, overflow: 'hidden',
        background: '#fff', display: 'flex', flexDirection: 'column', height: '100%',
        transition: 'transform 0.25s, box-shadow 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}>

      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f7f7f7' }}>
          <img src={img} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s, opacity 0.3s',
              transform: hovered && img2 ? 'scale(1.03)' : 'scale(1)',
              opacity: hovered && img2 ? 0 : 1, position: 'absolute', inset: 0 }} />
          {img2 && (
            <img src={img2} alt={product.name + ' alt'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s',
                opacity: hovered ? 1 : 0, position: 'absolute', inset: 0 }} />
          )}
        </div>

        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {discount && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
              -{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span style={{ background: '#9c155f', color: '#f97316', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
              NEW
            </span>
          )}
          {product.isPromo && !discount && (
            <span style={{ background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
              PROMO
            </span>
          )}
        </div>

        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: '#fff', borderRadius: 8, padding: 7,
          opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 0.2s, transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          color: '#555',
        }}>
          <EyeIcon />
        </div>
      </Link>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {product.brand?.name && (
          <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            {product.brand.name}
          </p>
        )}
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.4, marginBottom: 10, color: '#1a1a1a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>
        </Link>

        {product.category?.name && (
          <p style={{ fontSize: 11, color: '#bbb', marginBottom: 10 }}>{product.category.name}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto', marginBottom: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#f97316' }}>
            {product.price.toFixed(2)} TND
          </span>
          {product.comparePrice > product.price && (
            <span style={{ textDecoration: 'line-through', color: '#ccc', fontSize: 13 }}>
              {product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (product.stock === 0) { toast.error(product.name + ' est en rupture de stock'); return }
            const result = addItem(product)
            if (result?.clamped) toast.success('Ajouté (seulement ' + result.available + ' en stock)')
            else toast.success(product.name + ' ajouté au panier !')
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: hovered ? '#9c155f' : '#f4f4f4',
            color: hovered ? '#f97316' : '#444',
            fontWeight: 600, fontSize: 13, transition: 'all 0.2s', fontFamily: 'inherit',
          }}>
          <CartPlusIcon /> Ajouter au Panier
        </button>
      </div>
    </div>
  )
}
