import { createBrowserRouter } from 'react-router-dom'
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

export const router = createBrowserRouter([
  // Main app with BottomNav
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'orders', element: <ActiveOrders /> },
      { path: 'stations', element: <GreenStations /> },
      { path: 'rewards', element: <MyRewards /> },
      { path: 'account', element: <Account /> },
    ],
  },
  // Full-screen flows (no BottomNav)
  { path: '/search', element: <Search /> },
  { path: '/restaurant/:id', element: <RestaurantDetail /> },
  { path: '/cart', element: <Cart /> },
  { path: '/order-success/:id', element: <OrderSuccess /> },
  { path: '/orders/:id/token', element: <ReturnToken /> },
  { path: '/group/:id', element: <CreateGroup /> },
  { path: '/group/join', element: <JoinGroup /> },
])
