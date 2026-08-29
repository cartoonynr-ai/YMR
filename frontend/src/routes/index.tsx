import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Store, AlertCircle } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'

const loginSchema = z.object({
  role: z.enum(['ADMIN', 'STAFF']),
  email: z.string().min(1, { message: 'กรุณากรอกอีเมล' }).email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
  password: z.string().min(1, { message: 'กรุณากรอกรหัสผ่าน' }),
  remember_me: z.boolean(),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      if (context.auth.user?.role?.toLowerCase() === 'admin') {
        throw redirect({ to: '/dashboard' })
      } else {
        throw redirect({ to: '/pos' })
      }
    }
  },
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // โหลดค่าที่เคยจดจำไว้จาก localStorage (ถ้ามี)
  const rememberedEmail = localStorage.getItem('rememberedEmail') || ''
  const rememberedRole = (localStorage.getItem('rememberedRole') as 'ADMIN' | 'STAFF') || 'ADMIN'
  const isRemembered = !!rememberedEmail

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: rememberedRole,
      email: rememberedEmail,
      password: '',
      remember_me: isRemembered,
    },
  })

  // ไม่ต้องใช้ login จาก useAuth แล้ว เพราะ Supabase จัดการ AuthState ให้เอง

  const onSubmit = async (data: LoginFormInputs) => {
    setApiError(null)

    try {
      // 1. เรียก API Auth ของ Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      // 2. ดึงข้อมูล Role จากตาราง users
      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        if (userError) throw userError

        // ตรวจสอบว่า Role ที่เลือกตรงกับในระบบหรือไม่
        const dbRole = userData.role === 'admin' ? 'ADMIN' : 'STAFF'
        if (dbRole !== data.role) {
          await supabase.auth.signOut()
          throw new Error('ประเภทผู้ใช้งานไม่ถูกต้องกับบัญชีนี้')
        }

        // ฟังก์ชันจัดการการจำอีเมล
        const handleSuccessLogin = (path: string) => {
          if (data.remember_me) {
            localStorage.setItem('rememberedEmail', data.email)
            localStorage.setItem('rememberedRole', data.role)
          } else {
            localStorage.removeItem('rememberedEmail')
            localStorage.removeItem('rememberedRole')
          }
          navigate({ to: path })
        }

        // Login สำเร็จ
        if (dbRole === 'ADMIN') {
          handleSuccessLogin('/dashboard')
        } else {
          handleSuccessLogin('/pos')
        }
      }
    } catch (err: any) {
      setApiError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือคุณอาจเลือกประเภทผู้ใช้งานผิด')
    }
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

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 shrink-0" />
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Selection */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <label
                  className={`flex items-start p-4 border rounded-3xl cursor-pointer transition-colors ${
                    field.value === 'ADMIN' ? 'border-primary bg-primary-dark/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => field.onChange('ADMIN')}
                >
                  <div className="mr-4 mt-0.5 shrink-0">
                    <ShieldCheck className={`w-6 h-6 ${field.value === 'ADMIN' ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className={`font-medium ${field.value === 'ADMIN' ? 'text-primary' : 'text-gray-900'}`}>
                      ผู้ดูแลระบบ
                    </div>
                    <div className="text-sm text-gray-500 mt-1 ">
                      Admin จัดการสินค้า สต็อก คำสั่งซื้อ
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start p-4 border rounded-3xl cursor-pointer transition-colors ${
                    field.value === 'STAFF' ? 'border-primary bg-primary-dark/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => field.onChange('STAFF')}
                >
                  <div className="mr-4 mt-0.5 shrink-0">
                    <Store className={`w-6 h-6 ${field.value === 'STAFF' ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className={`font-medium ${field.value === 'STAFF' ? 'text-primary' : 'text-gray-900'}`}>
                      พนักงานขายหน้าร้าน
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Staff
                    </div>
                  </div>
                </label>
                {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
              </div>
            )}
          />

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (E-mail)</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your e-mail"
              className={`block w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className={`block w-full pl-4 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                  errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-sm mt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('remember_me')}
                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="ml-2 text-gray-600">จดจำการเข้าสู่ระบบ</span>
            </label>      
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors mt-6"
          >
            {isSubmitting ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}
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
