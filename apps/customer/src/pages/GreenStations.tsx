import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Station {
  id: string
  name: string
  address: string
  district: string
  lat: number
  lng: number
  capacity: number
  current_load: number
  status: string
}

interface PickupPoint {
  id: number
  name: string
  address: string
  district: string
  boxes: number
  status: 'pending' | 'in-progress' | 'collected'
  distance: string
  eta: string
}

const PICKUP_POINTS: PickupPoint[] = [
  { id: 1, name: 'Văn phòng Lê Thánh Tôn', address: '23 Lê Thánh Tôn', district: 'Quận 1', boxes: 4, status: 'in-progress', distance: '0.3 km', eta: '5 phút' },
  { id: 2, name: 'Toà nhà Bitexco', address: '2 Hải Triều', district: 'Quận 1', boxes: 7, status: 'pending', distance: '0.7 km', eta: '12 phút' },
  { id: 3, name: 'Poki Bowl – Nguyễn Huệ', address: '1 Nguyễn Huệ', district: 'Quận 1', boxes: 5, status: 'pending', distance: '0.5 km', eta: '8 phút' },
  { id: 4, name: 'Vinhomes Central Park', address: '208 Nguyễn Hữu Cảnh', district: 'Bình Thạnh', boxes: 2, status: 'collected', distance: '1.4 km', eta: '—' },
  { id: 5, name: 'GreenOffice Tower', address: '45 Đinh Tiên Hoàng', district: 'Quận 1', boxes: 3, status: 'pending', distance: '1.1 km', eta: '15 phút' },
  { id: 6, name: 'Landmark 81', address: '720A Điện Biên Phủ', district: 'Bình Thạnh', boxes: 9, status: 'pending', distance: '2.0 km', eta: '20 phút' },
  { id: 7, name: 'Saigon Centre', address: '65 Lê Lợi', district: 'Quận 1', boxes: 6, status: 'collected', distance: '0.9 km', eta: '—' },
]

const STATUS_ORDER: Record<PickupPoint['status'], number> = {
  collected: 0,
  'in-progress': 1,
  pending: 2,
}

const STATUS_CONFIG = {
  pending: { label: 'Chờ thu', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'in-progress': { label: 'Đang đến', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  collected: { label: 'Đã thu', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

function DirectionsMap() {
  return (
    <div className="overflow-hidden border-y border-green-200 shadow-sm" style={{ height: 280 }}>
      <iframe
        src="https://maps.google.com/maps?f=d&source=embed&saddr=Chợ+Bến+Thành,+Quận+1,+Hồ+Chí+Minh&daddr=23+Lê+Thánh+Tôn,+Bến+Nghé,+Quận+1,+Hồ+Chí+Minh&hl=vi&ie=UTF8&t=m&z=15&output=embed"
        width="100%"
        height="280"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Chỉ đường tới trạm"
      />
    </div>
  )
}

function PickupCard({ point }: { point: PickupPoint }) {
  const cfg = STATUS_CONFIG[point.status]
  const isCollected = point.status === 'collected'

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 ${isCollected ? 'opacity-60' : ''}`}>
      {/* Index dot + line */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCollected ? 'bg-green-50' : 'bg-green-600'}`}>
          {isCollected ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-bold text-[13.5px] leading-snug ${isCollected ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {point.name}
          </p>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-0.5">{point.address}, {point.district}</p>

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            </svg>
            {point.distance}
          </span>
          {!isCollected && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {point.eta}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 ml-auto">
            <span className="text-[15px] leading-none">🌿</span>
            {point.boxes} box
          </span>
        </div>
      </div>
    </div>
  )
}

export default function GreenStations() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('green_stations')
      .select('*')
      .order('current_load', { ascending: true })
      .then(({ data }) => {
        setStations(data ?? [])
        setLoading(false)
      })
  }, [])

  const nearbyCount = stations.filter(s => s.status !== 'full').length

  const totalBoxes = PICKUP_POINTS.reduce((s, p) => s + p.boxes, 0)
  const collectedBoxes = PICKUP_POINTS.filter(p => p.status === 'collected').reduce((s, p) => s + p.boxes, 0)
  const remainingPoints = PICKUP_POINTS.filter(p => p.status !== 'collected').length
  const capacity = 20

  return (
    <div className="min-h-full">
      <div className="pt-6 pb-4">
        {/* Header */}
        <div className="flex items-end justify-between px-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Driver</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tuyến thu hồi eco box</p>
          </div>
          {!loading && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">
              {nearbyCount} trạm trống
            </span>
          )}
        </div>

        <DirectionsMap />

        {/* Status bar */}
        <div className="px-4 mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Tổng đơn', value: totalBoxes, unit: 'box', color: 'text-gray-900' },
            { label: 'Đã thu', value: collectedBoxes, unit: 'box', color: 'text-green-600' },
            { label: 'Còn lại', value: remainingPoints, unit: 'điểm', color: 'text-amber-600' },
            { label: 'Công suất', value: `${collectedBoxes}/${capacity}`, unit: '', color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl px-2.5 py-3 shadow-sm flex flex-col items-center text-center">
              <span className={`text-[17px] font-bold leading-none ${stat.color}`}>{stat.value}</span>
              {stat.unit && <span className="text-[10px] text-gray-400 mt-0.5 font-medium">{stat.unit}</span>}
              <span className="text-[9.5px] text-gray-400 mt-1 leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Pickup list */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Điểm thu hồi</p>
            <span className="text-xs text-gray-400">{PICKUP_POINTS.length} địa điểm</span>
          </div>

          <div
            className="space-y-2.5 overflow-y-auto pr-0.5"
            style={{ maxHeight: 340 }}
          >
            {[...PICKUP_POINTS].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]).map((point) => (
              <PickupCard key={point.id} point={point} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
