// placeholder
import { kpiCards } from '../../data/mockDashboard'

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {kpi.title}
          </h3>
          <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
          {kpi.breakdown ? (
            <p className="text-sm text-gray-500 mt-1">
              {kpi.breakdown
                .map((b) => `${b.label}: ${b.value}`)
                .join(' | ')}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">{kpi.note}</p>
          )}
        </div>
      ))}
    </div>
  )
}
