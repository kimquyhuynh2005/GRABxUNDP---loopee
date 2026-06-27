import { createContext, useContext, useState, useRef } from 'react'

interface ToastItem { id: number; message: string; type: 'error' | 'success' | 'info' }
interface ToastCtx { showToast: (msg: string, type?: ToastItem['type']) => void }

const ToastContext = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const showToast = (message: string, type: ToastItem['type'] = 'error') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const bg = (type: ToastItem['type']) =>
    type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-600' : 'bg-gray-800'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-full max-w-[358px] px-4 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`${bg(t.type)} text-white text-sm font-medium rounded-xl px-4 py-3 shadow-lg`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be within ToastProvider')
  return ctx
}
