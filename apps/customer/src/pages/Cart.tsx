import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, DEMO_USER_ID } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'

type OrderType = 'solo' | 'group' | 'join'

const DELIVERY_FEE = 25000
const ECO_DEPOSIT = 10000

function fmt(n: number) { return n.toLocaleString('vi-VN') + 'đ' }

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function Minus({ color = '#374151' }: { color?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function Plus({ color = 'white' }: { color?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQty, clearCart, totalPrice, restaurantId, restaurantName } = useCart()
  const { showToast } = useToast()
  const user = useUser()

  const [orderType, setOrderType] = useState<OrderType>('solo')
  const [useEco, setUseEco] = useState(true)
  const [ecoCount, setEcoCount] = useState(Math.max(1, items.length))
  const [placing, setPlacing] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [promoCode, setPromoCode] = useState('')

  const ecoDeposit = useEco ? ecoCount * ECO_DEPOSIT : 0
  const total = totalPrice + DELIVERY_FEE + ecoDeposit
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  const placeOrder = async () => {
    if (items.length === 0 || placing) return

    if (orderType === 'group') {
      try {
        const { data: group } = await supabase
          .from('group_orders')
          .insert({ leader_id: DEMO_USER_ID, restaurant_id: restaurantId, status: 'open' })
          .select().single()
        if (!group) throw new Error()
        await supabase.from('group_order_members').insert({
          group_order_id: group.id, user_id: DEMO_USER_ID, nickname: user?.name ?? 'You',
        })
        navigate(`/group/${group.id}`)
      } catch {
        showToast('Failed to create group order', 'error')
      }
      return
    }

    if (orderType === 'join') {
      navigate('/group/join')
      return
    }

    setPlacing(true)
    try {
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const rand = Math.floor(1000 + Math.random() * 9000)
      const orderCode = `GL-${date}-${rand}`
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          user_id: DEMO_USER_ID,
          restaurant_id: restaurantId,
          restaurant_name: restaurantName,
          status: 'preparing',
          eco_box_count: useEco ? ecoCount : 0,
          return_deadline: useEco ? deadline : null,
          reward_pct: 100,
        })
        .select().single()

      if (error || !order) throw error ?? new Error('No order returned')

      if (useEco) {
        const token = 'LOOP-' +
          Math.random().toString(36).substr(2, 4).toUpperCase() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        await supabase.from('return_tokens').insert({
          order_id: order.id,
          user_id: DEMO_USER_ID,
          token_code: token,
          is_used: false,
        })
      }

      await supabase
        .from('users')
        .update({ total_orders: (user?.total_orders ?? 0) + 1 })
        .eq('id', DEMO_USER_ID)

      clearCart()
      navigate(`/order-success/${order.id}`)
    } catch {
      showToast('Connection error, please retry', 'error')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl flex flex-col items-center justify-center px-8 pb-12">
        <div className="w-28 h-28 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
          <span className="text-5xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cart is empty</h2>
        <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
          Add dishes from a restaurant to start your eco order
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white font-semibold rounded-2xl px-10 py-4 active:scale-[0.97] transition-transform shadow-md"
        >
          Browse Restaurants
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center active:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-[17px] font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-400 mt-0.5 leading-none">{restaurantName}</p>
          </div>

          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <span className="text-sm font-bold text-green-600">{totalQty}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-40 space-y-3">

        {/* Order type */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm">
          {([
            ['solo', '🧍', 'Solo'],
            ['group', '👥', 'Group'],
            ['join', '🔗', 'Join'],
          ] as [OrderType, string, string][]).map(([type, icon, label]) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${
                orderType === type
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-[15px] leading-none mb-0.5">{icon}</span>
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
        </div>

        {/* Join code input */}
        {orderType === 'join' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter 6-digit invite code</p>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.25em] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                placeholder="ABCD12"
                maxLength={6}
              />
              <button
                onClick={() => joinCode.length === 6 && navigate(`/group/join?code=${joinCode}`)}
                disabled={joinCode.length !== 6}
                className="bg-green-600 text-white rounded-xl px-5 font-semibold text-sm disabled:opacity-40 active:scale-[0.97] transition-transform"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* Cart items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Items</p>
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-green-600 font-bold"
            >
              + Add more
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-1.5 h-14 rounded-full bg-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(item.price)} each</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">{fmt(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus />
                  </button>
                  <span className="text-sm font-bold w-4 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eco box section */}
        <div className={`rounded-2xl shadow-sm transition-colors duration-300 ${useEco ? 'bg-[#1a3d2b]' : 'bg-white'}`}>
          <div className="p-4">
            {/* Row 1: icon + text + toggle */}
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 shrink-0 ${useEco ? 'bg-green-700' : 'bg-green-50'}`}>
                <span className="text-xl">🌿</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${useEco ? 'text-white' : 'text-gray-900'}`}>Use Eco Boxes</p>
                <p className={`text-xs mt-0.5 ${useEco ? 'text-green-300' : 'text-gray-500'}`}>
                  {ecoCount} box{ecoCount > 1 ? 'es' : ''} · Return in 24h → earn points
                </p>
              </div>
              <button
                onClick={() => setUseEco(!useEco)}
                className={`shrink-0 w-12 h-6 rounded-full transition-colors ${useEco ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${useEco ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {useEco && (
              <>
                <div className="border-t border-green-700 my-3" />
                {/* Row 2: box count */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-xs font-medium">Number of boxes</p>
                    <p className="text-green-400 text-xs mt-0.5">{fmt(ECO_DEPOSIT)}/box · fully refunded on return</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setEcoCount(Math.max(1, ecoCount - 1))}
                      className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="text-white font-bold text-base w-4 text-center">{ecoCount}</span>
                    <button
                      onClick={() => setEcoCount(ecoCount + 1)}
                      className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Deliver to</p>
              <p className="text-sm font-semibold text-gray-900">123 Nguyễn Trãi, Quận 1</p>
              <p className="text-xs text-gray-400 mt-0.5">~2.4 km · est. 25–35 min</p>
            </div>
            <button className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg flex-shrink-0 mt-0.5">
              Edit
            </button>
          </div>
        </div>

        {/* Promo code */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3.5" />
            </svg>
            <input
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 outline-none font-medium bg-transparent"
              placeholder="Promo or voucher code"
            />
            {promoCode.length > 0 && (
              <button className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                Apply
              </button>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3.5">Order Summary</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal ({totalQty} item{totalQty !== 1 ? 's' : ''})</span>
              <span className="font-semibold text-gray-700">{fmt(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery fee</span>
              <span className="font-semibold text-gray-700">{fmt(DELIVERY_FEE)}</span>
            </div>
            {useEco && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <span>🌿</span>
                  <span>Eco deposit ({ecoCount}× refundable)</span>
                </span>
                <span className="font-semibold text-green-700">+{fmt(ecoDeposit)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-dashed border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-900 text-[15px]">Total</span>
              <span className="font-bold text-gray-900 text-[18px]">{fmt(total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50">
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-3 pb-7">
          <button
            onClick={placeOrder}
            disabled={placing || (orderType === 'join' && joinCode.length !== 6)}
            className="w-full bg-[#1a4731] text-white font-bold rounded-2xl py-4 px-5 disabled:opacity-50 active:scale-[0.98] transition-transform shadow-xl"
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Placing order...
              </span>
            ) : orderType === 'group' ? (
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>👥</span>
                  <span>Create Group Order</span>
                </span>
                <ChevronRight />
              </span>
            ) : orderType === 'join' ? (
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>🔗</span>
                  <span>Join & Order</span>
                </span>
                <ChevronRight />
              </span>
            ) : (
              <span className="flex items-center justify-between">
                <span className="text-left">
                  <span className="block text-[15px] font-bold">Place Order</span>
                  <span className="block text-[11px] text-green-300 font-medium mt-0.5">🛵 25–35 min · Free eco pickup</span>
                </span>
                <span className="text-[18px] font-bold">{fmt(total)}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
