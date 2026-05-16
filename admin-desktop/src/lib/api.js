import axios from 'axios'

const APP_KEY = import.meta.env.VITE_APP_KEY || ''
const BASE    = import.meta.env.VITE_API_URL  || 'http://localhost:5000/api'

const api = axios.create({ baseURL: BASE })

// Attach API key to every request — this is what authenticates the desktop app
api.interceptors.request.use(config => {
  config.headers['X-App-Key'] = APP_KEY
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      console.error('API key rejected — check VITE_APP_KEY in .env')
    }
    return Promise.reject(err)
  }
)

export const productsApi = {
  getAll:  (p) => api.get('/products', { params: p }).then(r => r.data),
  getById: (id)=> api.get(`/products/${id}`).then(r => r.data),
  create:  (d) => api.post('/products', d).then(r => r.data),
  update:  (id,d)=> api.put(`/products/${id}`, d).then(r => r.data),
  delete:  (id)=> api.delete(`/products/${id}`).then(r => r.data),
}
export const categoriesApi = {
  getAll:  ()    => api.get('/categories').then(r => r.data),
  getTree: ()    => api.get('/categories/tree').then(r => r.data),
  create:  (fd)  => api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update:  (id,fd)=> api.put(`/categories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  delete:  (id)  => api.delete(`/categories/${id}`).then(r => r.data),
}
export const brandsApi = {
  getAll:  ()    => api.get('/brands').then(r => r.data),
  create:  (d)   => api.post('/brands', d).then(r => r.data),
  delete:  (id)  => api.delete(`/brands/${id}`).then(r => r.data),
}
export const ordersApi = {
  getAll:       (p)    => api.get('/orders', { params: p }).then(r => r.data),
  updateStatus: (id,s) => api.patch(`/orders/${id}/status`, { status: s }).then(r => r.data),
  getStats:     ()     => api.get('/orders/stats').then(r => r.data),
}
export const uploadApi = {
  productImages: (files) => {
    const f = new FormData()
    ;[...files].forEach(file => f.append('images', file))
    return api.post('/upload/product-images', f).then(r => r.data)
  },
  categoryImage: (file) => {
    const f = new FormData()
    f.append('image', file)
    return api.post('/upload/category-image', f).then(r => r.data)
  },
}
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),
}
export const healthApi = {
  check: () => api.get('/health').then(r => r.data),
}
export const slidesApi = {
  getAll:      ()         => api.get('/slides/all').then(r => r.data),
  create:      (data)     => api.post('/slides', data).then(r => r.data),
  update:      (id, data) => api.put(`/slides/${id}`, data).then(r => r.data),
  uploadImage: (id, file) => { const f=new FormData(); f.append('image',file); return api.post(`/slides/${id}/image`,f).then(r=>r.data) },
  reorder:     (ids)      => api.patch('/slides/reorder',{ids}).then(r=>r.data),
  delete:      (id)       => api.delete(`/slides/${id}`).then(r=>r.data),
}
