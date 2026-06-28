import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'

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

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  is_available: boolean
}

const FOOD_IMGS: Record<string, string> = {
  'Phở Cuốn': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
  'Khai Vị': 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=200&h=200&fit=crop',
  'Bún Riêu': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
  'Cơm Tấm': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop',
  default: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=200&h=200&fit=crop',
}

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=500&fit=crop',
]

function fmt(price: number) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function QtyControl({ qty, onMinus, onPlus }: { qty: number; onMinus: () => void; onPlus: () => void }) {
  if (qty === 0) {
    return (
      <button
        onClick={onPlus}
        className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-md active:scale-95 transition-transform"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onMinus}
        className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span className="text-sm font-bold text-gray-900 w-4 text-center">{qty}</span>
      <button
        onClick={onPlus}
        className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem, updateQty, items, totalItems, totalPrice, restaurantName } = useCart()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('restaurants').select('*').eq('id', id).single(),
      supabase.from('menu_items').select('*').eq('restaurant_id', id).eq('is_available', true).order('category'),
    ]).then(([{ data: r }, { data: m }]) => {
      if (r) setRestaurant(r)
      setMenuItems(m ?? [])
      setLoading(false)
    })
  }, [id])

  const getQty = (menuItemId: string) =>
    items.find(i => i.menuItemId === menuItemId)?.quantity ?? 0

  const categories = [...new Set(menuItems.map(m => m.category))]

  const heroImg = restaurant?.image_url ??
    HERO_IMGS[Math.abs((id ?? '').charCodeAt(0) - 50) % HERO_IMGS.length]

  return (
    <div className="min-h-svh bg-white max-w-[390px] mx-auto shadow-2xl">
      {/* Hero */}
      <div className="relative h-[220px]">
        <img src={heroImg} alt={restaurant?.name ?? ''} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-4 pt-4 pb-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        ) : restaurant ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
              <span>⭐ {restaurant.rating} ({restaurant.rating_count} reviews)</span>
              <span className="text-gray-300">·</span>
              <span>🕐 {restaurant.delivery_time_min}–{restaurant.delivery_time_min + 5} min</span>
              <span className="text-gray-300">·</span>
              <span>📍 {restaurant.distance_km} km</span>
            </div>
            {restaurant.is_eco_partner && (
              <span className="inline-flex items-center gap-1 mt-2 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">
                🌿 Eco Partner
              </span>
            )}
          </>
        ) : null}
        <div className="border-t border-gray-100 mt-3" />
      </div>

      {/* Menu */}
      <div className="px-4 pb-32">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>Menu coming soon</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{cat}</p>
              <div className="space-y-3">
                {menuItems.filter(m => m.category === cat).map(item => {
                  const qty = getQty(item.id)
                  const imgSrc = item.image_url ?? FOOD_IMGS[item.category] ?? FOOD_IMGS.default
                  return (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = FOOD_IMGS.default }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-sm text-gray-900">{fmt(item.price)}</span>
                          <QtyControl
                            qty={qty}
                            onMinus={() => updateQty(item.id, qty - 1)}
                            onPlus={() => addItem({
                              menuItemId: item.id,
                              name: item.name,
                              price: item.price,
                              restaurantId: id ?? '',
                              restaurantName: restaurant?.name ?? '',
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky View Cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-6 pt-3 z-50 pointer-events-none">
          <button
            onClick={() => navigate('/cart')}
            className="pointer-events-auto w-full bg-green-600 text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-2xl active:scale-[0.98] transition-transform"
          >
            <span className="bg-green-500 rounded-xl w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
              {totalItems}
            </span>
            <span className="font-semibold text-[15px]">View Cart</span>
            <span className="font-bold text-[15px]">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </button>
        </div>
      )}
    </div>
  )
}
