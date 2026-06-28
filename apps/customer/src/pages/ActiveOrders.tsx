import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../contexts/UserContext'

interface Order {
  id: string
  order_code: string
  restaurant_name: string
  status: string
  eco_box_count: number
  return_deadline: string
  return_tokens: { token_code: string }[]
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  confirmed:        { label: 'Đã xác nhận',   bg: 'bg-indigo-50',  text: 'text-indigo-600', dot: 'bg-indigo-400' },
  preparing:        { label: 'Đang chuẩn bị', bg: 'bg-blue-50',    text: 'text-blue-500',   dot: 'bg-blue-400' },
  ready:            { label: 'Sẵn sàng giao', bg: 'bg-lime-50',    text: 'text-lime-600',   dot: 'bg-lime-500' },
  out_for_delivery: { label: 'Đang giao',      bg: 'bg-amber-50',   text: 'text-amber-500',  dot: 'bg-amber-400' },
  delivered:        { label: 'Đã giao',        bg: 'bg-emerald-50', text: 'text-emerald-600',dot: 'bg-emerald-500' },
  returned:         { label: 'Đã hoàn trả',   bg: 'bg-teal-50',    text: 'text-teal-600',   dot: 'bg-teal-500' },
  cancelled:        { label: 'Đã hủy',         bg: 'bg-red-50',     text: 'text-red-400',    dot: 'bg-red-400' },
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
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['preparing']
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()
  const pct = calcRewardPct(order.return_deadline)
  const isDecaying = pct < 100 && pct > 0
  const isDead = pct === 0
  const hoursLeft = getHoursLeft(order.return_deadline)

  const isCancelled = order.status === 'cancelled'
  const isReturned  = order.status === 'returned'
  const isDelivered = order.status === 'delivered'
  const isActive    = ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)

  const barColor  = isDead ? 'bg-gray-300' : isDecaying ? 'bg-orange-400' : 'bg-green-500'
  const textColor = isDecaying || isDead ? 'text-orange-500' : 'text-green-600'
  const iconStroke = isDecaying || isDead ? '#f97316' : '#16a34a'

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 space-y-3 ${isCancelled ? 'opacity-60' : ''}`}>

      {/* Row 1: code + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400 font-mono tracking-wide">{order.order_code}</span>
        <StatusBadge status={order.status} />
      </div>

      {/* Row 2: restaurant */}
      <p className={`font-semibold text-lg leading-tight ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {order.restaurant_name}
      </p>

      {/* Row 3: progress steps — chỉ hiện khi đang active */}
      {isActive && (
        <div className="flex items-center gap-1">
          {['confirmed', 'preparing', 'ready', 'out_for_delivery'].map((s, i, arr) => {
            const idx = arr.indexOf(order.status)
            const done = i <= idx
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < idx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Eco reward bar — ẩn nếu cancelled */}
      {!isCancelled && (
        <>
          <div className={`flex items-center justify-between text-sm font-medium ${textColor}`}>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                {isReturned
                  ? 'Đã hoàn trả · Điểm đã được cộng'
                  : isDead
                  ? 'Reward expired'
                  : isDecaying
                  ? `${Math.round(hoursLeft)}h còn lại — Đang giảm`
                  : '24h để hoàn trả eco box'}
              </span>
            </div>
            <span className="font-bold">{isReturned ? '✓' : `${pct}%`}</span>
          </div>

          <div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${isReturned ? 'bg-teal-500' : barColor}`}
                style={{ width: isReturned ? '100%' : `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Reward Integrity Bar</p>
          </div>
        </>
      )}

      {/* Cancelled note */}
      {isCancelled && (
        <p className="text-xs text-red-400 font-medium">Đơn hàng đã bị hủy · Không có điểm thưởng</p>
      )}

      {/* Footer actions */}
      {!isCancelled && !isReturned && (
        <>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => navigate(`/orders/${order.id}/token`)}
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
              Mở Return Token cá nhân
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button className="w-full bg-[#1a4731] active:bg-[#122f21] text-white font-semibold text-sm rounded-xl py-3 active:scale-[0.98] transition-transform">
            Ready to pick up
          </button>
        </>
      )}

      {/* Returned state footer */}
      {isReturned && (
        <div className="flex items-center gap-2 bg-teal-50 rounded-xl px-3 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-xs font-semibold text-teal-600">Eco box đã được hoàn trả thành công</p>
        </div>
      )}
    </div>
  )
}

export default function ActiveOrders() {
  const user = useUser()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('orders')
      .select('*, return_tokens(token_code)')
      .eq('user_id', user.id)
      .in('status', ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'returned', 'cancelled'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? [])
        setLoading(false)
      })
  }, [user?.id])

  const activeCount = orders.filter(o => ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length

  return (
    <div className="min-h-full">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">Theo dõi đơn giao eco</p>
          </div>
          {activeCount > 0 && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">
              {activeCount} đang xử lý
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
            <p className="font-bold text-gray-700 text-lg">Chưa có đơn hàng</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Đơn giao eco của bạn sẽ hiện ở đây</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 text-white font-semibold rounded-2xl px-8 py-3 active:scale-[0.97] transition-transform"
            >
              Đặt ngay
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
