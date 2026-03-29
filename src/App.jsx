import { Routes, Route } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import Checkout from '@/pages/Checkout/Checkout'
import CheckoutSuccess from '@/pages/Checkout/CheckoutSuccess'
import ReservaSuccess from '@/pages/Checkout/ReservaSuccess'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { InventoryProvider } from '@/context/InventoryContext'
import { BannerProvider } from '@/context/BannerContext'
import Layout from '@/components/layout/Layout'
import RequireAdmin from '@/components/auth/RequireAdmin'
import Home from '@/pages/Home/Home'
import Catalog from '@/pages/Catalog/Catalog'
import ProductDetail from '@/pages/ProductDetail/ProductDetail'
import Inventory from '@/pages/Inventory/Inventory'
import AdminLogin from '@/pages/AdminLogin/AdminLogin'
import AdminDashboard from '@/pages/AdminDashboard/AdminDashboard'
import Clientes from '@/pages/Clientes/Clientes'
import Ventas from '@/pages/Ventas/Ventas'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BannerProvider>
          <InventoryProvider>
            <CartProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/productos" element={<Catalog />} />
                  <Route path="/productos/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/checkout/reserva-success" element={<ReservaSuccess />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/inventario" element={<RequireAdmin><Layout /></RequireAdmin>}>
                  <Route index element={<Inventory />} />
                </Route>
                <Route path="/clientes" element={<RequireAdmin><Layout /></RequireAdmin>}>
                  <Route index element={<Clientes />} />
                </Route>
                <Route path="/ventas" element={<RequireAdmin><Layout /></RequireAdmin>}>
                  <Route index element={<Ventas />} />
                </Route>
              </Routes>
            </CartProvider>
          </InventoryProvider>
        </BannerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
