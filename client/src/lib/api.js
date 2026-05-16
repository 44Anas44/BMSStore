import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Attach JWT token from persisted admin auth on every request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('--admin-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.token) config.headers['Authorization'] = `Bearer ${state.token}`
    }
  } catch {}
  return config
})

export const productsApi = {
  getAll:     (params) => api.get('/products', { params }).then(r => r.data),
  getById:    (id)     => api.get(`/products/${id}`).then(r => r.data),
  getLatest:  ()       => api.get('/products/latest').then(r => r.data),
  getFeatured:()       => api.get('/products/featured').then(r => r.data),
  getPromos:  ()       => api.get('/products/promos').then(r => r.data),
  getNewest:  ()       => api.get('/products/newest').then(r => r.data),
  getPopular: ()       => api.get('/products/popular').then(r => r.data),
  create:     (data)   => api.post('/products', data).then(r => r.data),
  update:     (id,data)=> api.put(`/products/${id}`, data).then(r => r.data),
  delete:     (id)     => api.delete(`/products/${id}`).then(r => r.data),
}

export const categoriesApi = {
  getAll:     ()           => api.get('/categories').then(r => r.data),
  getFeatured:()           => api.get('/categories/featured').then(r => r.data),
  getTree:    ()           => api.get('/categories/tree').then(r => r.data),
  create:     (formData)   => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update:     (id,formData)=> api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  delete:     (id)         => api.delete(`/categories/${id}`).then(r => r.data),
}

export const brandsApi = {
  getAll:  ()       => api.get('/brands').then(r => r.data),
  create:  (data)   => api.post('/brands', data).then(r => r.data),
  update:  (id,data)=> api.put(`/brands/${id}`, data).then(r => r.data),
  delete:  (id)     => api.delete(`/brands/${id}`).then(r => r.data),
}

export const slidesApi = {
  getPublic:   ()                   => api.get('/slides').then(r => r.data),
  getAll:      ()                   => api.get('/slides/all').then(r => r.data),
  create:      (data)               => api.post('/slides', data).then(r => r.data),
  update:      (id, data)           => api.put(`/slides/${id}`, data).then(r => r.data),
  uploadImage: (id, file)           => { const f=new FormData(); f.append('image',file); return api.post(`/slides/${id}/image`,f).then(r=>r.data) },
  uploadBreakpointImage: (id, breakpoint, file) => {
    const f = new FormData(); f.append('image', file)
    return api.post(`/slides/${id}/image/${breakpoint}`, f).then(r => r.data)
  },
  reorder: (ids) => api.patch('/slides/reorder', { ids }).then(r => r.data),
  delete:  (id)  => api.delete(`/slides/${id}`).then(r => r.data),
}

export const ordersApi = {
  getAll:      (params)    => api.get('/orders', { params }).then(r => r.data),
  create:      (data)      => api.post('/orders', data).then(r => r.data),
  updateStatus:(id, status)=> api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
  getStats:    ()          => api.get('/orders/stats').then(r => r.data),
}

export const uploadApi = {
  // Product images — up to 5 files
  productImages: (files) => {
    const f = new FormData()
    ;[...files].forEach(file => f.append('images', file))
    return api.post('/upload/product-images', f).then(r => r.data)
  },
  // Single product image
  productImage: (file) => {
    const f = new FormData()
    f.append('image', file)
    return api.post('/upload/product-image', f).then(r => r.data)
  },
  // Category cover image
  categoryImage: (file) => {
    const f = new FormData()
    f.append('image', file)
    return api.post('/upload/category-image', f).then(r => r.data)
  },
  // Brand logo
  brandImage: (file) => {
    const f = new FormData()
    f.append('image', file)
    return api.post('/upload/brand-image', f).then(r => r.data)
  },
  // Delete from Cloudinary
  deleteImage: (publicId) => api.delete(`/upload/image/${encodeURIComponent(publicId)}`).then(r => r.data),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),
}

