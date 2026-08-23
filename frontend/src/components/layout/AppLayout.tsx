import { Link, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { currentUser } from '../../data/mockDashboard'

const menuItems = [
  { label: 'Dashboard', to: '/dashboard', exact: true },
  { label: 'Inventory', to: '/inventory', exact: false },
  { label: 'Order', to: '/order', exact: false },
] as const

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate({ to: '/' })
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-primary text-white flex flex-col sticky top-0 h-screen p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-1">
          <img
            src="/logo.png"
            alt="YMR Logo"
            className="w-10 h-10 rounded object-contain p-0.5"
          />
          <div>
            <div className="font-bold text-xl leading-tight">YMR</div>
            <div className="text-[11px] text-blue-200 tracking-wide">YUTH MARY CHONBURI</div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} activeOptions={{ exact: item.exact }}>
              {({ isActive }) => (
                <span
                  className={`block p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isActive ? 'bg-primary-dark font-medium' : 'hover:bg-primary-dark/60'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="mt-auto pt-4 border-t border-white/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
              ว
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{currentUser.name}</div>
              <div className="text-xs text-blue-200 truncate">{currentUser.email}</div>
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

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  )
}
