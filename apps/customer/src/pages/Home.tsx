import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../contexts/UserContext'

interface Restaurant {
  id: string
  name: string
  address: string
  distance_km: number
  rating: number
  rating_count: number
  delivery_time_min: number
  image_url: string | null
  is_eco_partner: boolean
  is_editors_pick: boolean
}

const PLACEHOLDER_CATEGORIES = [
  { id: 0, name: 'Noodle', imgUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=120&h=120&fit=crop&crop=center' },
  { id: 1, name: 'Rice', imgUrl: 'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=120&h=120&fit=crop&crop=center' },
  { id: 2, name: 'Traditional Cake', imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop&crop=center' },
  { id: 3, name: 'Fast Food', imgUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop&crop=center' },
  { id: 4, name: 'Global Flavors', imgUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=120&h=120&fit=crop&crop=center' },
]

const ECO_IMAGES = [
  'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=220&fit=crop',
]

function RestaurantCard({ r, imgIndex }: { r: Restaurant; imgIndex: number }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/restaurant/${r.id}`)}
      className="min-w-[165px] bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-sm active:scale-[0.97] transition-transform cursor-pointer"
    >
      <div className="h-[105px] overflow-hidden">
        <img
          src={r.image_url ?? ECO_IMAGES[imgIndex % ECO_IMAGES.length]}
          alt={r.name}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = ECO_IMAGES[imgIndex % ECO_IMAGES.length] }}
        />
      </div>
      <div className="p-2.5">
        <p className="font-semibold text-[13px] text-gray-900 leading-tight line-clamp-1">{r.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{r.distance_km}km</p>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
          <span className="text-yellow-400">★</span>
          <span>{r.rating}</span>
          <span className="text-gray-300">({r.rating_count})</span>
          <span className="mx-0.5 text-gray-300">·</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{r.delivery_time_min}–{r.delivery_time_min + 5} min</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const user = useUser()
  const [ecoRestaurants, setEcoRestaurants] = useState<Restaurant[]>([])
  const [editorsPick, setEditorsPick] = useState<Restaurant[]>([])

  useEffect(() => {
    supabase.from('restaurants').select('*').eq('is_eco_partner', true)
      .then(({ data }) => setEcoRestaurants(data ?? []))
    supabase.from('restaurants').select('*').eq('is_editors_pick', true)
      .then(({ data }) => setEditorsPick(data ?? []))
  }, [])

  return (
    <div className="bg-[#f0f7ee] min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f0f7ee] px-4 pt-12 pb-3">
        {/* Greeting row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Good day,</p>
            <p className="text-[17px] font-bold text-gray-900 leading-tight">{user?.name?.split(' ').at(-1) ?? 'there'} 👋</p>
          </div>
          <button className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Search bar — tap to navigate to /search */}
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm gap-2.5 text-left border border-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="flex-1 text-sm text-gray-400">What do you want to eat?</span>
          <div className="w-7 h-7 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </button>
      </div>

      <div className="px-4 space-y-5 pb-4">
        {/* Eco Impact Card */}
        <div className="bg-[#1a4731] rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-1">This Month</p>
            <p className="font-bold text-white text-[16px] leading-snug">
              You've reduced{' '}
              <span className="text-green-300">{user?.plastic_reduction_pct ?? 85}%</span>{' '}
              of plastic waste!
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                <span>🌿</span>
                <span>{user?.co2_offset_kg ?? 4.2} kg CO₂</span>
              </span>
              <span className="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                {user?.points ?? 480} pts
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="text-5xl">🌳</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex overflow-x-auto gap-4 pb-1 scrollbar-hide -mx-4 px-4">
            {PLACEHOLDER_CATEGORIES.map(c => (
              <div key={c.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden shadow-sm bg-white border-2 border-white">
                  <img src={c.imgUrl} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eco Restaurants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-900 text-[15px]">Eco restaurant near you</p>
            <button onClick={() => navigate('/search')} className="text-green-600 text-xs font-medium">view all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {ecoRestaurants.length === 0
              ? [1, 2, 3].map(i => <div key={i} className="min-w-[165px] h-[180px] bg-white rounded-2xl animate-pulse flex-shrink-0" />)
              : ecoRestaurants.map((r, i) => <RestaurantCard key={r.id} r={r} imgIndex={i} />)}
          </div>
        </div>

        {/* Editor's Pick */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-900 text-[15px]">Editor's Pick</p>
            <button onClick={() => navigate('/search')} className="text-green-600 text-xs font-medium">view all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {editorsPick.length === 0
              ? [1, 2].map(i => <div key={i} className="min-w-[165px] h-[180px] bg-white rounded-2xl animate-pulse flex-shrink-0" />)
              : editorsPick.map((r, i) => <RestaurantCard key={r.id} r={r} imgIndex={i + 3} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
