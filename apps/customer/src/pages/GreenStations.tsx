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

function MapSVG() {
  return (
    <div className="relative mx-4 rounded-2xl overflow-hidden border border-green-200" style={{ height: 180 }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 390 180"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background */}
        <rect width="390" height="180" fill="#e8f5e9" />

        {/* Street grid — horizontal */}
        <line x1="0" y1="55" x2="390" y2="55" stroke="white" strokeWidth="10" opacity="0.7" />
        <line x1="0" y1="120" x2="390" y2="120" stroke="white" strokeWidth="10" opacity="0.7" />

        {/* Street grid — vertical */}
        <line x1="90" y1="0" x2="90" y2="180" stroke="white" strokeWidth="10" opacity="0.7" />
        <line x1="190" y1="0" x2="190" y2="180" stroke="white" strokeWidth="10" opacity="0.7" />
        <line x1="290" y1="0" x2="290" y2="180" stroke="white" strokeWidth="10" opacity="0.7" />

        {/* Block fills */}
        <rect x="95" y="60" width="90" height="55" rx="6" fill="#c8e6c9" opacity="0.5" />
        <rect x="195" y="60" width="90" height="55" rx="6" fill="#c8e6c9" opacity="0.5" />
        <rect x="95" y="125" width="90" height="50" rx="6" fill="#c8e6c9" opacity="0.3" />
        <rect x="195" y="125" width="90" height="50" rx="6" fill="#c8e6c9" opacity="0.3" />

        {/* Pin: Poki Bowl – Available (green) */}
        <circle cx="140" cy="80" r="14" fill="#16a34a" />
        <circle cx="140" cy="80" r="6" fill="white" />
        <line x1="140" y1="94" x2="140" y2="104" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />

        {/* Pin: Second available (green) */}
        <circle cx="240" cy="42" r="12" fill="#16a34a" />
        <circle cx="240" cy="42" r="5" fill="white" />
        <line x1="240" y1="54" x2="240" y2="62" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />

        {/* Pin: GS25 – Full (orange) */}
        <circle cx="230" cy="142" r="14" fill="#f97316" />
        <circle cx="230" cy="142" r="6" fill="white" />
        <line x1="230" y1="156" x2="230" y2="166" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* Filter pills overlay */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-green-700">Available</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-500">Full</span>
        </div>
      </div>
    </div>
  )
}

function StationCard({ station }: { station: Station }) {
  const isFull = station.status === 'full'
  const loadPct = Math.round((station.current_load / station.capacity) * 100)

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 ${isFull ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-bold text-[14px] leading-tight ${isFull ? 'text-gray-400' : 'text-gray-900'}`}>
              {station.name} – {station.district}
            </p>
            <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
              {station.district === 'Quận 1' ? '0.3' : '0.8'} km
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{station.address}, {station.district}</p>

          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={isFull ? 'text-gray-400' : 'text-gray-500'}>
                Soil load: {station.current_load}/{station.capacity}
              </span>
              {isFull && (
                <span className="text-orange-400 text-[11px] font-medium">
                  Soil full — Station 350m away
                </span>
              )}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-gray-300' : 'bg-green-500'}`}
                style={{ width: `${loadPct}%` }}
              />
            </div>
          </div>
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

  return (
    <div className="min-h-full">
      <div className="pt-6 pb-4">
        <div className="flex items-end justify-between px-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Stations</h1>
            <p className="text-sm text-gray-400 mt-0.5">Drop off your eco boxes</p>
          </div>
          {!loading && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">
              {nearbyCount} available
            </span>
          )}
        </div>

        <MapSVG />

        <div className="px-4 mt-4 space-y-3">
          {loading ? (
            <>
              <div className="bg-white rounded-2xl h-24 animate-pulse" />
              <div className="bg-white rounded-2xl h-24 animate-pulse" />
            </>
          ) : stations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📍</p>
              <p className="font-medium text-gray-500">No stations found</p>
            </div>
          ) : (
            stations.map((s) => <StationCard key={s.id} station={s} />)
          )}
        </div>
      </div>
    </div>
  )
}
