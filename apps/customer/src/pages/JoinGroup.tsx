import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'

export default function JoinGroup() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const user = useUser()
  const inputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState(params.get('code') ?? '')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!code) inputRef.current?.focus()
    else if (code.length === 6) handleJoin(code)
  }, [])

  const handleJoin = async (c = code) => {
    if (c.length !== 6 || joining) return
    setJoining(true)
    try {
      const { data: group } = await supabase
        .from('group_orders').select('*')
        .eq('invite_code', c.toUpperCase()).eq('status', 'open').single()

      if (!group) { showToast('Invalid or expired code', 'error'); return }

      await supabase.from('group_order_members').insert({
        group_order_id: group.id, user_id: user?.id ?? '',
        nickname: user?.name ?? 'Guest',
      })
      navigate(`/group/${group.id}`)
    } catch {
      showToast('Connection error, please retry', 'error')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl">
      <div className="bg-white px-4 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Join Group Order</h1>
      </div>

      <div className="px-4 pt-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">🔗</p>
          <p className="font-semibold text-gray-700 mb-5">Enter the 6-digit invite code from your friend</p>

          <input
            ref={inputRef}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-center font-mono text-3xl font-black tracking-widest outline-none focus:border-green-400 mb-4"
            placeholder="ABC123"
            maxLength={6}
          />

          <button
            onClick={() => handleJoin()}
            disabled={code.length !== 6 || joining}
            className="w-full bg-green-600 text-white font-bold rounded-2xl py-4 text-lg disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join Group'}
          </button>
        </div>
      </div>
    </div>
  )
}
