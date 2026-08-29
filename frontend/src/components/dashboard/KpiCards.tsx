import { useState, useEffect } from 'react'
import { getOrders } from '../../services/orders'
import { getProducts } from '../../services/inventory'

export default function KpiCards() {
  const [kpis, setKpis] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const orders = await getOrders()
      const products = await getProducts()

      // 1. Total Sales (Paid only)
      const totalSales = orders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.total, 0)
      
      // 2. Orders vs Cancelled
      const totalOrders = orders.length
      const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length
      
      // 3. Channel breakdown
      const lineOrders = orders.filter(o => o.channel === 'LINE').length
      const fbOrders = orders.filter(o => o.channel === 'FB').length
      const posOrders = orders.filter(o => o.channel === 'POS').length

      // 4. Low stock
      const lowStockCount = products.filter(p => p.qty > 0 && p.qty <= (p.threshold || 5)).length
      const outOfStockCount = products.filter(p => p.qty === 0).length

      setKpis([
        {
          id: 'total-sales',
          title: 'Total Sales (Paid)',
          value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(totalSales),
          note: '+15% from last week',
        },
        {
          id: 'total-orders',
          title: 'Total Orders',
          value: totalOrders.toString(),
          note: `${cancelledOrders} cancelled`,
        },
        {
          id: 'orders-by-channel',
          title: 'Orders by Channel',
          value: `${lineOrders + fbOrders + posOrders}`,
          breakdown: [
            { label: 'LINE', value: lineOrders },
            { label: 'FB', value: fbOrders },
            { label: 'POS', value: posOrders },
          ],
        },
        {
          id: 'low-stock-alert',
          title: 'Inventory Alerts',
          value: `${lowStockCount + outOfStockCount} Items`,
          breakdown: [
            { label: 'Low Stock', value: lowStockCount },
            { label: 'Out of Stock', value: outOfStockCount },
          ],
        },
      ])
    }
    fetchData()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${
            kpi.id === 'low-stock-alert' && (kpi.breakdown[0].value > 0 || kpi.breakdown[1].value > 0) ? 'text-red-600' : 'text-gray-500'
          }`}>
            {kpi.title}
          </h3>
          <div className={`text-3xl font-bold ${
            kpi.id === 'low-stock-alert' && (kpi.breakdown[0].value > 0 || kpi.breakdown[1].value > 0) ? 'text-red-600' : 'text-gray-900'
          }`}>
            {kpi.value}
          </div>
          {kpi.breakdown ? (
            <p className="text-sm mt-1 text-gray-500">
              {kpi.breakdown
                .map((b: any) => `${b.label}: ${b.value}`)
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
