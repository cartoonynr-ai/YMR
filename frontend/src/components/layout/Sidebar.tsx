import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { currentUser } from '../../data/mockDashboard'
import { useEffect, useState } from 'react'

const adminMenuItems = [
  { label: 'Dashboard', to: '/dashboard', exact: true },
  { label: 'Inventory', to: '/inventory', exact: false },
  { label: 'Order', to: '/order', exact: false },
] as const

const staffMenuItems = [
  { label: 'POS Terminal', to: '/pos', exact: true },
  { label: 'Sale History', to: '/sale_history', exact: true },
] as const

export default function Sidebar() {
  const navigate = useNavigate()
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('ADMIN')

  useEffect(() => {
    const rememberedRole = (localStorage.getItem('rememberedRole') as 'ADMIN' | 'STAFF') || 'ADMIN'
    setRole(rememberedRole)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('rememberedRole')
    navigate({ to: '/' })
  }

  const menuItems = role === 'STAFF' ? staffMenuItems : adminMenuItems

  return (
    <aside className="w-64 shrink-0 bg-primary text-white flex flex-col sticky top-0 h-screen p-4 text-base">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-1">
        <img
          src="/logo.png"
          alt="YMR Logo"
          className="w-10 h-10 rounded object-contain p-0.5"
        />
        <div>
          <div className="font-bold text-xl leading-tight">YMR Scooter</div>
          <div className="text-[11px] text-blue-200 tracking-wide">CHONBURI</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-1.5 flex flex-col">
        {menuItems.map((item) => (
          <Link 
            key={item.to} 
            to={item.to} 
            activeOptions={{ exact: item.exact }}
            className="block p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-primary-dark/60"
            activeProps={{ className: 'bg-primary-dark font-medium hover:bg-primary-dark' }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="mt-auto pt-4 border-t border-white/15">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
            {role === 'STAFF' ? 'C' : 'ว'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{role === 'STAFF' ? 'Counter Staff' : currentUser.name}</div>
            <div className="text-xs text-blue-200 truncate">{role === 'STAFF' ? 'staff@ymr.com' : currentUser.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg border border-white/25 hover:bg-red-600 hover:border-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
