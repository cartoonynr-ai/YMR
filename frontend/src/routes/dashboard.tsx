// placeholder
import { createFileRoute, redirect } from '@tanstack/react-router'
import AppLayout from '../components/layout/AppLayout'
import KpiCards from '../components/dashboard/KpiCards'
import StockCriticalityTable from '../components/dashboard/StockCriticalityTable'
import RecentOrders from '../components/dashboard/RecentOrders'
import StockMovements from '../components/dashboard/StockMovements'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
    if (context.auth.user?.role?.toLowerCase() !== 'admin') {
      throw redirect({ to: '/pos' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Dashboard Overview</h1>
      {/* KPI Cards */}
      <KpiCards />

      {/* Stock Criticality Table */}
      <div className="mt-6">
        <StockCriticalityTable />
      </div>

      {/* Recent Orders + Stock Movements */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentOrders />
        <StockMovements />
      </div>
    </AppLayout>
  )
}
