import { useEffect, useState } from 'react'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

interface Voucher {
  id: string
  title: string
  description: string
  category: string
  discount_type: string
  discount_value: number | null
  min_order_value: number | null
  applicable_to: string
  expires_at: string
  icon_type: string
}

function DineInCard({ v }: { v: Voucher }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start">
      <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 px-2 py-0.5 rounded-full mb-1.5">
          Loopee Dine-In
        </span>
        <p className="font-bold text-gray-900 text-[15px] leading-tight">{v.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{v.applicable_to}</p>
        <p className="text-xs text-gray-400 mt-1">Exp: {v.expires_at}</p>
      </div>
    </div>
  )
}

function EcoPartnerCard({ v }: { v: Voucher }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start">
      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mb-1.5">
          CHTL Eco-Partner
        </span>
        <p className="font-bold text-gray-900 text-[15px] leading-tight">{v.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{v.applicable_to}</p>
        <p className="text-xs text-gray-400 mt-1">Exp: {v.expires_at}</p>
      </div>
      <button className="flex-shrink-0 flex flex-col items-center gap-1 bg-gray-100 rounded-xl p-2.5 ml-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6V4h4" />
          <path d="M4 18v2h4" />
          <path d="M20 6V4h-4" />
          <path d="M20 18v2h-4" />
          <rect x="7" y="7" width="4" height="4" rx="0.5" />
          <rect x="13" y="7" width="4" height="4" rx="0.5" />
          <rect x="7" y="13" width="4" height="4" rx="0.5" />
          <rect x="13" y="13" width="2" height="2" />
          <rect x="15" y="15" width="2" height="2" />
        </svg>
        <span className="text-[10px] text-gray-500 font-semibold">Scan</span>
      </button>
    </div>
  )
}

export default function MyRewards() {
  const [dineIn, setDineIn] = useState<Voucher[]>([])
  const [ecoPartners, setEcoPartners] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('user_vouchers')
      .select('vouchers(*)')
      .eq('user_id', DEMO_USER_ID)
      .eq('is_used', false)
      .then(({ data }) => {
        const vouchers = (data ?? []).map((row: any) => row.vouchers).filter(Boolean)
        setDineIn(vouchers.filter((v: Voucher) => v.category === 'loopee_dine_in'))
        setEcoPartners(vouchers.filter((v: Voucher) => v.category === 'chtl_eco_partner'))
        setLoading(false)
      })
  }, [])

  const total = dineIn.length + ecoPartners.length

  return (
    <div className="min-h-full">
      <div className="pt-6 pb-4">
        {/* Header */}
        <div className="flex items-end justify-between px-4 mb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Rewards</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your vouchers & perks</p>
          </div>
          {!loading && total > 0 && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">
              {total} active
            </span>
          )}
        </div>

        {loading ? (
          <div className="px-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            {dineIn.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-4 mb-3">
                  Loopee Dine-In
                </p>
                <div className="px-4 space-y-3">
                  {dineIn.map((v) => (
                    <DineInCard key={v.id} v={v} />
                  ))}
                </div>
              </div>
            )}

            {ecoPartners.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-4 mb-3">
                  CHTL Eco-Partners
                </p>
                <div className="px-4 space-y-3">
                  {ecoPartners.map((v) => (
                    <EcoPartnerCard key={v.id} v={v} />
                  ))}
                </div>
              </div>
            )}

            {total === 0 && (
              <div className="text-center py-20 text-gray-400 px-4">
                <p className="text-5xl mb-4">🎫</p>
                <p className="font-semibold text-gray-500">No active vouchers</p>
                <p className="text-sm mt-1">Complete orders to earn rewards</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
