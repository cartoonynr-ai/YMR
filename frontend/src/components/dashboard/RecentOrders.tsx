// placeholder
import { Link } from '@tanstack/react-router'
import { recentOrders, type OrderChannel, type OrderStatus } from '../../data/mockDashboard'

const channelBadge: Record<OrderChannel, string> = {
  LINE: 'bg-green-100 text-green-700',
  FB: 'bg-blue-100 text-blue-700',
  POS: 'bg-slate-200 text-slate-700',
}

const statusBadge: Record<OrderStatus, string> = {
  'Awaiting payment': 'bg-[#fff3d7] text-amber-600',
  Paid: 'bg-[#e8f4ff] text-blue-600',
  Completed: 'bg-[#e6f7ff] text-green-600',
}

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        <Link
          to="/order"
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          view all history
        </Link>
      </div>

      {/* Order List */}
      <ul>
        {recentOrders.map((order) => (
          <li
            key={order.orderId}
            className="px-6 py-3.5 border-b border-gray-100"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${channelBadge[order.channel]}`}
              >
                {order.channel}
              </span>
              <span className="font-medium text-gray-900">{order.orderId}</span>
              <span className="ml-auto font-semibold text-gray-900">{order.price}</span>
            </div>
            <div className="flex items-center mt-1.5 pl-0.5">
              <span className="text-sm text-gray-500">Customer: {order.customer}</span>
              <span className={`ml-auto text-sm font-medium rounded-xl px-2 ${statusBadge[order.status]}`}>
                {order.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
