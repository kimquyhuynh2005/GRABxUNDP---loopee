import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface OrderData {
  order_code: string
  restaurant_name: string
  eco_box_count: number
  return_deadline: string | null
  delivery_time_min?: number
}

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('orders')
      .select('order_code, restaurant_name, eco_box_count, return_deadline')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data)
        setTimeout(() => setShow(true), 100)
      })
  }, [id])

  const formatDeadline = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-green-50 to-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl flex flex-col items-center justify-center px-6 pb-12">
      {/* Checkmark animation */}
      <div className={`transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center shadow-xl mb-6">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <div className={`text-center transition-all duration-500 delay-200 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Order Placed! 🎉</h1>

        {order ? (
          <>
            <p className="font-mono text-sm text-gray-400 tracking-wider mb-1">{order.order_code}</p>
            <p className="text-gray-600 mb-1">{order.restaurant_name}</p>
            <p className="text-sm text-gray-400 mb-6">Estimated delivery: 25–35 min</p>

            {order.eco_box_count > 0 && order.return_deadline && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Return your eco boxes by</p>
                    <p className="font-bold text-green-700 text-lg">{formatDeadline(order.return_deadline)}</p>
                    <p className="text-xs text-green-600 mt-1">to earn 100 reward points</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mx-auto mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32 mx-auto" />
          </div>
        )}

        <button
          onClick={() => navigate('/orders')}
          className="w-full bg-green-600 text-white font-bold rounded-2xl py-4 text-lg mb-3"
        >
          Track Order
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full text-gray-500 text-sm font-medium py-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
