import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

interface Order {
  id: string
  order_code: string
  restaurant_name: string
  status: string
  eco_box_count: number
  return_deadline: string
  return_tokens: { token_code: string }[]
}

function calcRewardPct(deadline: string): number {
  const hoursLate = (Date.now() - new Date(deadline).getTime()) / 3600000
  if (hoursLate <= 0) return 100
  if (hoursLate <= 24) return Math.max(0, Math.round(100 - hoursLate * 4))
  return 0
}

function getHoursLeft(deadline: string): number {
  return Math.max(0, (new Date(deadline).getTime() - Date.now()) / 3600000)
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'delivered') {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
        Delivered
      </span>
    )
  }
  if (status === 'out_for_delivery') {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-500">
        Out for Delivery
      </span>
    )
  }
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-500">
      Preparing
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()
  const pct = calcRewardPct(order.return_deadline)
  const isDecaying = pct < 100 && pct > 0
  const isDead = pct === 0
  const hoursLeft = getHoursLeft(order.return_deadline)

  const barColor = isDead ? 'bg-gray-300' : isDecaying ? 'bg-orange-400' : 'bg-green-500'
  const textColor = isDecaying || isDead ? 'text-orange-500' : 'text-green-600'
  const iconStroke = isDecaying || isDead ? '#f97316' : '#16a34a'

  const handleOpenToken = () => {
    navigate(`/orders/${order.id}/token`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Row 1: code + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400 font-mono tracking-wide">{order.order_code}</span>
        <StatusBadge status={order.status} />
      </div>

      {/* Row 2: restaurant */}
      <p className="font-semibold text-gray-900 text-lg leading-tight">{order.restaurant_name}</p>

      {/* Row 3: reward status */}
      <div className={`flex items-center justify-between text-sm font-medium ${textColor}`}>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            {isDead
              ? 'Reward expired'
              : isDecaying
              ? `${Math.round(hoursLeft)}h left — Reward decaying`
              : '24h left to return'}
          </span>
        </div>
        <span className="font-bold">{pct}%</span>
      </div>

      {/* Row 4: progress bar */}
      <div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Reward Integrity Bar</p>
      </div>

      <div className="border-t border-gray-100" />

      {/* Row 5: QR token */}
      <button
        onClick={handleOpenToken}
        className="w-full flex items-center gap-3 py-0.5 active:opacity-70"
      >
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="2" height="2" />
            <rect x="17" y="14" width="4" height="2" />
            <rect x="14" y="17" width="2" height="4" />
            <rect x="17" y="17" width="4" height="4" rx="0.5" />
          </svg>
        </div>
        <span className="flex-1 text-left text-sm font-medium text-gray-700">
          Tap to open Personal Return Token
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

export default function ActiveOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, return_tokens(token_code)')
      .eq('user_id', DEMO_USER_ID)
      .in('status', ['preparing', 'out_for_delivery', 'delivered'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? [])
        setLoading(false)
      })
  }, [])

  const navigate = useNavigate()

  return (
    <div className="min-h-full">
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your eco deliveries</p>
          </div>
          {orders.length > 0 && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">
              {orders.length} active
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">📦</span>
            </div>
            <p className="font-bold text-gray-700 text-lg">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Your eco deliveries will appear here</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 text-white font-semibold rounded-2xl px-8 py-3 active:scale-[0.97] transition-transform"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
