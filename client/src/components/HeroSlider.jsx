import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { slidesApi } from '../lib/api'

// Fallback slides shown while API loads or if no slides saved yet
const FALLBACK = [{"url":"","title":"Welcome to Our Store","sub":"Discover the best products at the best prices"},{"url":"","title":"New Arrivals","sub":"Fresh styles and products just dropped"}]

export default function HeroSlider() {
  // ALL hooks must be at top level — no hooks after early returns
  const [slides,  setSlides]  = useState([])
  const [idx,     setIdx]     = useState(0)
  const [loaded,  setLoaded]  = useState(false)
  const [vpWidth, setVpWidth] = useState(window.innerWidth)

  useEffect(() => {
    slidesApi.getPublic()
      .then(data => {
        setSlides(data.length > 0 ? data : FALLBACK)
        setLoaded(true)
      })
      .catch(() => { setSlides(FALLBACK); setLoaded(true) })
  }, [])

  useEffect(() => {
    if (!slides.length) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides])

  useEffect(() => {
    const handler = () => setVpWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Early return AFTER all hooks
  if (!loaded || !slides.length) {
    return <div style={{ height: 480, background: 'var(--primary)' }}/>
  }

  const s = slides[idx]

  const getImg = (slide) => {
    if (slide.images) {
      if (vpWidth < 640  && slide.images.mobile?.url)  return slide.images.mobile.url
      if (vpWidth < 1024 && slide.images.tablet?.url)  return slide.images.tablet.url
      if (slide.images.desktop?.url)                   return slide.images.desktop.url
    }
    return slide.imageUrl || slide.url || ''
  }

  const imgSrc   = getImg(s)
  const subText  = s.subtitle  || s.sub  || ''
  const linkHref = s.linkUrl   || '/products'
  const linkText = s.linkLabel || 'Shop Now'

  return (
    <div style={{ position: 'relative', height: 480, overflow: 'hidden', background: 'var(--primary)' }}>
      {imgSrc && (
        <img key={imgSrc} src={imgSrc} alt={s.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}/>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
        {s.title && (
          <h1 style={{ color: '#fff', fontSize: 44, fontWeight: 800, marginBottom: 14, textShadow: '0 2px 12px rgba(0,0,0,0.35)', letterSpacing: -0.5, maxWidth: 700 }}>
            {s.title}
          </h1>
        )}
        {subText && (
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 30, maxWidth: 540 }}>
            {subText}
          </p>
        )}
        {linkHref.startsWith('http') ? (
          <a href={linkHref} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
            {linkText}
          </a>
        ) : (
          <Link to={linkHref} className="btn-primary" style={{ textDecoration: 'none' }}>
            {linkText}
          </Link>
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: i===idx ? 28 : 10, height: 10, borderRadius: 5, border: 'none',
                background: i===idx ? '#fff' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}/>
          ))}
        </div>
      )}

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + slides.length) % slides.length)}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setIdx(i => (i + 1) % slides.length)}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}
    </div>
  )
}
