import { createFileRoute } from '@tanstack/react-router'

import Sidebar from '../components/layout/Sidebar'

export const Route = createFileRoute('/sale_history')({
  component: SaleHistoryPage,
})

const summaryData = [
  { title: 'Sales recorded', value: '5', subtitle: 'Last 3 days' },
  { title: 'Units sold', value: '15', subtitle: 'Across all receipts' },
  { title: 'Gross total', value: '฿16,500', subtitle: 'Storefront only' },
  { title: 'Average receipt', value: '฿3,300', subtitle: 'Per sale' },
]

const historyData = [
  { receipt: '#POS-4471', timestamp: '2026-08-20 10:55', items: 2, payment: 'Cash', cashier: 'Counter Staff', total: '฿680' },
  { receipt: '#POS-4470', timestamp: '2026-08-20 10:12', items: 5, payment: 'Bank transfer', cashier: 'Counter Staff', total: '฿2,810' },
  { receipt: '#POS-4469', timestamp: '2026-08-19 18:40', items: 1, payment: 'Bank transfer', cashier: 'Counter Staff', total: '฿5,900' },
  { receipt: '#POS-4468', timestamp: '2026-08-18 17:22', items: 3, payment: 'Cash', cashier: 'Counter Staff', total: '฿5,550' },
  { receipt: '#POS-4467', timestamp: '2026-08-18 15:08', items: 4, payment: 'Cash', cashier: 'Counter Staff', total: '฿1,560' },
]

function SaleHistoryPage() {
  return (
    <div className="flex h-screen w-full bg-white font-sans text-sm antialiased selection:bg-black selection:text-white">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-black">Storefront Sales History</h1>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryData.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col justify-between border border-gray-200 bg-white p-5 rounded-none shadow-sm transition-all hover:shadow-md"
              >
                <span className="text-xs uppercase tracking-wider text-[#62748e]">{item.title}</span>
                <div className="my-2 text-3xl font-light text-black">{item.value}</div>
                <span className="text-xs text-[#62748e]">{item.subtitle}</span>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <section className="border border-gray-200 bg-white rounded-none shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-black">POS receipts / ประวัติการขายหน้าร้าน</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#faf6f7] text-[11px] uppercase tracking-wider text-[#62748e]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Receipt</th>
                    <th className="px-5 py-3 font-medium">Timestamp</th>
                    <th className="px-5 py-3 font-medium text-right">Items</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Cashier</th>
                    <th className="px-5 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyData.map((row, index) => (
                    <tr 
                      key={index} 
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-medium text-black">{row.receipt}</td>
                      <td className="px-5 py-4 text-gray-600">{row.timestamp}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{row.items}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-gray-100 text-gray-800">
                          {row.payment}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{row.cashier}</td>
                      <td className="px-5 py-4 text-right font-medium text-black">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
