import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/UserContext'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import ActiveOrders from '../pages/ActiveOrders'
import GreenStations from '../pages/GreenStations'
import MyRewards from '../pages/MyRewards'
import Account from '../pages/Account'
import ReturnToken from '../pages/ReturnToken'
import Search from '../pages/Search'
import RestaurantDetail from '../pages/RestaurantDetail'
import Cart from '../pages/Cart'
import OrderSuccess from '../pages/OrderSuccess'
import CreateGroup from '../pages/CreateGroup'
import JoinGroup from '../pages/JoinGroup'
import Login from '../pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },

  // Main app with BottomNav
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Home /> },
      { path: 'orders', element: <ActiveOrders /> },
      { path: 'stations', element: <GreenStations /> },
      { path: 'rewards', element: <MyRewards /> },
      { path: 'account', element: <Account /> },
    ],
  },

  // Full-screen flows (no BottomNav)
  { path: '/search', element: <ProtectedRoute><Search /></ProtectedRoute> },
  { path: '/restaurant/:id', element: <ProtectedRoute><RestaurantDetail /></ProtectedRoute> },
  { path: '/cart', element: <ProtectedRoute><Cart /></ProtectedRoute> },
  { path: '/order-success/:id', element: <ProtectedRoute><OrderSuccess /></ProtectedRoute> },
  { path: '/orders/:id/token', element: <ProtectedRoute><ReturnToken /></ProtectedRoute> },
  { path: '/group/:id', element: <ProtectedRoute><CreateGroup /></ProtectedRoute> },
  { path: '/group/join', element: <ProtectedRoute><JoinGroup /></ProtectedRoute> },
])
