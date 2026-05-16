import axios from 'axios'
import { API_URL, APP_KEY } from '../config'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(config => {
  config.headers['X-App-Key'] = APP_KEY
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('API key rejected — check APP_KEY in .env')
    }
    return Promise.reject(err)
  }
)

export const productsApi = {
  getAll:    (params) => api.get('/products', { params }).then(r => r.data),
  getById:   (id)     => api.get(`/products/${id}`).then(r => r.data),
  create:    (data)   => api.post('/products', data).then(r => r.data),
  update:    (id,data)=> api.put(`/products/${id}`, data).then(r => r.data),
  delete:    (id)     => api.delete(`/products/${id}`).then(r => r.data),
}
export const categoriesApi = {
  getAll:  ()        => api.get('/categories').then(r => r.data),
  getTree: ()        => api.get('/categories/tree').then(r => r.data),
  create:  (data)    => api.post('/categories', data).then(r => r.data),
  update:  (id,data) => api.put(`/categories/${id}`, data).then(r => r.data),
  delete:  (id)      => api.delete(`/categories/${id}`).then(r => r.data),
}
export const brandsApi = {
  getAll:  ()        => api.get('/brands').then(r => r.data),
  create:  (data)    => api.post('/brands', data).then(r => r.data),
  delete:  (id)      => api.delete(`/brands/${id}`).then(r => r.data),
}
export const ordersApi = {
  getAll:       (params) => api.get('/orders', { params }).then(r => r.data),
  updateStatus: (id,status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
  getStats:     ()       => api.get('/orders/stats').then(r => r.data),
}
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),
  registerPushToken: (token) => api.post('/auth/push-token', { token }).then(r => r.data),
}
export const slidesApi = {
  getAll:  ()        => api.get('/slides').then(r => r.data),
  create:  (data)    => api.post('/slides', data).then(r => r.data),
  update:  (id,data) => api.put(`/slides/${id}`, data).then(r => r.data),
  delete:  (id)      => api.delete(`/slides/${id}`).then(r => r.data),
}
export const diagnosticsApi = {
  getAll:   (params) => api.get('/diagnostics', { params }).then(r => r.data),
  create:   (data)   => api.post('/diagnostics', data).then(r => r.data),
  update:   (id,data)=> api.put(`/diagnostics/${id}`, data).then(r => r.data),
  delete:   (id)     => api.delete(`/diagnostics/${id}`).then(r => r.data),
}
export const uploadApi = {
  productImages: async (uris) => {
    const fd = new FormData()
    uris.forEach((uri, i) => fd.append('images', { uri, name: `img${i}.jpg`, type: 'image/jpeg' }))
    return api.post('/upload/product-images', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
  categoryImage: async (uri) => {
    const fd = new FormData()
    fd.append('image', { uri, name: 'category.jpg', type: 'image/jpeg' })
    return api.post('/upload/category-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
}
