import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Store } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState<'admin' | 'staff'>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      setIsLoading(false)
      localStorage.setItem('token', 'dummy-token-for-ymr')
      localStorage.setItem('userRole', role)
      
      if (role === 'admin') {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/pos' })
      }
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Logo and Header */}
        <div className="flex items-center justify-center mb-2">
          <img src="/logo.png" alt="Logo" className="w-25 h-20 mr-4 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">YMR CHONBURI</h1>
            <p className="text-sm text-gray-500">ระบบจัดการอะไหล่รถจักรยานยนต์</p>
          </div>
        </div>

        <div className="mt-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 mt-1 text-[14px]">กรุณาเลือกประเภทผู้ใช้งานและกรอกข้อมูลเพื่อเข้าใช้งานระบบ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role Selection */}
          <div className="space-y-3">
            <label
              className={`flex items-start p-4 border rounded-3xl cursor-pointer transition-colors ${
                role === 'admin' ? 'border-primary bg-primary-dark/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setRole('admin')}
            >
              <div className="mr-4 mt-0.5 shrink-0">
                <ShieldCheck className={`w-6 h-6 ${role === 'admin' ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className={`font-medium ${role === 'admin' ? 'text-primary' : 'text-gray-900'}`}>
                  ผู้ดูแลระบบ
                </div>
                <div className="text-sm text-gray-500 mt-1 ">
                  Admin จัดการสินค้า สต็อก คำสั่งซื้อ
                </div>
              </div>
            </label>

            <label
              className={`flex items-start p-4 border rounded-3xl cursor-pointer transition-colors ${
                role === 'staff' ? 'border-primary bg-primary-dark/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setRole('staff')}
            >
              <div className="mr-4 mt-0.5 shrink-0">
                <Store className={`w-6 h-6 ${role === 'staff' ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className={`font-medium ${role === 'staff' ? 'text-primary' : 'text-gray-900'}`}>
                  พนักงานขายหน้าร้าน
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Staff
                </div>
              </div>
            </label>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (E-mail)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your e-mail"
              className="block w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-primary sm:text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-2xl focus:ring-primary sm:text-sm"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-end text-sm">
            <a href="#" className="text-primary hover:text-primary-dark font-medium">
              ลืมรหัสผ่าน?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors mt-6"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ
        </div>
      </div>
    </div>
  )
}
