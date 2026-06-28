import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser, useAuth } from '../contexts/UserContext'

interface Milestone {
  id: number
  orders_required: number
  points_reward: number
  label: string
}

interface UserMilestone {
  milestone_id: number
  is_claimed: boolean
}

function MilestoneNode({
  milestone,
  userMilestone,
  totalOrders,
  onClaim,
  claiming,
}: {
  milestone: Milestone
  userMilestone: UserMilestone | undefined
  totalOrders: number
  onClaim: (id: number, pts: number) => void
  claiming: number | null
}) {
  const reached = totalOrders >= milestone.orders_required
  const claimed = userMilestone?.is_claimed ?? false
  const isThisClaiming = claiming === milestone.id

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      {/* Circle */}
      {claimed ? (
        <div className="w-12 h-12 rounded-full bg-[#1a4731] flex items-center justify-center shadow-md z-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      ) : reached ? (
        <button
          onClick={() => onClaim(milestone.id, milestone.points_reward)}
          disabled={isThisClaiming}
          className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-4 ring-green-100 active:scale-95 transition-transform disabled:opacity-60 z-10"
        >
          {isThisClaiming
            ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
          }
        </button>
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center z-10">
          <span className="text-[11px] font-bold text-gray-300">{milestone.orders_required}</span>
        </div>
      )}

      {/* Labels */}
      <p className={`text-[11px] font-bold leading-none ${
        claimed ? 'text-[#1a4731]' : reached ? 'text-green-600' : 'text-gray-300'
      }`}>
        +{milestone.points_reward} pts
      </p>
      <p className={`text-[10px] leading-none ${
        claimed ? 'text-gray-500' : reached ? 'text-gray-500' : 'text-gray-300'
      }`}>
        {milestone.orders_required} đơn
      </p>

      {/* Status chip */}
      {claimed && (
        <span className="text-[9px] font-bold text-[#1a4731] bg-green-50 px-2 py-0.5 rounded-full">
          ✓ Claimed
        </span>
      )}
      {reached && !claimed && (
        <span className="text-[9px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
          Nhận ngay!
        </span>
      )}
    </div>
  )
}

function getProgressPct(totalOrders: number, milestones: Milestone[]): number {
  const sorted = [...milestones].sort((a, b) => a.orders_required - b.orders_required)
  const n = sorted.length
  if (n === 0) return 0
  if (totalOrders < sorted[0].orders_required) return 0
  if (totalOrders >= sorted[n - 1].orders_required) return 100
  for (let i = 0; i < n - 1; i++) {
    if (totalOrders >= sorted[i].orders_required && totalOrders < sorted[i + 1].orders_required) {
      const fraction = (totalOrders - sorted[i].orders_required) / (sorted[i + 1].orders_required - sorted[i].orders_required)
      return ((i + fraction) / (n - 1)) * 100
    }
  }
  return 0
}

const MENU_ITEMS_1 = [
  {
    label: 'My Rewards Locker',
    subtitleKey: 'vouchers' as const,
    to: '/rewards',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v10H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    label: 'Payment Methods',
    subtitle: 'Visa ...8842, MoMo',
    to: '/payment',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Saved Addresses',
    subtitle: 'Work, Home',
    to: '/addresses',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
]

export default function Account() {
  const user = useUser()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [userMilestones, setUserMilestones] = useState<UserMilestone[]>([])
  const [voucherCount, setVoucherCount] = useState(0)
  const [claiming, setClaiming] = useState<number | null>(null)
  const [localPoints, setLocalPoints] = useState<number | null>(null)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    supabase
      .from('milestones')
      .select('*')
      .order('orders_required')
      .then(({ data }) => setMilestones(data ?? []))
  }, [])

  useEffect(() => {
    if (!user?.id) return

    // Count actual placed orders directly from orders table
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setOrderCount(count ?? 0))

    supabase
      .from('user_milestones')
      .select('milestone_id, is_claimed')
      .eq('user_id', user.id)
      .then(({ data }) => setUserMilestones(data ?? []))

    supabase
      .from('user_vouchers')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_used', false)
      .then(({ count }) => setVoucherCount(count ?? 0))
  }, [user?.id])

  async function handleClaim(milestoneId: number, pts: number) {
    setClaiming(milestoneId)
    try {
      if (!user?.id) return
      await supabase
        .from('user_milestones')
        .update({ is_claimed: true, claimed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('milestone_id', milestoneId)

      const newPoints = (user?.points ?? 0) + pts
      await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', user.id)

      setLocalPoints(newPoints)
      setUserMilestones((prev) =>
        prev.map((um) =>
          um.milestone_id === milestoneId ? { ...um, is_claimed: true } : um
        )
      )
    } finally {
      setClaiming(null)
    }
  }

  const displayPoints = localPoints ?? user?.points ?? 0
  const sortedMilestones = [...milestones].sort((a, b) => a.orders_required - b.orders_required)
  const nextMilestone = sortedMilestones.find(m => m.orders_required > orderCount)
  const progressPct = getProgressPct(orderCount, milestones)

  return (
    <div className="min-h-full">
      <div className="pt-6 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between px-4">
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          {user && (
            <div className="text-right">
              <p className="font-semibold text-sm text-gray-800">{user.name}</p>
              <p className="text-xs text-green-600 font-bold mt-0.5">{displayPoints.toLocaleString()} pts</p>
            </div>
          )}
        </div>

        {/* Lifetime Milestones */}
        <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Top banner */}
          <div className="bg-[#1a4731] px-5 pt-4 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-3">
              Lifetime Progress
            </p>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-4xl font-black text-white leading-none">{orderCount}</p>
                <p className="text-sm text-green-300 mt-1">đơn hàng đã đặt</p>
              </div>
              {nextMilestone ? (
                <div className="text-right">
                  <p className="text-xs text-green-400">Mục tiêu tiếp theo</p>
                  <p className="text-lg font-black text-white">{nextMilestone.orders_required} đơn</p>
                  <p className="text-xs text-green-300">
                    còn {nextMilestone.orders_required - orderCount} đơn nữa
                  </p>
                </div>
              ) : milestones.length > 0 ? (
                <div className="text-right">
                  <p className="text-2xl">🏆</p>
                  <p className="text-xs text-green-300 mt-1">Hoàn thành!</p>
                </div>
              ) : null}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-green-900 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextMilestone && (
              <div className="flex justify-between mt-1.5">
                <p className="text-[10px] text-green-500">{orderCount} đơn</p>
                <p className="text-[10px] text-green-500">{nextMilestone.orders_required} đơn</p>
              </div>
            )}
          </div>

          {/* Milestone nodes */}
          {milestones.length > 0 && (
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-start relative">
                {/* Connector */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-100 z-0">
                  <div
                    className="h-full bg-green-400 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {milestones.map((m) => (
                  <MilestoneNode
                    key={m.id}
                    milestone={m}
                    userMilestone={userMilestones.find((um) => um.milestone_id === m.id)}
                    totalOrders={orderCount}
                    onClaim={handleClaim}
                    claiming={claiming}
                  />
                ))}
              </div>
            </div>
          )}

          {milestones.length === 0 && (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-gray-400">Milestones coming soon</p>
            </div>
          )}
        </div>

        {/* Menu Group 1 */}
        <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          {MENU_ITEMS_1.map((item, i) => {
            const subtitle =
              item.subtitleKey === 'vouchers'
                ? `${voucherCount} available vouchers`
                : item.subtitle

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left ${
                  i < MENU_ITEMS_1.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-800">{item.label}</p>
                  {subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )
          })}
        </div>

        {/* Menu Group 2 */}
        <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => navigate('/help')}
            className="w-full flex items-center gap-3 px-4 py-4 text-left border-b border-gray-100"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
              </svg>
            </div>
            <p className="flex-1 text-[14px] font-semibold text-gray-800">Help & Eco-FAQ</p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout()
                navigate('/login', { replace: true })
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-4 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <p className="flex-1 text-[14px] font-semibold text-red-500">Log Out</p>
          </button>
        </div>
      </div>
    </div>
  )
}
