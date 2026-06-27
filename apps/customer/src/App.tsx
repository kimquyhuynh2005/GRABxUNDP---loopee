import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { ToastProvider } from './contexts/ToastContext'

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </CartProvider>
    </UserProvider>
  )
}
