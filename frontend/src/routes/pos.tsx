import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Minus, LogOut } from 'lucide-react'

export const Route = createFileRoute('/pos')({
  component: POS,
})

function POS() {
  const navigate = useNavigate()
  
  const [items, setItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([])
  const [recentProducts, setRecentProducts] = useState([
    { id: 'MTL-7100-1L', name: 'Motul 7100 4T 10W-40', price: 520 },
    { id: 'PIR-DR4-180', name: 'Pirelli Diablo Rosso IV 180/55 ZR17', price: 5900 },
  ])
  const [barcode, setBarcode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')

  const addFromRecent = (product: {id: string, name: string, price: number}) => {
    const existing = items.find(item => item.id === product.id)
    if (existing) {
      setItems(items.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
    } else {
      setItems([...items, { ...product, qty: 1 }])
    }
    setRecentProducts(recentProducts.filter(p => p.id !== product.id))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate({ to: '/' })
  }

  const updateQty = (id: string, delta: number) => {
    const targetItem = items.find(item => item.id === id);
    if (!targetItem) return;

    if (targetItem.qty + delta <= 0) {
      setItems(items.filter(item => item.id !== id));
      const { qty, ...productWithoutQty } = targetItem;
      setRecentProducts([...recentProducts, productWithoutQty]);
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, qty: item.qty + delta } : item
      ));
    }
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const vat = subtotal * 0.07
  const total = subtotal + vat

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-gray-900 font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 shrink-0 bg-primary text-white flex flex-col sticky top-0 h-screen p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-1">
          <img
            src="/logo.png"
            alt="YMR Logo"
            className="w-10 h-10 rounded object-contain p-0.5"
          />
          <div>
            <div className="font-bold text-xl leading-tight">YMR</div>
            <div className="text-[11px] text-blue-200 tracking-wide">YUTH MARY CHONBURI</div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1.5">
          <span className="block p-2.5 rounded-lg cursor-pointer transition-colors bg-primary-dark font-medium">
            POS Terminal
          </span>
          <span className="block p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-primary-dark/60">
            Sale History
          </span>
        </nav>

        {/* User info */}
        <div className="mt-auto pt-4 border-t border-white/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
              S
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">salesperson</div>
              <div className="text-xs text-blue-200 truncate">xxxxx@gmail.com</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg border border-white/25 hover:bg-red-600 hover:border-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="h-20 px-8 flex items-center border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-xl font-medium text-gray-800">POS Terminal</h2>
        </header>

        {/* CONTENT LAYOUT */}
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          
          {/* LEFT PANEL (Search & Table) */}
          <div className="flex-2 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm min-w-0">
            {/* Search Area */}
            <div className="p-6 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">SCANBAR CODE / SEARCH PRODUCT</div>
              <input 
                type="text" 
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="[ | | | | | | | | ] e.g. 8850001000017"
                className="w-full p-4 border border-gray-300 rounded-md text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                {recentProducts.map(product => (
                  <button 
                    key={product.id}
                    onClick={() => addFromRecent(product)}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-mono transition-colors"
                  >
                    {product.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">ITEM</th>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">UNIT</th>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">QUANTITY</th>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 font-mono mt-0.5">{item.id}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-gray-700 font-mono">
                        ฿{item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium font-mono">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-900 font-mono">
                        ฿{(item.price * item.qty).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL (Terminal / Checkout) */}
          <div className="w-95 bg-[#0f172b] border border-gray-200 rounded-lg shadow-sm flex flex-col shrink-0 overflow-hidden">
            
            {/* Terminal Header */}
            <div className="p-6 flex justify-between items-center text-[#6d7b8f]">
              <span className="font-semibold uppercase">Terminal POS-01</span>
              <span className="text-sm uppercase">Counter Staff</span>
            </div>

            {/* Calculations */}
            <div className="p-6 space-y-4 flex-1 text-[#6d7b8f]">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-mono text-lg">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>VAT 7%</span>
                <span className="font-mono text-lg">฿{vat.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
              </div>
            </div>

            {/* Total */}
            <div className="px-6 py-3 text-center flex justify-between items-end text-white">
              <div className="text-lg mb-2 font-medium uppercase">Total due</div>
              <div className="text-4xl font-bold font-mono tracking-tight">
                ฿{total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-4 border rounded-md font-medium transition-colors ${
                    paymentMethod === 'cash' 
                      ? 'bg-[#00b6d5] text-[#0f172b] hover:bg-[#0494ad]' 
                      : 'bg-[#eeeeee25] text-[#6d7b8f] hover:bg-[#c9c9c938]'
                  }`}
                >
                  CASH
                </button>
                <button 
                  onClick={() => setPaymentMethod('transfer')}
                  className={`py-4 border rounded-md font-medium transition-colors ${
                    paymentMethod === 'transfer' 
                      ? 'bg-[#00b6d5] text-[#0f172b] hover:bg-[#0494ad]' 
                      : 'bg-[#eeeeee25] text-[#6d7b8f] hover:bg-[#c9c9c938]'
                  }`}
                >
                  transfer
                </button>
              </div>
              <button className="w-full py-4 bg-[#00b6d5] hover:bg-[#0494ad] text-[#0f172b] font-medium rounded-md shadow-sm transition-colors">
                Save sale & deduct stock
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
