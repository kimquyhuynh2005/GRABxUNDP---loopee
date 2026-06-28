import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

interface PopupState {
  visible: boolean
  points: number
  pct: number
}

export default function RewardPopup() {
  const navigate = useNavigate()
  const [state, setState] = useState<PopupState>({ visible: false, points: 0, pct: 100 })

  useEffect(() => {
    const channel = supabase
      .channel('reward-popup')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'return_tokens', filter: `user_id=eq.${DEMO_USER_ID}` },
        (payload) => {
          const n = payload.new as Record<string, unknown>
          const o = payload.old as Record<string, unknown>
          if (n.is_used && !o.is_used) {
            setState({ visible: true, points: (n.points_earned as number) ?? 50, pct: 100 })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (!state.visible) return null

  const dismiss = () => setState(s => ({ ...s, visible: false }))

  const message =
    state.pct === 100
      ? 'Perfect! You returned on time 🎯'
      : state.pct > 0
      ? `A bit late, but still earned ${state.pct}% ⏰`
      : 'No points this time — try to return earlier next time'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[200]" onClick={dismiss}>
      <div
        className="bg-white rounded-t-3xl p-6 w-full max-w-[390px] pb-10 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Leaf icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce-once">
            <span className="text-5xl">🌿</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Box Returned!</h2>
        <p className="text-4xl font-bold text-green-600 text-center mb-2">+{state.points} Points</p>
        <p className="text-sm text-gray-500 text-center mb-5">{message}</p>

        {/* Progress bar */}
        <div className="bg-gray-100 rounded-full h-2 mb-1">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }} />
        </div>
        <p className="text-xs text-gray-400 text-center mb-6">1,240 / 2,000 pts to Gold</p>

        <button
          onClick={() => { dismiss(); navigate('/rewards') }}
          className="w-full bg-green-600 text-white font-semibold rounded-2xl py-4 mb-3"
        >
          View My Rewards
        </button>
        <button onClick={dismiss} className="w-full text-gray-400 text-sm">Close</button>
      </div>
    </div>
  )
}
