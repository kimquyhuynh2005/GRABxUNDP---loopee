import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
}

const FILTERS = ['All', 'Eco Partner', 'Near Me', 'Top Rated', 'Fast Delivery']
const ECO_IMAGES = [
  'https://images.unsplash.com/photo-1562802378-063ec186a863?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
]

const RECENT = ['Phở cuốn', 'Bún riêu', 'Cơm tấm']

export default function Search() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [results, setResults] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setLoading(false); return }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        let q = supabase
          .from('restaurants')
          .select('*')
          .ilike('name', `%${query}%`)

        if (activeFilter === 'Eco Partner') q = q.eq('is_eco_partner', true)
        if (activeFilter === 'Top Rated') q = q.gte('rating', 4.7)
        if (activeFilter === 'Fast Delivery') q = q.lte('delivery_time_min', 25)
        if (activeFilter === 'Near Me') q = q.lte('distance_km', 2)

        const { data } = await q.limit(20)
        setResults(data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query, activeFilter])

  return (
    <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-[#f0f7ee] px-4 pt-12 pb-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm gap-2 border border-green-300">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400"
              placeholder="Search restaurants..."
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-500 shadow-sm'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* No query: show recent */}
        {!query && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Searches</p>
            <div className="space-y-2">
              {RECENT.map(r => (
                <button
                  key={r}
                  onClick={() => setQuery(r)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm text-left"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-sm text-gray-600">{r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && query && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              {results.length} result{results.length > 1 ? 's' : ''}
            </p>
            {results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => navigate(`/restaurant/${r.id}`)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={r.image_url ?? ECO_IMAGES[i % ECO_IMAGES.length]}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = ECO_IMAGES[i % ECO_IMAGES.length] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.distance_km} km · {r.delivery_time_min}-{r.delivery_time_min + 5} min</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs text-gray-500">{r.rating} ({r.rating_count})</span>
                    {r.is_eco_partner && (
                      <span className="text-[10px] bg-green-50 text-green-600 font-semibold px-1.5 py-0.5 rounded-full ml-1">🌿 Eco</span>
                    )}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-500">No restaurants found for</p>
            <p className="text-gray-400 mt-1">"{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
