import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate({ to: '/login' })
  }

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-white p-4">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 bg-white p-1 rounded" />
          <span>Admin System</span>
        </div>
        <nav className="space-y-2">
          <div className="p-2 bg-primary-dark rounded cursor-pointer">Dashboard</div>
          <div className="p-2 hover:bg-primary-dark rounded cursor-pointer">Products</div>
          <div className="p-2 hover:bg-primary-dark rounded cursor-pointer">POS</div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-500">Welcome, Admin</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 mb-2">Total Sales</h3>
            <div className="text-3xl font-bold">฿0.00</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 mb-2">Orders Today</h3>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 mb-2">Low Stock Alerts</h3>
            <div className="text-3xl font-bold text-red-500">0</div>
          </div>
        </div>
      </div>
    </div>
  )
}
