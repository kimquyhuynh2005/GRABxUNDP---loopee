import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, DEMO_USER_ID } from '../lib/supabase'
import { useUser } from '../contexts/UserContext'

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

  if (claimed) {
    return (
      <div className="flex flex-col items-center gap-1.5 flex-1">
        <div className="w-14 h-14 rounded-full bg-green-800 flex items-center justify-center shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-xs font-bold text-gray-700 mt-0.5">{milestone.orders_required} Orders</p>
        <p className="text-[11px] text-green-600 font-semibold">+{milestone.points_reward} pts</p>
      </div>
    )
  }

  if (reached) {
    return (
      <div className="flex flex-col items-center gap-1.5 flex-1">
        <button
          onClick={() => onClaim(milestone.id, milestone.points_reward)}
          disabled={isThisClaiming}
          className="w-14 h-14 rounded-full border-2 border-green-500 bg-white flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {isThisClaiming ? (
            <div className="w-5 h-5 border-2 border-green-400 border-t-green-600 rounded-full animate-spin" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
              <path d="M17 8C8 10 5.9 16.17 3.82 19c0 0 2.73-.8 5.18-3.21A9 9 0 0 0 17 8z" />
              <line x1="3.82" y1="19" x2="12" y2="11" />
            </svg>
          )}
        </button>
        <p className="text-xs font-bold text-gray-700 mt-0.5">{milestone.orders_required} Orders</p>
        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">
          Tap to Claim
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p className="text-xs font-medium text-gray-400 mt-0.5">{milestone.orders_required} Orders</p>
      <p className="text-[11px] text-gray-300">+{milestone.points_reward} pts</p>
    </div>
  )
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
  const navigate = useNavigate()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [userMilestones, setUserMilestones] = useState<UserMilestone[]>([])
  const [voucherCount, setVoucherCount] = useState(0)
  const [claiming, setClaiming] = useState<number | null>(null)
  const [localPoints, setLocalPoints] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('milestones')
      .select('*')
      .order('orders_required')
      .then(({ data }) => setMilestones(data ?? []))

    supabase
      .from('user_milestones')
      .select('milestone_id, is_claimed')
      .eq('user_id', DEMO_USER_ID)
      .then(({ data }) => setUserMilestones(data ?? []))

    supabase
      .from('user_vouchers')
      .select('id', { count: 'exact' })
      .eq('user_id', DEMO_USER_ID)
      .eq('is_used', false)
      .then(({ count }) => setVoucherCount(count ?? 0))
  }, [])

  async function handleClaim(milestoneId: number, pts: number) {
    setClaiming(milestoneId)
    try {
      await supabase
        .from('user_milestones')
        .update({ is_claimed: true, claimed_at: new Date().toISOString() })
        .eq('user_id', DEMO_USER_ID)
        .eq('milestone_id', milestoneId)

      const newPoints = (user?.points ?? 0) + pts
      await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', DEMO_USER_ID)

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
        <div className="mx-4 bg-white rounded-2xl shadow-sm px-5 pt-4 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">
            Lifetime Milestones
          </p>

          <div className="flex items-start relative">
            {/* Connector line at circle centers */}
            <div className="absolute top-7 left-7 right-7 h-0.5 bg-gray-200 z-0" />
            {milestones.map((m) => (
              <MilestoneNode
                key={m.id}
                milestone={m}
                userMilestone={userMilestones.find((um) => um.milestone_id === m.id)}
                totalOrders={user?.total_orders ?? 0}
                onClaim={handleClaim}
                claiming={claiming}
              />
            ))}
          </div>
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
                supabase.auth.signOut()
                navigate('/')
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
