import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Minus, CreditCard, X, Trash2, Printer, Package } from 'lucide-react'
import { getProducts, type Product } from '../data/mockInventory'
import { createOrder } from '../data/mockOrderData'
import generatePayload from 'promptpay-qr'
import QRCode from 'react-qr-code'
import Sidebar from '../components/layout/Sidebar'

export const Route = createFileRoute('/pos')({
  beforeLoad: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
  component: PosPage,
})

function PosPage() {
  const [barcode, setBarcode] = useState('')
  const [items, setItems] = useState<{ id: string; name: string; price: number; qty: number; stock: number }[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [cashReceived, setCashReceived] = useState<string>('0')
  
  const [inventory, setInventory] = useState<Product[]>([])
  
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'error' | 'success'>('error')
  const [showReceipt, setShowReceipt] = useState<string | null>(null)

  const loadData = () => {
    const products = getProducts()
    setInventory(products)
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleBarcodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim()) {
      const searchLower = barcode.trim().toLowerCase()
      const found = inventory.find(p => p.sku.toLowerCase() === searchLower || p.name.toLowerCase().includes(searchLower))
      
      if (found) {
        addFromRecent({ id: found.sku, name: found.name, price: found.price, stock: found.qty })
        setBarcode('')
      } else {
        showToast('ไม่พบสินค้าในระบบ', 'error')
      }
    }
  }

  const addFromRecent = (product: {id: string, name: string, price: number, stock: number}) => {
    if (product.stock <= 0) {
      showToast('สินค้าหมดสต็อก (Out of stock)', 'error')
      return
    }

    const existing = items.find(item => item.id === product.id)
    if (existing) {
      if (existing.qty >= product.stock) {
        showToast('จำนวนสินค้าเกินสต็อกที่มี', 'error')
        return
      }
      setItems(items.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ))
    } else {
      setItems([...items, { ...product, qty: 1 }])
    }
  }

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        if (newQty < 1) return item
        if (newQty > item.stock) {
          showToast('จำนวนสินค้าเกินสต็อกที่มี', 'error')
          return item
        }
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  }

  const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0)

  useEffect(() => {
    if (total > 0) {
      setCashReceived('0')
    } else {
      setCashReceived('0')
    }
  }, [total])

  const handleSaveSale = () => {
    if (items.length === 0) {
      showToast('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ', 'error')
      return
    }

    const received = cashReceived === '' ? 0 : Number(cashReceived)
    if (paymentMethod === 'cash' && received < total) {
      showToast('ยอดเงินที่รับมาไม่เพียงพอ', 'error')
      return
    }

    const orderData = {
      channel: 'STOREFRONT',
      customerName: 'Walk-in counter',
      customerPhone: '-',
      address: '-',
      items: items.map(i => ({ sku: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: total,
      status: 'Paid',
      paymentMethod: paymentMethod === 'cash' ? 'CASH' : 'BANK TRANSFER'
    }

    const result = createOrder(orderData)
    if (result.success) {
      showToast(`บันทึกการขายสำเร็จ (Receipt: ${result.orderId})`, 'success')
      setShowReceipt(result.orderId!)
    } else {
      showToast(result.error || 'เกิดข้อผิดพลาดในการบันทึกการขาย', 'error')
    }
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-900 font-sans">
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 flex items-center gap-2 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4 ${
          toastType === 'success' ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'
        }`}>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
      
      {showReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowReceipt(null)
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6 mt-2">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">YMR Scooter</h3>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">CHONBURI</p>
              <div className="mt-4 text-xs font-medium text-gray-500 flex justify-between">
                <span>Receipt: {showReceipt}</span>
                <span>{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 py-4 my-2 space-y-3 max-h-48 overflow-auto scrollbar-hide">
               {items.map(item => (
                 <div key={item.id} className="flex justify-between text-sm">
                   <span className="text-gray-700 truncate pr-4">{item.qty}x {item.name}</span>
                   <span className="text-gray-900 font-bold">{(item.price * item.qty).toLocaleString()}</span>
                 </div>
               ))}
            </div>

            <div className="border-t border-dashed border-gray-300 py-4 my-2">
               <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-gray-500 text-sm">Total</span>
                 <span className="font-black text-gray-900 text-xl">฿{total.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
                 <span>{paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}</span>
                 <span>฿{Number(cashReceived || 0).toLocaleString()}</span>
               </div>
               {paymentMethod === 'cash' && (
                 <div className="flex justify-between text-xs text-gray-500 font-medium">
                   <span>Change</span>
                   <span>฿{Math.max(0, Number(cashReceived || 0) - total).toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Thank you for your purchase!</p>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => {
                  window.print()
                }}
                className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button 
                onClick={() => {
                  setItems([])
                  setCashReceived('0')
                  setBarcode('')
                  setShowReceipt(null)
                  loadData()
                }}
                className="flex-1 bg-[#00b6d5] hover:bg-[#0494ad] text-white font-black py-3 rounded-xl transition-colors shadow-lg shadow-cyan-500/30"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="h-20 px-8 flex items-center border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-xl font-medium text-gray-800">POS Terminal</h2>
        </header>

        {/* CONTENT LAYOUT */}
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          
          {/* LEFT PANEL (Search & Table) */}
          <div className="flex-2 flex flex-col bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-w-0 overflow-hidden">
            {/* Search Area */}
            <div className="p-6 md:p-8 border-b border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">SCANBAR CODE / SEARCH PRODUCT</label>
              
              <div className="relative">
                <input 
                  type="text" 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleBarcodeSubmit}
                  placeholder="[ | | | | | | | | ] e.g. 8850001000017"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00b6d5] px-4 py-3 outline-none transition-all placeholder:text-gray-400 font-medium"
                />
                
                {barcode.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 max-h-60 overflow-y-auto">
                    {inventory.filter(p => p.sku.toLowerCase().includes(barcode.trim().toLowerCase()) || p.name.toLowerCase().includes(barcode.trim().toLowerCase())).length > 0 ? (
                      <div className="p-1">
                        {inventory.filter(p => p.sku.toLowerCase().includes(barcode.trim().toLowerCase()) || p.name.toLowerCase().includes(barcode.trim().toLowerCase())).map(product => (
                          <button
                            key={product.sku}
                            onClick={() => { addFromRecent({id: product.sku, name: product.name, price: product.price, stock: product.qty}); setBarcode(''); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{product.name}</div>
                              <div className="text-[10px] text-gray-500 font-medium">SKU: {product.sku}</div>
                            </div>
                            <div className="ml-auto text-right shrink-0">
                              <div className="text-sm font-black text-gray-900">฿{product.price.toLocaleString()}</div>
                              <div className={`text-[9px] font-bold ${product.qty > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{product.qty} in stock</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500 font-medium">
                        ไม่พบสินค้าที่ค้นหา
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center mr-2">Quick Select:</span>
                {inventory.filter(p => p.qty > 0).slice(0, 4).map(product => (
                  <button
                    key={product.sku}
                    onClick={() => addFromRecent({id: product.sku, name: product.name, price: product.price, stock: product.qty})}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold transition-colors border border-gray-200 shrink-0 flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                      <Package className="w-3 h-3" />
                    </div>
                    {product.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 z-10">
                  <tr className="border-b-2 border-gray-100">
                    <th className="pb-4 pt-4 px-6 md:px-8 text-xs font-black text-gray-400 uppercase tracking-wider">ITEM</th>
                    <th className="pb-4 pt-4 px-6 md:px-8 text-xs font-black text-gray-400 uppercase tracking-wider text-right">UNIT</th>
                    <th className="pb-4 pt-4 px-6 md:px-8 text-xs font-black text-gray-400 uppercase tracking-wider text-center">QUANTITY</th>
                    <th className="pb-4 pt-4 px-6 md:px-8 text-xs font-black text-gray-400 uppercase tracking-wider text-right">AMOUNT</th>
                    <th className="pb-4 pt-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 md:px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{item.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-[11px] text-gray-500 font-medium">{item.id}</div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold ${item.qty >= item.stock ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {item.stock} in stock
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 md:px-8 text-right font-bold text-gray-900">
                        ฿{item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 md:px-8">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors border border-transparent"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-900">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)}
                            disabled={item.qty >= item.stock}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors border border-transparent ${item.qty >= item.stock ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 md:px-8 text-right font-black text-gray-900">
                        ฿{(item.price * item.qty).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL (Terminal / Checkout) */}
          <div className="w-95 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden flex flex-col shrink-0 p-6 md:p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-gray-900 to-gray-400"></div>
            
            {/* Terminal Header */}
            <div className="flex justify-between items-center text-gray-400 border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest block">Terminal POS-01</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Counter Staff</span>
              </div>
              <button 
                onClick={() => { setItems([]); setCashReceived('0'); setBarcode(''); showToast('ล้างตะกร้าเรียบร้อย', 'success') }}
                className="text-[10px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" /> Clear Cart
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Total */}
                <div className="flex justify-between items-end border-t border-gray-100 pt-6 mb-8">
                  <span className="text-sm font-bold text-gray-500 mb-1">Total due / ยอดรวม</span>
                  <span className="text-2xl font-black text-gray-900">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons (Dark Section) */}
              <section className="bg-[#101828] rounded-2xl p-5 text-white relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CreditCard className="w-3 h-3" />
                    Payment Method
                  </label>
                  
                  <div className="flex p-1 bg-gray-800 rounded-xl mb-6">
                    <button 
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 text-[11px] font-bold py-2.5 rounded-lg transition-all ${paymentMethod === 'cash' ? 'text-[#00b6d5] bg-[#e6f8fb] border border-[#66d4e6] shadow-md' : 'text-gray-400 hover:text-white border border-transparent'}`}
                    >
                      CASH
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('transfer')}
                      className={`flex-1 text-[11px] font-bold py-2.5 rounded-lg transition-all ${paymentMethod === 'transfer' ? 'text-[#00b6d5] bg-[#e6f8fb] border border-[#66d4e6] shadow-md' : 'text-gray-400 hover:text-white border border-transparent'}`}
                    >
                      BANK TRANSFER
                    </button>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="mb-6 space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash Received</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            ฿
                          </div>
                          <input 
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            placeholder="0"
                            className="w-full bg-gray-900 border border-gray-700 text-white text-lg rounded-xl focus:ring-2 focus:ring-[#00b6d5] focus:border-transparent block pl-8 pr-4 py-3 font-mono placeholder:text-gray-600 outline-none transition-all"
                          />
                        </div>
                      </div>
                      
                      {Number(cashReceived) >= total && total > 0 && (
                        <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                          <span className="text-xs font-bold uppercase tracking-widest">Change</span>
                          <span className="text-lg font-mono font-bold">฿{(Number(cashReceived) - total).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'transfer' && total > 0 && (
                    <div className="mb-6 flex flex-col items-center justify-center p-4 bg-white rounded-xl">
                      <div className="text-[#101828] font-bold mb-2">Scan to Pay (PromptPay)</div>
                      <QRCode value={generatePayload('0875393563', { amount: total })} size={150} />
                      <div className="mt-2 text-[#101828] font-mono font-bold text-lg">฿{total.toLocaleString()}</div>
                    </div>
                  )}
                  {paymentMethod === 'transfer' && total === 0 && (
                    <div className="mb-6 flex justify-center items-center h-37.5 bg-gray-800 rounded-xl border border-gray-700">
                      <span className="text-gray-500 text-sm font-bold">Add items to show QR Code</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleSaveSale}
                    disabled={items.length === 0}
                    className="w-full bg-white hover:bg-gray-100 text-[#101828] font-black py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgb(255,255,255,0.15)] flex justify-center items-center"
                  >
                    <span>Save sale & deduct stock</span>
                  </button>
                  
                  <div className="text-center mt-3 flex items-center justify-center gap-2 opacity-50">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Or press</span>
                    <kbd className="bg-gray-800 border border-gray-700 border-b-[3px] text-gray-300 px-2 py-0.5 rounded text-[9px] font-black tracking-wider flex items-center gap-1">
                      ENTER <span className="text-gray-500">↵</span>
                    </kbd>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default PosPage
