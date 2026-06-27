import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

interface Member { id: string; nickname: string; joined_at: string }
interface Group { id: string; invite_code: string; expires_at: string; status: string }

export default function GroupWaitingRoom() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [locking, setLocking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!id) return
    // Fetch group + members
    supabase.from('group_orders').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setGroup(data) })
    supabase.from('group_order_members').select('*').eq('group_order_id', id).order('joined_at')
      .then(({ data }) => setMembers(data ?? []))

    // Realtime: new members joining
    const channel = supabase.channel(`group-${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'group_order_members',
        filter: `group_order_id=eq.${id}`,
      }, payload => {
        setMembers(prev => [...prev, payload.new as Member])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  // Countdown timer
  useEffect(() => {
    if (!group?.expires_at) return
    const tick = () => {
      const left = new Date(group.expires_at).getTime() - Date.now()
      if (left <= 0) { setTimeLeft('Expired'); return }
      const m = Math.floor(left / 60000)
      const s = Math.floor((left % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [group])

  const copyLink = () => {
    const link = `loopee.app/join/${group?.invite_code}`
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const lockAndOrder = async () => {
    if (!id || !group) return
    setLocking(true)
    try {
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const orderCode = `GL-${date}-${Math.floor(1000 + Math.random() * 9000)}`
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const { data: order } = await supabase.from('orders').insert({
        order_code: orderCode, user_id: DEMO_USER_ID, status: 'preparing',
        eco_box_count: 2, return_deadline: deadline, reward_pct: 100,
      }).select().single()

      if (order) {
        await supabase.from('group_orders').update({ status: 'placed' }).eq('id', id)
        await supabase.from('return_tokens').insert({
          order_id: order.id, user_id: DEMO_USER_ID,
          token_code: 'LOOP-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        })
        navigate(`/order-success/${order.id}`)
      }
    } finally { setLocking(false) }
  }

  const canLock = members.length >= 2
  const inviteUrl = `loopee.app/join/${group?.invite_code ?? ''}`

  return (
    <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Group Order</h1>
          {timeLeft && <p className="text-xs text-orange-500 font-medium">Locks in {timeLeft}</p>}
        </div>
      </div>

      <div className="px-4 pt-4 pb-32 space-y-4">
        {/* Invite code */}
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Share Invite Code</p>
          <p className="font-mono text-5xl font-black text-gray-900 tracking-widest mb-4">
            {group?.invite_code ?? '------'}
          </p>

          {group && (
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl">
                <QRCodeSVG value={inviteUrl} size={140} fgColor="#1a4731" />
              </div>
            </div>
          )}

          <button
            onClick={copyLink}
            className="w-full bg-green-50 text-green-700 font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? 'Copied!' : 'Copy invite link'}
          </button>
        </div>

        {/* Members list */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Members ({members.length})
          </p>
          {members.length === 0 ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Waiting for members...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                    {(m.nickname ?? 'G').charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {m.nickname ?? `Guest ${i + 1}`}
                    {i === 0 && <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Leader</span>}
                  </p>
                  <span className="ml-auto text-xs text-green-500 font-semibold">Ready ✓</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!canLock && (
          <p className="text-center text-xs text-gray-400">Waiting for at least 1 more member to join</p>
        )}
      </div>

      {/* Lock button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 px-4 py-4 z-50">
        <button
          onClick={lockAndOrder}
          disabled={!canLock || locking}
          className="w-full bg-green-600 text-white font-bold text-lg rounded-2xl py-4 disabled:opacity-50"
        >
          {locking ? 'Placing...' : `🔒 Lock & Place Order (${members.length} members)`}
        </button>
      </div>
    </div>
  )
}
