import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { getOrders, type Order } from '../../services/orders'

const channelBadge: Record<string, string> = {
  LINE: 'bg-green-100 text-green-700',
  FB: 'bg-blue-100 text-blue-700',
  POS: 'bg-slate-200 text-slate-700',
}

const statusBadge: Record<string, string> = {
  'Awaiting payment': 'bg-[#fff3d7] text-amber-600',
  'Paid': 'bg-[#e8f4ff] text-blue-600',
  'Cancelled': 'bg-red-50 text-red-600',
}

export default function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    // get top 4 latest orders
    const fetchData = async () => {
      const orders = await getOrders()
      setRecentOrders(orders.slice(0, 4))
    }
    fetchData()
  }, [])

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
            key={order.id}
            className="px-6 py-3.5 border-b border-gray-100"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${channelBadge[order.channel] || 'bg-gray-100 text-gray-700'}`}
              >
                {order.channel}
              </span>
              <span className="font-medium text-gray-900">{order.order_number || order.id.split('-')[0]}</span>
              <span className="ml-auto font-semibold text-gray-900">
                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(order.total)}
              </span>
            </div>
            <div className="flex items-center mt-1.5 pl-0.5">
              <span className="text-sm text-gray-500">Customer: {order.customerName}</span>
              <span className={`ml-auto text-sm font-medium rounded-xl px-2 ${statusBadge[order.status] || 'bg-gray-100 text-gray-700'}`}>
                {order.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
