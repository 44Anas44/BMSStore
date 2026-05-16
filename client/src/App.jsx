import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import SecondHandPage  from './pages/SecondHandPage'
import DiagnosticsPage from './pages/DiagnosticsPage'
import AdminLogin      from './pages/admin/AdminLogin'
import AdminLayout     from './pages/admin/AdminLayout'
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminProducts   from './pages/admin/AdminProducts'
import AdminOrders     from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSlides     from './pages/admin/AdminSlides'
import { useAuthStore } from './store/authStore'
import { Navigate }    from 'react-router-dom'

function ProtectedAdmin({ children }) {
  const { isAdmin } = useAuthStore()
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes — no Header/Footer */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<ProtectedAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdmin>} />
      <Route path="admin/products"   element={<ProtectedAdmin><AdminLayout><AdminProducts /></AdminLayout></ProtectedAdmin>} />
      <Route path="admin/orders"     element={<ProtectedAdmin><AdminLayout><AdminOrders /></AdminLayout></ProtectedAdmin>} />
      <Route path="admin/categories" element={<ProtectedAdmin><AdminLayout><AdminCategories /></AdminLayout></ProtectedAdmin>} />
      <Route path="admin/slides"     element={<ProtectedAdmin><AdminLayout><AdminSlides /></AdminLayout></ProtectedAdmin>} />

      {/* Store routes */}
      <Route path="/*" element={
        <>
          <Header />
          <main style={{ minHeight: '70vh' }}>
            <Routes>
              <Route index element={<HomePage />} />
              <Route path="products"     element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductPage />} />
              <Route path="cart"         element={<CartPage />} />
              <Route path="secondhand"   element={<SecondHandPage/>}/>
              <Route path="diagnostics"  element={<DiagnosticsPage/>}/>
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>
  )
}
