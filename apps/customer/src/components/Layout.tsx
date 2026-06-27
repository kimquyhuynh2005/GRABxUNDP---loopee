import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import RewardPopup from './RewardPopup'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto relative shadow-2xl">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
      <RewardPopup />
    </div>
  )
}
