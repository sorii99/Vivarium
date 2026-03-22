import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
    </div>
  )
}
