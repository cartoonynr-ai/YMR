import { Link } from '@tanstack/react-router'
import { stockCriticality, type StockStatus } from '../../data/mockDashboard'

const statusBadge: Record<StockStatus, string> = {
  'Low stock': 'bg-amber-100 text-amber-700',
  'Out of stock': 'bg-red-100 text-red-700',
}

export default function StockCriticalityTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="font-semibold text-gray-900">
          Stock criticality / สถานะสต็อกวิกฤต
        </h2>
        <Link
          to="/inventory"
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          Manage inventory
        </Link>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-gray-100 bg-gray-50/60 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-6 py-3 font-medium">Product</th>
            <th className="px-6 py-3 font-medium">Category</th>
            <th className="px-6 py-3 font-medium">Stock QTY</th>
            <th className="px-6 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {stockCriticality.map((item) => (
            <tr key={item.sku} className="border-b border-gray-100 last:border-b-0">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</div>
              </td>
              <td className="px-6 py-4 text-gray-600">{item.category}</td>
              <td className="px-6 py-4">
                <div className={`font-semibold ${item.qty === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.qty}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Threshold: {item.threshold}</div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[item.status]}`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
