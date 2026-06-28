import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/UserContext'

type Tab = 'login' | 'register'

const DEMO_USERS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Nguyễn Minh Khoa', initial: 'K', color: '#16a34a' },
  { id: '22222222-2222-2222-2222-111111111111', name: 'Trần Thị Lan', initial: 'L', color: '#7c3aed' },
  { id: '33333333-3333-3333-3333-111111111111', name: 'Lê Văn Hùng', initial: 'H', color: '#0284c7' },
]

function Logo() {
  return (
    <div className="flex flex-col items-center mb-7">
      <div className="w-16 h-16 rounded-2xl bg-[#1a4731] flex items-center justify-center mb-3 shadow-lg">
        <svg width="36" height="36" viewBox="0 0 42 42" fill="none">
          <path d="M21 7C13 7 7 14 9 23C11 30 17 35 21 35C25 35 31 30 33 23C35 14 29 7 21 7Z" fill="white" opacity="0.92" />
          <line x1="21" y1="35" x2="21" y2="21" stroke="#1a4731" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 26L21 21L28 17" stroke="#1a4731" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Loopee</h1>
      <p className="text-xs text-gray-400 mt-0.5">Eco food delivery · Return. Earn. Repeat.</p>
    </div>
  )
}

function Input({
  label, type, value, onChange, placeholder, required,
}: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-400 transition-colors placeholder:text-gray-300"
      />
    </div>
  )
}

export default function Login() {
  const { loginWithEmail, register, loginAsDemo } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('login')

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Register
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regDone, setRegDone] = useState<'confirmed' | 'check_email' | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const result = await loginWithEmail(loginEmail, loginPass)
    setLoginLoading(false)
    if (result.error) { setLoginError(result.error); return }
    navigate('/', { replace: true })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (!regName.trim()) { setRegError('Vui lòng nhập họ tên'); return }
    if (regPass.length < 6) { setRegError('Mật khẩu tối thiểu 6 ký tự'); return }
    if (regPass !== regConfirm) { setRegError('Mật khẩu xác nhận không khớp'); return }
    setRegLoading(true)
    const result = await register(regName, regEmail, regPass)
    setRegLoading(false)
    if (result.error) { setRegError(result.error); return }
    if (result.needsConfirmation) { setRegDone('check_email'); return }
    setRegDone('confirmed')
    setTimeout(() => navigate('/', { replace: true }), 1200)
  }

  const handleDemo = async (id: string) => {
    await loginAsDemo(id)
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-svh bg-[#f0f7ee] max-w-[390px] mx-auto shadow-2xl overflow-y-auto">
      <div className="px-5 pt-14 pb-10">
        <Logo />

        {/* Tab switcher */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 mb-4 shadow-sm">
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setLoginError(''); setRegError(''); setRegDone(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t ? 'bg-[#1a4731] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        {/* Login form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm p-5 space-y-3.5">
            <Input label="Email" type="email" required value={loginEmail} onChange={setLoginEmail} placeholder="your@email.com" />
            <Input label="Mật khẩu" type="password" required value={loginPass} onChange={setLoginPass} placeholder="••••••••" />

            {loginError && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl px-4 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
                </svg>
                <p className="text-xs text-red-500 font-medium">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#1a4731] text-white font-bold rounded-xl py-3.5 disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {loginLoading
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang đăng nhập...</span>
                : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* Register form */}
        {tab === 'register' && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            {regDone === 'check_email' ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800">Kiểm tra hộp thư!</p>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">Chúng tôi đã gửi email xác nhận tới <span className="font-semibold text-gray-600">{regEmail}</span>. Xác nhận rồi đăng nhập nhé.</p>
                </div>
                <button
                  onClick={() => { setRegDone(null); setTab('login'); setLoginEmail(regEmail) }}
                  className="w-full bg-[#1a4731] text-white font-bold rounded-xl py-3 text-sm active:scale-[0.98] transition-transform"
                >
                  Về đăng nhập
                </button>
              </div>
            ) : regDone === 'confirmed' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-gray-800">Tạo tài khoản thành công!</p>
                <p className="text-sm text-gray-400 mt-1">Đang chuyển hướng...</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <Input label="Họ và tên" type="text" required value={regName} onChange={setRegName} placeholder="Nguyễn Văn A" />
                <Input label="Email" type="email" required value={regEmail} onChange={setRegEmail} placeholder="your@email.com" />
                <Input label="Mật khẩu" type="password" required value={regPass} onChange={setRegPass} placeholder="Tối thiểu 6 ký tự" />
                <Input label="Xác nhận mật khẩu" type="password" required value={regConfirm} onChange={setRegConfirm} placeholder="Nhập lại mật khẩu" />

                {regError && (
                  <div className="flex items-center gap-2 bg-red-50 rounded-xl px-4 py-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
                    </svg>
                    <p className="text-xs text-red-500 font-medium">{regError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-[#1a4731] text-white font-bold rounded-xl py-3.5 disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {regLoading
                    ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo tài khoản...</span>
                    : 'Tạo tài khoản'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] text-gray-400 font-medium">hoặc thử demo</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Demo accounts */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Demo accounts</p>
          <div className="space-y-2">
            {DEMO_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => handleDemo(u.id)}
                className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
                  style={{ backgroundColor: u.color }}
                >
                  {u.initial}
                </div>
                <p className="flex-1 font-semibold text-gray-800 text-sm">{u.name}</p>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-8">GRABxUNDP Hackathon 2025</p>
      </div>
    </div>
  )
}
