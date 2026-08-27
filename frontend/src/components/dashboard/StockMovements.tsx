import { useState, useEffect } from 'react'
import { getMovements, type StockMovement } from '../../data/mockInventory'

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    const data = getMovements()
    setMovements(data.slice(0, 5))
  }, [])

  return (
    <div className="bg-[#0f172b] rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="font-semibold text-[#00b6d5]">Latest stock movements</h2>
      </div>

      {/* Movement List */}
      <ul className="flex-1 overflow-y-auto">
        {movements.map((movement, idx) => (
          <li key={`${movement.sku}-${idx}`} className="px-6 py-4 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{movement.sku}</span>
              <span
                className={`font-bold ${movement.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {movement.change >= 0 ? `+${movement.change}` : movement.change}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{movement.reason}</p>
            <p className="text-xs text-gray-500 mt-1">
              {movement.timestamp} · balance {movement.balance}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
