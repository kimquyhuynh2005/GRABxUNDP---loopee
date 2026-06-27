import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'

interface TokenData {
  order_code: string
  restaurant_name: string
  eco_box_count: number
  token_code: string
}

export default function ReturnToken() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('orders')
      .select('order_code, restaurant_name, eco_box_count, return_tokens(token_code)')
      .eq('id', id)
      .single()
      .then(({ data: row }) => {
        if (row) {
          const tokens = row.return_tokens as { token_code: string }[]
          setData({
            order_code: row.order_code,
            restaurant_name: row.restaurant_name,
            eco_box_count: row.eco_box_count,
            token_code: tokens?.[0]?.token_code ?? row.order_code,
          })
        }
        setLoading(false)
      })
  }, [id])

  return (
    <div className="min-h-svh bg-white max-w-[390px] mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Personal Return Token</h1>
          {data && (
            <p className="text-sm text-gray-400">{data.order_code} · {data.restaurant_name}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      ) : data ? (
        <div className="px-4 pb-8 flex flex-col items-center gap-6 mt-4">
          {/* QR Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center gap-5 w-full max-w-xs">
            {/* Green dot decoration */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-600 tracking-wide uppercase">Eco Return</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>

            {/* QR Code */}
            <div className="p-4 bg-white rounded-2xl border-2 border-gray-100">
              <QRCodeSVG
                value={data.token_code}
                size={200}
                level="M"
                includeMargin={false}
                fgColor="#1a4731"
              />
            </div>

            {/* Token code text */}
            <div className="text-center">
              <p className="font-mono text-sm font-bold text-gray-700 tracking-widest">{data.token_code}</p>
              <p className="text-xs text-gray-400 mt-1">{data.eco_box_count} eco box{data.eco_box_count > 1 ? 'es' : ''}</p>
            </div>
          </div>

          {/* Instruction */}
          <div className="bg-green-50 rounded-2xl p-4 w-full max-w-xs text-center">
            <p className="text-sm font-medium text-green-800 leading-relaxed">
              Show this code to staff at any{' '}
              <span className="font-bold">Green Station</span>{' '}
              to return your eco boxes
            </p>
          </div>

          {/* Eco info */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-base">🌿</span>
            <span>Returning helps reduce plastic waste in Vietnam</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">❌</p>
          <p className="font-medium text-gray-500">Token not found</p>
        </div>
      )}
    </div>
  )
}
