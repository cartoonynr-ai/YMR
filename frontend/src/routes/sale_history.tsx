import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getOrders, type Order } from '../data/mockOrderData'

import Sidebar from '../components/layout/Sidebar'

export const Route = createFileRoute('/sale_history')({
  beforeLoad: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
  component: SaleHistoryPage,
})

function SaleHistoryPage() {
  const [historyData, setHistoryData] = useState<Order[]>([])
  const [summaryData, setSummaryData] = useState([
    { title: 'Sales recorded', value: '0', subtitle: 'Last 3 days' },
    { title: 'Units sold', value: '0', subtitle: 'Across all receipts' },
    { title: 'Gross total', value: '฿0', subtitle: 'Storefront only' },
    { title: 'Average receipt', value: '฿0', subtitle: 'Per sale' },
  ])

  useEffect(() => {
    const allOrders = getOrders()
    const storefrontOrders = allOrders.filter(o => o.channel === 'STOREFRONT' || o.channel === 'POS' || o.channel === 'Walk-in')
    setHistoryData(storefrontOrders)

    const totalSales = storefrontOrders.length
    const unitsSold = storefrontOrders.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.qty, 0), 0)
    const grossTotal = storefrontOrders.reduce((sum, order) => sum + order.total, 0)
    const avgReceipt = totalSales > 0 ? grossTotal / totalSales : 0

    setSummaryData([
      { title: 'Sales recorded', value: totalSales.toString(), subtitle: 'All time' },
      { title: 'Units sold', value: unitsSold.toString(), subtitle: 'Across all receipts' },
      { title: 'Gross total', value: `฿${grossTotal.toLocaleString()}`, subtitle: 'Storefront only' },
      { title: 'Average receipt', value: `฿${avgReceipt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, subtitle: 'Per sale' },
    ])
  }, [])
  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-900 font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative min-w-0">
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-white to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-[1600px] mx-auto p-6 md:p-8 relative z-10 space-y-8">
          
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Storefront Sales History</h1>
            </div>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6"
              >
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.title}</span>
                <div className="text-3xl font-black tracking-tight text-gray-900 mb-1">{item.value}</div>
                <span className="text-[11px] font-bold text-gray-400">{item.subtitle}</span>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">POS receipts</h2>
              </div>
              <div className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                {historyData.length} records
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-150">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider">Receipt</th>
                    <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Items</th>
                    <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Payment</th>
                    <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider">Cashier</th>
                    <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historyData.map((row, index) => (
                    <tr 
                      key={index} 
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-gray-900">{row.id}</td>
                      <td className="py-4 px-4 text-[11px] font-medium text-gray-500">{row.date}</td>
                      <td className="py-4 px-4 text-center font-bold text-gray-900">{row.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-xl shadow-sm ${(row.paymentMethod || '').toLowerCase().includes('cash') ? 'bg-[#e0faec] text-[#1f956a]' : 'bg-[#e7f3ff] text-[#276ed2]'}`}>
                          {row.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Counter Staff</td>
                      <td className="py-4 px-4 text-right font-black text-gray-900">฿{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {historyData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">ไม่พบประวัติการขายหน้าร้าน</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SaleHistoryPage
