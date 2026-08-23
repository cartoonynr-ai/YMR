import { stockMovements } from '../../data/mockDashboard'

export default function StockMovements() {
  return (
    <div className="bg-[#0f172b] rounded-xl shadow-sm border border-gray-100">
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#00b6d5]">Latest stock movements</h2>
      </div>

      {/* Movement List */}
      <ul>
        {stockMovements.map((movement) => (
          <li key={movement.sku} className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{movement.sku}</span>
              <span
                className={`font-bold ${movement.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {movement.change >= 0 ? `+${movement.change}` : movement.change}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{movement.reason}</p>
            <p className="text-xs text-gray-400 mt-1">
              {movement.timestamp} · balance {movement.balance}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
